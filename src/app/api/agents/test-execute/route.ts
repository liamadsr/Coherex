import { NextRequest, NextResponse } from 'next/server'
import { e2bClient } from '@/lib/e2b/client'

export async function POST(req: NextRequest) {
  try {
    const { config, input } = await req.json()

    if (!config || !input) {
      return NextResponse.json(
        { error: 'Missing required fields: config and input' },
        { status: 400 }
      )
    }

    // Validate that a model is selected
    if (!config.model) {
      return NextResponse.json(
        { error: 'Please select an AI model before testing' },
        { status: 400 }
      )
    }

    // Generate a temporary agent ID for the test execution
    const tempAgentId = `test-${Date.now()}`

    // Create agent configuration matching the expected format
    const agentConfig = {
      name: config.name || 'Test Agent',
      type: config.type || 'chatbot',
      model: config.model,
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2000,
      systemPrompt: config.systemPrompt || 'You are a helpful AI assistant.'
    }

    // Get environment variables for the model
    const envVars: Record<string, string> = {}
    if (config.model.startsWith('gpt')) {
      if (process.env.OPENAI_API_KEY) {
        envVars.OPENAI_API_KEY = process.env.OPENAI_API_KEY
      } else {
        return NextResponse.json(
          { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' },
          { status: 500 }
        )
      }
    } else if (config.model.startsWith('claude')) {
      if (process.env.ANTHROPIC_API_KEY) {
        envVars.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
      } else {
        return NextResponse.json(
          { error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment variables.' },
          { status: 500 }
        )
      }
    }

    // Execute the agent with E2B
    const result = await e2bClient.executeAgent(
      tempAgentId,
      agentConfig,
      input,
      envVars
    )

    if (!result.success) {
      console.error('Test execution failed:', result.error)
      return NextResponse.json(
        { 
          error: 'Failed to execute test agent',
          details: result.error 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      output: result.output,
      logs: result.logs,
      executionTime: result.executionTime
    })

  } catch (error) {
    console.error('Test execution error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error during test execution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}