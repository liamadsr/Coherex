import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@/lib/supabase/api-client-production'

// GET /api/preview/[token] - Get preview data (public, no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    // Use service role client for public preview access (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find preview link by token
    const { data: previewLink, error: linkError } = await supabase
      .from('preview_links')
      .select(`
        *,
        agent_version:agent_versions(
          *,
          agent:agents!agent_versions_agent_id_fkey(*)
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

// DELETE /api/preview/[token] - Revoke preview link (requires auth)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    // Use authenticated client to check user permissions
    const { supabase } = await createRouteHandlerClient(req)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Find the preview link and check ownership
    const { data: previewLink, error: linkError } = await supabase
      .from('preview_links')
      .select(`
        *,
        agent_version:agent_versions(
          agent:agents!agent_versions_agent_id_fkey(
            created_by
          )
        )
      `)
      .eq('token', token)
      .single()
    
    if (linkError || !previewLink) {
      return NextResponse.json({ error: 'Preview link not found' }, { status: 404 })
    }
    
    // Check if user owns the agent
    if (previewLink.agent_version.agent.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Revoke the link
    const { error: updateError } = await supabase
      .from('preview_links')
      .update({ 
        revoked_at: new Date().toISOString(),
        revoked_by: user.id
      })
      .eq('id', previewLink.id)
    
    if (updateError) {
      console.error('Error revoking preview link:', updateError)
      return NextResponse.json({ error: 'Failed to revoke link' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Preview link revoked successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/preview/[token]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}