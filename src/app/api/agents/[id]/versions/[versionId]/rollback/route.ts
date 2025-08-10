import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/agents/[id]/versions/[versionId]/rollback - Rollback to a previous version
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params
    const supabase = await createClient()

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

    // Call the rollback_to_version function
    const { data: newDraftId, error } = await supabase
      .rpc('rollback_to_version', { p_version_id: versionId })

    if (error) {
      console.error('Error rolling back version:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch the newly created draft version
    const { data: newDraft, error: fetchError } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', newDraftId)
      .single()

    if (fetchError) {
      console.error('Error fetching new draft:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      draftVersion: newDraft,
      message: `Created draft version ${newDraft.version_number} based on version ${version.version_number}`
    })
  } catch (error) {
    console.error('Error in POST /api/agents/[id]/versions/[versionId]/rollback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}