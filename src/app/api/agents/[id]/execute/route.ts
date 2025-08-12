import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api-client-production'
import { AgentRuntime } from '@/lib/e2b/runtime'
import { e2bClient } from '@/lib/e2b/client'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await createRouteHandlerClient(req)
    const { id: agentId } = await params
    const { input, options = {}, sessionId = null, useSession = false } = await req.json()

    // Fetch agent from database
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (fetchError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Check if agent is active
    if (agent.status !== 'active' && agent.status !== 'draft') {
      return NextResponse.json(
        { error: `Agent is ${agent.status}. Only active or draft agents can be executed.` },
        { status: 400 }
      )
    }
    
    // Handle persistent session execution
    if (useSession || sessionId || agent.execution_mode === 'persistent') {
      // Import session manager dynamically to avoid circular dependency
      const { sessionManager } = await import('@/lib/e2b/session-manager')
      
      // Get or create session
      let session = sessionId ? 
        await supabase.from('agent_sessions').select('*').eq('id', sessionId).single().then(r => r.data) :
        await sessionManager.getOrCreateSession(agent, false)
      
      if (!session) {
        return NextResponse.json(
          { error: 'Failed to get or create session' },
          { status: 500 }
        )
      }
      
      // Execute in session
      const startTime = Date.now()
      const result = await sessionManager.executeInSession(session.id, input, true)
      const duration = Date.now() - startTime
      
      return NextResponse.json({
        success: result.success,
        executionId: null, // No execution record for session-based calls
        sessionId: session.id,
        output: result.output,
        error: result.error,
        logs: result.logs,
        duration: duration,
        timestamp: new Date().toISOString(),
        mode: 'persistent'
      })
    }

    // Fetch connected data sources
    const { data: connections } = await supabase
      .from('agent_data_sources')
      .select(`
        data_source_id,
        permissions,
        data_sources (
          id,
          name,
          type,
          config,
          status
        )
      `)
      .eq('agent_id', agentId)

    // Extract data source information
    const dataSources = connections?.map((conn: any) => ({
      ...conn.data_sources,
      permissions: conn.permissions
    })) || []

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('agent_executions')
      .insert({
        agent_id: agentId,
        status: 'pending',
        input: input,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (execError || !execution) {
      return NextResponse.json(
        { error: 'Failed to create execution record' },
        { status: 500 }
      )
    }

    // Update execution status to running
    await supabase
      .from('agent_executions')
      .update({ status: 'running' })
      .eq('id', execution.id)

    try {
      // Execute agent in E2B sandbox with data source context
      const enrichedAgent = {
        ...agent,
        dataSources
      }
      const result = await AgentRuntime.execute(enrichedAgent, input, options)

      // Update execution record with results
      const completedAt = new Date().toISOString()
      const duration = new Date(completedAt).getTime() - new Date(execution.started_at!).getTime()

      // Parse output if it's from stdout logs
      let finalOutput = result.output
      let actualSuccess = result.success
      
      if (result.logs && typeof result.logs === 'object' && 'stdout' in result.logs) {
        const stdout = (result.logs as any).stdout
        if (Array.isArray(stdout) && stdout.length > 0) {
          try {
            // Try to parse the first stdout line as JSON
            const parsed = JSON.parse(stdout[0])
            finalOutput = parsed.output || parsed
            // If the parsed output indicates success, override the result success
            if (parsed.success === true) {
              actualSuccess = true
            }
          } catch (e) {
            // If not JSON, use as-is
            finalOutput = stdout.join('\n')
          }
        }
      }
      
      // SystemExit with code 0 is actually a success in Python
      if (result.error && typeof result.error === 'object') {
        const error = result.error as any
        if (error.name === 'SystemExit' && (error.value === '0' || error.value === 0)) {
          actualSuccess = true
        }
      }

      await supabase
        .from('agent_executions')
        .update({
          status: actualSuccess ? 'completed' : 'failed',
          output: finalOutput,
          logs: result.logs || [],
          duration_ms: duration,
          completed_at: completedAt
        })
        .eq('id', execution.id)

      return NextResponse.json({
        success: actualSuccess,
        executionId: execution.id,
        sessionId: null,
        output: finalOutput,
        error: actualSuccess ? undefined : result.error,
        logs: result.logs,
        duration: duration,
        timestamp: completedAt,
        mode: 'ephemeral'
      })

    } catch (execError) {
      // Update execution as failed
      await supabase
        .from('agent_executions')
        .update({
          status: 'failed',
          logs: [`Execution error: ${execError instanceof Error ? execError.message : 'Unknown error'}`],
          completed_at: new Date().toISOString()
        })
        .eq('id', execution.id)

      throw execError
    }

  } catch (error) {
    console.error('Agent execution error:', error)
    return NextResponse.json(
      {
        error: 'Failed to execute agent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get execution status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await createRouteHandlerClient(req)
    const { id: agentId } = await params
    const { searchParams } = new URL(req.url)
    const executionId = searchParams.get('executionId')
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (executionId) {
      // Get specific execution
      const { data, error } = await supabase
        .from('agent_executions')
        .select('*')
        .eq('id', executionId)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Execution not found' },
          { status: 404 }
        )
      }
      
      // Verify the execution belongs to an agent owned by the user
      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('id', data.agent_id)
        .eq('created_by', user.id)
        .single()
      
      if (!agent) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      return NextResponse.json(data)
    } else {
      // First verify the agent belongs to the user
      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('id', agentId)
        .eq('created_by', user.id)
        .single()
      
      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found or unauthorized' },
          { status: 404 }
        )
      }
      
      // Get all executions for agent
      const { data, error } = await supabase
        .from('agent_executions')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch executions' },
          { status: 500 }
        )
      }

      return NextResponse.json({ executions: data || [] })
    }
  } catch (error) {
    console.error('Fetch execution error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch execution data' },
      { status: 500 }
    )
  }
}