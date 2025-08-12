import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/agents/[id]/versions/[versionId] - Get specific version
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params
    const supabase = await createClient()

    const { data: version, error } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', versionId)
      .eq('agent_id', id)
      .single()

    if (error) {
      console.error('Error fetching version:', error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ version })
  } catch (error) {
    console.error('Error in GET /api/agents/[id]/versions/[versionId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/agents/[id]/versions/[versionId] - Update draft version
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params
    const body = await req.json()
    const supabase = await createClient()

    // Only allow updating draft versions
    const { data: existingVersion, error: checkError } = await supabase
      .from('agent_versions')
      .select('status')
      .eq('id', versionId)
      .eq('agent_id', id)
      .single()

    if (checkError || !existingVersion) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    if (existingVersion.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only update draft versions' },
        { status: 400 }
      )
    }

    // Update the version
    const { data: updatedVersion, error } = await supabase
      .from('agent_versions')
      .update({
        name: body.name,
        description: body.description,
        config: body.config,
        updated_at: new Date().toISOString()
      })
      .eq('id', versionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating version:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ version: updatedVersion })
  } catch (error) {
    console.error('Error in PUT /api/agents/[id]/versions/[versionId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id]/versions/[versionId] - Delete draft version
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params
    const supabase = await createClient()

    // Only allow deleting draft versions
    const { data: existingVersion, error: checkError } = await supabase
      .from('agent_versions')
      .select('status')
      .eq('id', versionId)
      .eq('agent_id', id)
      .single()

    if (checkError || !existingVersion) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    if (existingVersion.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only delete draft versions' },
        { status: 400 }
      )
    }

    // Delete the version
    const { error } = await supabase
      .from('agent_versions')
      .delete()
      .eq('id', versionId)

    if (error) {
      console.error('Error deleting version:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Clear draft_version_id from agent if this was the draft
    await supabase
      .from('agents')
      .update({ draft_version_id: null })
      .eq('id', id)
      .eq('draft_version_id', versionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/agents/[id]/versions/[versionId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}