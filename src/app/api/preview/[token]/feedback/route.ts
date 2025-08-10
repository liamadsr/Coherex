import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/preview/[token]/feedback - Submit feedback for a preview
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await req.json()
    const supabase = await createClient()

    // Find preview link by token
    const { data: previewLink, error: linkError } = await supabase
      .from('preview_links')
      .select('id, include_feedback, expires_at, revoked_at')
      .eq('token', token)
      .single()

    if (linkError || !previewLink) {
      return NextResponse.json({ error: 'Invalid preview link' }, { status: 404 })
    }

    // Check if link is expired
    if (new Date(previewLink.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Preview link has expired' }, { status: 410 })
    }

    // Check if link is revoked
    if (previewLink.revoked_at) {
      return NextResponse.json({ error: 'Preview link has been revoked' }, { status: 410 })
    }

    // Check if feedback is enabled
    if (!previewLink.include_feedback) {
      return NextResponse.json({ error: 'Feedback is not enabled for this preview' }, { status: 403 })
    }

    // Validate feedback data
    if (!body.rating && !body.feedback_text) {
      return NextResponse.json({ error: 'Please provide either a rating or feedback text' }, { status: 400 })
    }

    // Get client IP and user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
    const userAgent = req.headers.get('user-agent') || null

    // Create feedback record
    const { data: feedback, error: createError } = await supabase
      .from('preview_feedback')
      .insert({
        preview_link_id: previewLink.id,
        name: body.name || null,
        email: body.email || null,
        rating: body.rating || null,
        feedback_text: body.feedback_text || null,
        metadata: body.metadata || {},
        ip_address: ip,
        user_agent: userAgent
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating feedback:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      feedback,
      message: 'Thank you for your feedback!'
    })
  } catch (error) {
    console.error('Error in POST /api/preview/[token]/feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/preview/[token]/feedback - Get feedback for a preview (requires auth)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find preview link and verify ownership
    const { data: previewLink, error: linkError } = await supabase
      .from('preview_links')
      .select('id, created_by')
      .eq('token', token)
      .single()

    if (linkError || !previewLink) {
      return NextResponse.json({ error: 'Invalid preview link' }, { status: 404 })
    }

    if (previewLink.created_by !== user.id) {
      return NextResponse.json({ error: 'You do not have access to this feedback' }, { status: 403 })
    }

    // Get all feedback for this preview link
    const { data: feedback, error: fetchError } = await supabase
      .from('preview_feedback')
      .select('*')
      .eq('preview_link_id', previewLink.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching feedback:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Calculate statistics
    const stats = {
      totalFeedback: feedback.length,
      averageRating: feedback.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) / 
                     feedback.filter(f => f.rating).length || 0,
      ratingDistribution: {
        1: feedback.filter(f => f.rating === 1).length,
        2: feedback.filter(f => f.rating === 2).length,
        3: feedback.filter(f => f.rating === 3).length,
        4: feedback.filter(f => f.rating === 4).length,
        5: feedback.filter(f => f.rating === 5).length
      }
    }

    return NextResponse.json({ 
      feedback,
      stats
    })
  } catch (error) {
    console.error('Error in GET /api/preview/[token]/feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}