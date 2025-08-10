import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/agents/[id]/versions/[versionId]/publish - Publish a version
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

    if (version.status === 'production') {
      return NextResponse.json(
        { error: 'Version is already in production' },
        { status: 400 }
      )
    }

    // Call the publish_version function
    const { data, error } = await supabase
      .rpc('publish_version', { p_version_id: versionId })

    if (error) {
      console.error('Error publishing version:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch the updated version
    const { data: publishedVersion, error: fetchError } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', versionId)
      .single()

    if (fetchError) {
      console.error('Error fetching published version:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      version: publishedVersion,
      message: `Version ${version.version_number} published successfully`
    })
  } catch (error) {
    console.error('Error in POST /api/agents/[id]/versions/[versionId]/publish:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}