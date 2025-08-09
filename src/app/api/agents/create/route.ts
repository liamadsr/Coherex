import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { supabase } from '@/lib/supabase/client'
import { z } from 'zod'

// Schema for agent configuration
const AgentConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.enum(['data_processor', 'analyzer', 'chatbot', 'automation', 'custom']),
  model: z.string().optional().default('gpt-4-turbo-preview'),
  temperature: z.number().optional().default(0.7),
  maxTokens: z.number().optional().default(2000),
  systemPrompt: z.string().optional(),
  tools: z.array(z.object({
    name: z.string(),
    description: z.string(),
    parameters: z.record(z.any())
  })).optional().default([]),
  dataSources: z.array(z.string()).optional().default([]),
  schedule: z.string().nullable().optional(),
  triggers: z.array(z.object({
    type: z.enum(['webhook', 'event', 'schedule']),
    config: z.record(z.any())
  })).optional().default([]),
  outputFormat: z.enum(['text', 'json', 'markdown', 'html']).optional().default('json'),
  settings: z.record(z.any()).optional().default({})
})

export async function POST(req: NextRequest) {
  try {
    const { messages, requirements } = await req.json()
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Return a mock configuration if no API key
      const mockConfig = {
        name: "Slack Monitor Agent",
        description: requirements || "An agent that monitors and summarizes Slack messages",
        type: "analyzer" as const,
        model: "gpt-4-turbo-preview",
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: "You are a Slack monitoring agent that identifies important messages and creates daily summaries.",
        tools: [],
        dataSources: [],
        outputFormat: "markdown" as const,
        settings: {}
      }
      
      // Save to database
      const { data: agent, error: dbError } = await supabase
        .from('agents')
        .insert({
          name: mockConfig.name,
          description: mockConfig.description,
          config: mockConfig,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to save agent', details: dbError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        agent,
        config: mockConfig,
        message: `Agent "${mockConfig.name}" created successfully (using mock config - no OpenAI API key)`
      })
    }

    // Generate agent configuration from natural language
    const { text: configJson } = await generateText({
      model: openai('gpt-4-turbo-preview'),
      system: `You are an AI agent configuration builder. Based on the user's requirements, generate a valid JSON configuration for an AI agent.

The configuration should follow this structure:
{
  "name": "Agent Name",
  "description": "What the agent does",
  "type": "data_processor" | "analyzer" | "chatbot" | "automation" | "custom",
  "model": "gpt-4-turbo-preview",
  "temperature": 0.7,
  "maxTokens": 2000,
  "systemPrompt": "System instructions for the agent",
  "tools": [
    {
      "name": "tool_name",
      "description": "What the tool does",
      "parameters": {}
    }
  ],
  "dataSources": ["data_source_ids"],
  "schedule": "cron expression or null",
  "triggers": [
    {
      "type": "webhook" | "event" | "schedule",
      "config": {}
    }
  ],
  "outputFormat": "text" | "json" | "markdown" | "html",
  "settings": {}
}

Generate a configuration that best matches the user's requirements. Be specific and detailed in the systemPrompt.`,
      messages: [
        ...messages,
        {
          role: 'user',
          content: `Generate an agent configuration for: ${requirements}`
        }
      ],
      temperature: 0.3,
      maxTokens: 2000
    })

    // Parse and validate the generated configuration
    let config
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = configJson.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || [null, configJson]
      const jsonStr = jsonMatch[1] || configJson
      config = JSON.parse(jsonStr)
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse generated configuration', details: error },
        { status: 400 }
      )
    }

    // Validate configuration
    let validatedConfig
    try {
      validatedConfig = AgentConfigSchema.parse(config)
    } catch (validationError) {
      console.error('Validation error:', validationError)
      // Use config as-is if validation fails, but ensure required fields
      validatedConfig = {
        name: config.name || 'Untitled Agent',
        description: config.description || '',
        type: config.type || 'custom',
        ...config
      }
    }

    // Create agent in database
    const { data: agent, error: dbError } = await supabase
      .from('agents')
      .insert({
        name: validatedConfig.name,
        description: validatedConfig.description,
        config: validatedConfig,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save agent', details: dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      agent,
      config: validatedConfig,
      message: `Agent "${validatedConfig.name}" created successfully`
    })

  } catch (error) {
    console.error('Agent creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create agent', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}