import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// POST /api/agents/[id]/versions/[versionId]/preview - Generate preview link
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params
    const body = await req.json()
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the version exists and belongs to this agent
    const { data: version, error: checkError } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', versionId)
      .eq('agent_id', id)
      .single()

    if (checkError || !version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')

    // Hash password if provided
    let passwordHash = null
    if (body.password) {
      const encoder = new TextEncoder()
      const data = encoder.encode(body.password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      passwordHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    }

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + (body.expirationHours || 72))

    // Create preview link
    const { data: previewLink, error: createError } = await supabase
      .from('preview_links')
      .insert({
        agent_version_id: versionId,
        token,
        expires_at: expiresAt.toISOString(),
        password_hash: passwordHash,
        max_conversations: body.maxConversations || 100,
        include_feedback: body.includeFeedback !== false,
        created_by: user.id
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating preview link:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Generate the full URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host')}`
    const previewUrl = `${baseUrl}/preview/${token}`

    return NextResponse.json({
      success: true,
      previewLink: {
        ...previewLink,
        url: previewUrl
      },
      message: 'Preview link generated successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/agents/[id]/versions/[versionId]/preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/agents/[id]/versions/[versionId]/preview - List preview links for a version
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { versionId } = await params
    const supabase = await createClient()

    // Get all preview links for this version
    const { data: previewLinks, error } = await supabase
      .from('preview_links')
      .select('*')
      .eq('agent_version_id', versionId)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching preview links:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add full URLs to each link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host')}`
    
    const linksWithUrls = previewLinks.map(link => ({
      ...link,
      url: `${baseUrl}/preview/${link.token}`,
      isExpired: new Date(link.expires_at) < new Date(),
      isActive: !link.revoked_at && new Date(link.expires_at) > new Date()
    }))

    return NextResponse.json({ previewLinks: linksWithUrls })
  } catch (error) {
    console.error('Error in GET /api/agents/[id]/versions/[versionId]/preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}