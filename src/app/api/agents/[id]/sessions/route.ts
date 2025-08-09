import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { sessionManager } from '@/lib/e2b/session-manager'

// GET - Get active sessions for an agent
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    
    const { data: sessions, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: sessions || []
    })
  } catch (error) {
    console.error('Fetch sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// POST - Create a new session
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const { forceNew = false } = await req.json()
    
    // Get agent details
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()
    
    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Check execution mode
    if (agent.execution_mode === 'ephemeral') {
      return NextResponse.json(
        { error: 'Cannot create persistent session for ephemeral agent' },
        { status: 400 }
      )
    }
    
    // Get or create session
    const session = await sessionManager.getOrCreateSession(agent, forceNew)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: session
    })
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

// DELETE - Stop all sessions for an agent
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    
    // Get all active sessions
    const { data: sessions } = await supabase
      .from('agent_sessions')
      .select('*')
      .eq('agent_id', agentId)
      .in('status', ['active', 'idle', 'hibernated'])
    
    if (sessions) {
      for (const session of sessions) {
        await sessionManager.stopSession(session.id)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Stopped ${sessions?.length || 0} sessions`
    })
  } catch (error) {
    console.error('Stop sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to stop sessions' },
      { status: 500 }
    )
  }
}