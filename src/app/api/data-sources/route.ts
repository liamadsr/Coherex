import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// Helper to format time ago (matches mock format)
function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diff = now.getTime() - past.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
  return past.toLocaleDateString()
}

// GET /api/data-sources - List all data sources
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('data_sources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch data sources', details: error.message },
        { status: 500 }
      )
    }

    // Transform to match mock structure exactly
    const transformedData = (data || []).map(source => ({
      id: source.id,
      name: source.name,
      type: source.type,
      url: source.url,
      connection: source.connection,
      repository: source.repository,
      location: source.location,
      space: source.space,
      description: source.description,
      documents: source.documents || 0,
      lastSync: source.last_sync ? formatTimeAgo(source.last_sync) : 'Never',
      nextSync: source.next_sync || 'Not scheduled',
      status: source.status,
      size: source.size || '0 MB',
      syncFrequency: source.sync_frequency || 'Manual',
      createdAt: source.created_at ? new Date(source.created_at).toISOString().split('T')[0] : '',
      owner: source.owner || 'System'
    }))

    return NextResponse.json({
      dataSources: transformedData,
      total: transformedData.length
    })
  } catch (error) {
    console.error('Error fetching data sources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    )
  }
}

// POST /api/data-sources - Create a new data source
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Use proper database columns (after migration is applied)
    const insertData: any = {
      name: body.name,
      type: body.type,
      description: body.description,
      url: body.url,
      connection: body.connection,
      repository: body.repository,
      location: body.location,
      space: body.space,
      documents: body.documents || 0,
      last_sync: body.lastSync ? new Date() : null,
      next_sync: body.nextSync,
      size: body.size || '0 MB',
      sync_frequency: body.syncFrequency || 'Manual',
      owner: body.owner || 'System',
      config: body.config || {},
      status: body.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Remove undefined fields
    Object.keys(insertData).forEach(key => 
      insertData[key] === undefined && delete insertData[key]
    )

    const { data, error } = await supabase
      .from('data_sources')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create data source', details: error.message },
        { status: 500 }
      )
    }

    // Transform response to match mock structure
    const transformedData = {
      id: data.id,
      name: data.name,
      type: data.type,
      url: data.url,
      connection: data.connection,
      repository: data.repository,
      location: data.location,
      space: data.space,
      description: data.description,
      documents: data.documents || 0,
      lastSync: data.last_sync ? formatTimeAgo(data.last_sync) : 'Never',
      nextSync: data.next_sync || 'Not scheduled',
      status: data.status,
      size: data.size || '0 MB',
      syncFrequency: data.sync_frequency || 'Manual',
      createdAt: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : '',
      owner: data.owner || 'System'
    }

    return NextResponse.json({
      success: true,
      dataSource: transformedData,
      message: `Data source "${data.name}" created successfully`
    })
  } catch (error) {
    console.error('Error creating data source:', error)
    return NextResponse.json(
      { error: 'Failed to create data source' },
      { status: 500 }
    )
  }
}