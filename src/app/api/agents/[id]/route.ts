import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// GET - Fetch single agent
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Transform to match mock structure exactly
    const transformedAgent = {
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
      userId: agent.user_id
    }

    return NextResponse.json({
      success: true,
      data: transformedAgent
    })
  } catch (error) {
    console.error('Fetch agent error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    )
  }
}

// PUT - Update agent
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await req.json()

    // Don't allow direct ID updates
    delete updates.id

    // Map mock field names to database columns
    const dbUpdates: any = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.email !== undefined) dbUpdates.email = updates.email
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.personality !== undefined) dbUpdates.personality = updates.personality
    if (updates.capabilities !== undefined) dbUpdates.capabilities = updates.capabilities
    if (updates.channels !== undefined) dbUpdates.channels = updates.channels
    if (updates.integrations !== undefined) dbUpdates.integrations = updates.integrations
    if (updates.knowledgeSources !== undefined) dbUpdates.knowledge_sources = updates.knowledgeSources
    if (updates.model !== undefined) dbUpdates.model = updates.model
    if (updates.temperature !== undefined) dbUpdates.temperature = updates.temperature
    if (updates.maxTokens !== undefined) dbUpdates.max_tokens = updates.maxTokens
    if (updates.systemPrompt !== undefined) dbUpdates.system_prompt = updates.systemPrompt
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar
    if (updates.metrics !== undefined) dbUpdates.metrics = updates.metrics
    if (updates.organizationId !== undefined) dbUpdates.organization_id = updates.organizationId
    if (updates.userId !== undefined) dbUpdates.user_id = updates.userId
    if (updates.config !== undefined) dbUpdates.config = updates.config

    // Increment version if config is being updated
    if (dbUpdates.config) {
      const { data: currentAgent } = await supabase
        .from('agents')
        .select('version')
        .eq('id', id)
        .single()
      
      dbUpdates.version = (currentAgent?.version || 1) + 1
    }

    const { data: agent, error } = await supabase
      .from('agents')
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update agent', details: error.message },
        { status: 500 }
      )
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
      userId: agent.user_id
    }

    return NextResponse.json({
      success: true,
      data: transformedAgent
    })
  } catch (error) {
    console.error('Update agent error:', error)
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    )
  }
}

// DELETE - Delete agent
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete agent', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully'
    })
  } catch (error) {
    console.error('Delete agent error:', error)
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}

// PATCH - Update agent status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await req.json()

    if (!['draft', 'active', 'inactive', 'training', 'error', 'paused', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const { data: agent, error } = await supabase
      .from('agents')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update agent status', details: error.message },
        { status: 500 }
      )
    }

    // Transform response to match mock structure
    const transformedAgent = {
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
      userId: agent.user_id
    }

    return NextResponse.json({
      success: true,
      data: transformedAgent,
      message: `Agent status updated to ${status}`
    })
  } catch (error) {
    console.error('Update agent status error:', error)
    return NextResponse.json(
      { error: 'Failed to update agent status' },
      { status: 500 }
    )
  }
}