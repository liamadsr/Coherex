import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

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

    return NextResponse.json({
      dataSources: data || [],
      total: data?.length || 0
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
    
    const { data, error } = await supabase
      .from('data_sources')
      .insert({
        name: body.name,
        type: body.type,
        config: body.config || {},
        description: body.description,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create data source', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      dataSource: data,
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