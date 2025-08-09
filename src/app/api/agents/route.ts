import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// GET - List all agents
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('agents')
      .select('*', { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: agents, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch agents', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      agents: agents || [],
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Fetch agents error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}

// POST - Create new agent
export async function POST(req: NextRequest) {
  try {
    const agentData = await req.json()

    // Ensure required fields
    if (!agentData.name) {
      return NextResponse.json(
        { error: 'Agent name is required' },
        { status: 400 }
      )
    }

    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        name: agentData.name,
        description: agentData.description || '',
        config: agentData.config || {},
        status: agentData.status || 'draft',
        version: 1
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create agent', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      agent,
      message: 'Agent created successfully'
    })
  } catch (error) {
    console.error('Create agent error:', error)
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}