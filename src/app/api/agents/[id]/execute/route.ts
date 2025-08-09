import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { AgentRuntime } from '@/lib/e2b/runtime'
import { e2bClient } from '@/lib/e2b/client'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const { input, options = {} } = await req.json()

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
      if (result.logs && typeof result.logs === 'object' && 'stdout' in result.logs) {
        const stdout = (result.logs as any).stdout
        if (Array.isArray(stdout) && stdout.length > 0) {
          try {
            // Try to parse the first stdout line as JSON
            const parsed = JSON.parse(stdout[0])
            finalOutput = parsed.output || parsed
          } catch (e) {
            // If not JSON, use as-is
            finalOutput = stdout.join('\n')
          }
        }
      }

      await supabase
        .from('agent_executions')
        .update({
          status: result.success ? 'completed' : 'failed',
          output: finalOutput,
          logs: result.logs || [],
          duration_ms: duration,
          completed_at: completedAt
        })
        .eq('id', execution.id)

      return NextResponse.json({
        success: result.success,
        executionId: execution.id,
        output: finalOutput,
        error: result.error,
        logs: result.logs,
        duration: duration,
        timestamp: completedAt
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
    const { id: agentId } = await params
    const { searchParams } = new URL(req.url)
    const executionId = searchParams.get('executionId')

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

      return NextResponse.json(data)
    } else {
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