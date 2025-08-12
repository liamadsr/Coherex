import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api-client-production'
import { sanitizePostgrestQuery } from '@/lib/utils/query-sanitizer'

// GET - List all agents for authenticated user
export async function GET(req: NextRequest) {
  try {
    // Use authenticated client with proper cookie handling
    const { supabase } = await createRouteHandlerClient(req)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .eq('created_by', user.id)  // Filter by authenticated user

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      // Sanitize the search query to prevent PostgREST injection
      const sanitizedSearch = sanitizePostgrestQuery(search)
      query = query.or(`name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`)
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: agents, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch agents', details: error.message },
        { status: 500 }
      )
    }

    // Transform to match mock structure exactly
    const transformedAgents = (agents || []).map(agent => ({
      id: agent.id,
      name: agent.name,
      email: agent.email || `${agent.name.toLowerCase().replace(/\s+/g, '.')}@coherex.ai`,
      description: agent.description,
      status: agent.status,
      personality: agent.personality || [],
      capabilities: agent.capabilities || [],
      channels: agent.channels || [],
      integrations: agent.integrations || [],
      knowledgeSources: agent.knowledge_sources || [],
      model: agent.model || 'gpt-4',
      temperature: agent.temperature || 0.7,
      maxTokens: agent.max_tokens || 2000,
      systemPrompt: agent.system_prompt || '',
      avatar: agent.avatar || '🤖',
      metrics: agent.metrics || {
        conversationsHandled: 0,
        averageResponseTime: '0s',
        satisfactionScore: 0,
        accuracyScore: 0,
        uptime: 100,
        totalMessages: 0,
        successfulResolutions: 0
      },
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
      organizationId: agent.organization_id,
      userId: agent.user_id,
      // Include version IDs for version management
      current_version_id: agent.current_version_id,
      draft_version_id: agent.draft_version_id
    }))

    return NextResponse.json({
      success: true,
      data: transformedAgents,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Fetch agents error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}

// POST - Create new agent
export async function POST(req: NextRequest) {
  try {
    // Use authenticated client with proper cookie handling
    const { supabase } = await createRouteHandlerClient(req)
    const agentData = await req.json()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Ensure required fields
    if (!agentData.name) {
      return NextResponse.json(
        { error: 'Agent name is required' },
        { status: 400 }
      )
    }

    // Insert with all fields matching mock structure
    const insertData = {
      name: agentData.name,
      email: agentData.email || `${agentData.name.toLowerCase().replace(/\s+/g, '.')}@coherex.ai`,
      description: agentData.description || '',
      status: agentData.status || 'training',
      execution_mode: agentData.execution_mode || 'ephemeral',
      personality: agentData.personality || [],
      capabilities: agentData.capabilities || [],
      channels: agentData.channels || [],
      integrations: agentData.integrations || [],
      knowledge_sources: agentData.knowledgeSources || [],
      model: agentData.model || 'gpt-4',
      temperature: agentData.temperature || 0.7,
      max_tokens: agentData.maxTokens || 2000,
      system_prompt: agentData.systemPrompt || '',
      avatar: agentData.avatar || '🤖',
      metrics: {
        conversationsHandled: 0,
        averageResponseTime: '0s',
        satisfactionScore: 0,
        accuracyScore: 0,
        uptime: 100,
        totalMessages: 0,
        successfulResolutions: 0
      },
      organization_id: agentData.organizationId,
      user_id: agentData.userId,
      created_by: user.id,  // Set the created_by field to the authenticated user
      config: agentData.config || {},
      version: 1
    }

    const { data: agent, error } = await supabase
      .from('agents')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create agent', details: error.message },
        { status: 500 }
      )
    }

    // Create version 1 for the new agent
    const versionData = {
      agent_id: agent.id,
      version_number: 1,
      status: agent.status === 'draft' ? 'draft' : 'production',
      name: agent.name,
      description: agent.description,
      config: {
        model: agent.model,
        temperature: agent.temperature,
        maxTokens: agent.max_tokens,
        systemPrompt: agent.system_prompt,
        personality: agent.personality,
        capabilities: agent.capabilities,
        channels: agent.channels,
        integrations: agent.integrations,
        knowledgeSources: agent.knowledge_sources,
        email: agent.email,
        avatar: agent.avatar,
        executionMode: agent.execution_mode,
        config: agent.config
      },
      created_by: user.id,
      published_at: agent.status !== 'draft' ? new Date().toISOString() : null
    }

    const { data: version, error: versionError } = await supabase
      .from('agent_versions')
      .insert(versionData)
      .select()
      .single()

    if (versionError) {
      console.error('Failed to create initial version:', versionError)
      // Don't fail the whole operation, but log it
    } else {
      // Update agent with version references
      const updateData: any = {}
      if (agent.status === 'draft') {
        updateData.draft_version_id = version.id
      } else {
        updateData.current_version_id = version.id
      }
      
      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('agents')
          .update(updateData)
          .eq('id', agent.id)
      }
    }

    // Transform response to match mock structure
    const transformedAgent = {
      id: agent.id,
      name: agent.name,
      email: agent.email,
      description: agent.description,
      status: agent.status,
      personality: agent.personality || [],
      capabilities: agent.capabilities || [],
      channels: agent.channels || [],
      integrations: agent.integrations || [],
      knowledgeSources: agent.knowledge_sources || [],
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.max_tokens,
      systemPrompt: agent.system_prompt,
      avatar: agent.avatar,
      metrics: agent.metrics,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
      organizationId: agent.organization_id,
      userId: agent.user_id,
      // Include version IDs
      current_version_id: agent.status !== 'draft' && version ? version.id : null,
      draft_version_id: agent.status === 'draft' && version ? version.id : null
    }

    return NextResponse.json({
      success: true,
      agent: transformedAgent,  // Frontend expects 'agent' not 'data'
      data: transformedAgent  // Keep for backwards compatibility
    })
  } catch (error) {
    console.error('Create agent error:', error)
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}