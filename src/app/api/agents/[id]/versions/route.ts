import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/agents/[id]/versions - List all versions for an agent
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify user owns the agent
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('id', id)
      .eq('created_by', user.id)
      .single()
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or unauthorized' }, { status: 404 })
    }

    // Get all versions for this agent
    const { data: versions, error } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('agent_id', id)
      .order('version_number', { ascending: false })

    if (error) {
      console.error('Error fetching versions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Error in GET /api/agents/[id]/versions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/agents/[id]/versions - Create a new draft version
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify user owns the agent
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('id', id)
      .eq('created_by', user.id)
      .single()
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or unauthorized' }, { status: 404 })
    }

    // Call the create_draft_version function
    const { data, error } = await supabase
      .rpc('create_draft_version', { p_agent_id: id })

    if (error) {
      console.error('Error creating draft version:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch the newly created version
    const { data: newVersion, error: fetchError } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', data)
      .single()

    if (fetchError) {
      console.error('Error fetching new version:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json({ version: newVersion }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/agents/[id]/versions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}