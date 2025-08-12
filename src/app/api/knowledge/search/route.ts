import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api-client-production'

// POST - Search knowledge documents
export async function POST(req: NextRequest) {
  try {
    const { supabase } = await createRouteHandlerClient(req)
    const { query, dataSourceIds, limit = 10 } = await req.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Build the search query
    let searchQuery = supabase
      .from('knowledge_documents')
      .select('*')

    // Filter by data sources if specified
    if (dataSourceIds && dataSourceIds.length > 0) {
      searchQuery = searchQuery.in('data_source_id', dataSourceIds)
    }

    // Perform text search
    searchQuery = searchQuery
      .textSearch('content', query)
      .limit(limit)

    const { data: documents, error } = await searchQuery

    if (error) {
      // If text search fails, fall back to simple pattern matching
      const { data: fallbackDocs, error: fallbackError } = await supabase
        .from('knowledge_documents')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(limit)

      if (fallbackError) {
        return NextResponse.json(
          { error: 'Search failed', details: fallbackError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        results: fallbackDocs || [],
        count: fallbackDocs?.length || 0,
        searchType: 'pattern'
      })
    }

    return NextResponse.json({
      results: documents || [],
      count: documents?.length || 0,
      searchType: 'fulltext'
    })
  } catch (error) {
    console.error('Knowledge search error:', error)
    return NextResponse.json(
      { error: 'Failed to search knowledge base' },
      { status: 500 }
    )
  }
}

// GET - Get knowledge document by ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const documentId = searchParams.get('id')
    const dataSourceId = searchParams.get('dataSourceId')

    if (documentId) {
      // Get specific document
      const { data: document, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (error || !document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(document)
    } else if (dataSourceId) {
      // Get all documents for a data source
      const { data: documents, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .eq('data_source_id', dataSourceId)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch documents', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        documents: documents || [],
        count: documents?.length || 0
      })
    } else {
      // Get recent documents
      const { data: documents, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch documents', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        documents: documents || [],
        count: documents?.length || 0
      })
    }
  } catch (error) {
    console.error('Knowledge fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge documents' },
      { status: 500 }
    )
  }
}