import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/preview/[token] - Get preview data (public, no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Find preview link by token
    const { data: previewLink, error: linkError } = await supabase
      .from('preview_links')
      .select(`
        *,
        agent_version:agent_versions(
          *,
          agent:agents(*)
        )
      `)
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

    // Check conversation count limit
    if (previewLink.conversation_count >= previewLink.max_conversations) {
      return NextResponse.json({ error: 'Preview link has reached its conversation limit' }, { status: 429 })
    }

    // Update last accessed timestamp
    await supabase
      .from('preview_links')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', previewLink.id)

    // Return preview data (without sensitive information)
    return NextResponse.json({
      preview: {
        id: previewLink.id,
        agentVersion: {
          id: previewLink.agent_version.id,
          name: previewLink.agent_version.name,
          description: previewLink.agent_version.description,
          config: previewLink.agent_version.config,
          versionNumber: previewLink.agent_version.version_number
        },
        agent: {
          id: previewLink.agent_version.agent.id,
          name: previewLink.agent_version.agent.name
        },
        requiresPassword: !!previewLink.password_hash,
        includeFeedback: previewLink.include_feedback,
        conversationsRemaining: previewLink.max_conversations - previewLink.conversation_count,
        expiresAt: previewLink.expires_at
      }
    })
  } catch (error) {
    console.error('Error in GET /api/preview/[token]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}