import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { sessionManager } from '@/lib/e2b/session-manager'

// GET - Get session details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    
    const { data: session, error } = await supabase
      .from('agent_sessions')
      .select(`
        *,
        session_activities (
          id,
          activity_type,
          created_at,
          duration_ms
        )
      `)
      .eq('id', sessionId)
      .single()
    
    if (error || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: session
    })
  } catch (error) {
    console.error('Fetch session error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

// POST - Execute in session
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { supabase } = await createRouteHandlerClient(req)
    const { sessionId } = await params
    const { input, includeContext = true } = await req.json()
    
    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      )
    }
    
    // Check session exists and is active
    const { data: session } = await supabase
      .from('agent_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    if (session.status === 'stopped') {
      return NextResponse.json(
        { error: 'Session is stopped' },
        { status: 400 }
      )
    }
    
    // Resume if hibernated
    if (session.status === 'hibernated') {
      await sessionManager.resumeSession(session)
    }
    
    // Execute in session
    const startTime = Date.now()
    const result = await sessionManager.executeInSession(sessionId, input, includeContext)
    const duration = Date.now() - startTime
    
    return NextResponse.json({
      success: result.success,
      output: result.output,
      sessionId: sessionId,
      duration: duration,
      includeContext: includeContext,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Session execution error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to execute in session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH - Update session status (hibernate/resume/stop)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const { action } = await req.json()
    
    if (!['hibernate', 'resume', 'stop'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be hibernate, resume, or stop' },
        { status: 400 }
      )
    }
    
    // Get session
    const { data: session } = await supabase
      .from('agent_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    // Perform action
    switch (action) {
      case 'hibernate':
        await sessionManager.hibernateSession(sessionId)
        break
      case 'resume':
        await sessionManager.resumeSession(session)
        break
      case 'stop':
        await sessionManager.stopSession(sessionId)
        break
    }
    
    // Get updated session
    const { data: updatedSession } = await supabase
      .from('agent_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    
    return NextResponse.json({
      success: true,
      data: updatedSession
    })
  } catch (error) {
    console.error('Update session error:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

// DELETE - Stop a specific session
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    
    await sessionManager.stopSession(sessionId)
    
    return NextResponse.json({
      success: true,
      message: 'Session stopped successfully'
    })
  } catch (error) {
    console.error('Stop session error:', error)
    return NextResponse.json(
      { error: 'Failed to stop session' },
      { status: 500 }
    )
  }
}