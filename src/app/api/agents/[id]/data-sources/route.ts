import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// GET - List data sources connected to an agent
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params

    // Get all data source connections for this agent
    const { data: connections, error } = await supabase
      .from('agent_data_sources')
      .select('data_source_id, permissions')
      .eq('agent_id', agentId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch data source connections', details: error.message },
        { status: 500 }
      )
    }

    // Extract just the IDs for easy checking
    const dataSourceIds = connections?.map(c => c.data_source_id) || []

    // Optionally, fetch full data source details
    if (dataSourceIds.length > 0) {
      const { data: dataSources, error: dsError } = await supabase
        .from('data_sources')
        .select('*')
        .in('id', dataSourceIds)

      if (!dsError) {
        return NextResponse.json({
          dataSourceIds,
          dataSources,
          connections
        })
      }
    }

    return NextResponse.json({
      dataSourceIds,
      dataSources: [],
      connections: connections || []
    })
  } catch (error) {
    console.error('Error fetching agent data sources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    )
  }
}

// POST - Connect a data source to an agent
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const { dataSourceId, permissions } = await req.json()

    if (!dataSourceId) {
      return NextResponse.json(
        { error: 'Data source ID is required' },
        { status: 400 }
      )
    }

    // Create connection
    const { data, error } = await supabase
      .from('agent_data_sources')
      .insert({
        agent_id: agentId,
        data_source_id: dataSourceId,
        permissions: permissions || { read: true, write: false },
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      // Check if it's a duplicate key error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Data source is already connected to this agent' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to connect data source', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      connection: data,
      message: 'Data source connected successfully'
    })
  } catch (error) {
    console.error('Error connecting data source:', error)
    return NextResponse.json(
      { error: 'Failed to connect data source' },
      { status: 500 }
    )
  }
}

// DELETE - Disconnect a data source from an agent
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const { dataSourceId } = await req.json()

    if (!dataSourceId) {
      return NextResponse.json(
        { error: 'Data source ID is required' },
        { status: 400 }
      )
    }

    // Remove connection
    const { error } = await supabase
      .from('agent_data_sources')
      .delete()
      .eq('agent_id', agentId)
      .eq('data_source_id', dataSourceId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to disconnect data source', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Data source disconnected successfully'
    })
  } catch (error) {
    console.error('Error disconnecting data source:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect data source' },
      { status: 500 }
    )
  }
}

// PATCH - Update data source permissions
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const { dataSourceId, permissions } = await req.json()

    if (!dataSourceId || !permissions) {
      return NextResponse.json(
        { error: 'Data source ID and permissions are required' },
        { status: 400 }
      )
    }

    // Update permissions
    const { data, error } = await supabase
      .from('agent_data_sources')
      .update({ permissions })
      .eq('agent_id', agentId)
      .eq('data_source_id', dataSourceId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update permissions', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      connection: data,
      message: 'Permissions updated successfully'
    })
  } catch (error) {
    console.error('Error updating permissions:', error)
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    )
  }
}