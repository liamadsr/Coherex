import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Create a new draft agent with minimal required fields
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        name: body.name || 'Untitled Agent',
        description: body.description || '',
        config: {
          ...body,
          type: body.type || 'custom',
          model: body.model || 'gpt-4-turbo-preview',
          temperature: body.temperature ?? 0.7,
          maxTokens: body.maxTokens ?? 2000,
          outputFormat: body.outputFormat || 'json',
          tools: body.tools || [],
          dataSources: body.dataSources || [],
          triggers: body.triggers || [],
          settings: body.settings || {}
        },
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create draft', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      agent,
      message: 'Draft created successfully'
    })
  } catch (error) {
    console.error('Draft creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create draft', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { agentId, ...updates } = await req.json()
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    // Update the existing draft
    const { data: agent, error } = await supabase
      .from('agents')
      .update({
        name: updates.name,
        description: updates.description,
        config: {
          ...updates,
          type: updates.type || 'custom',
          model: updates.model || 'gpt-4-turbo-preview',
          temperature: updates.temperature ?? 0.7,
          maxTokens: updates.maxTokens ?? 2000,
          outputFormat: updates.outputFormat || 'json',
          tools: updates.tools || [],
          dataSources: updates.dataSources || [],
          triggers: updates.triggers || [],
          settings: updates.settings || {}
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update draft', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      agent,
      message: 'Draft saved'
    })
  } catch (error) {
    console.error('Draft update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update draft', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}