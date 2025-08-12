import { NextRequest, NextResponse } from 'next/server'
import { e2bClient } from '@/lib/e2b/client'

export async function POST(req: NextRequest) {
  try {
    const { config, input, sessionId, conversationHistory } = await req.json()
    
    console.log('Test execution request:', {
      config,
      input,
      sessionId,
      conversationHistory: conversationHistory?.length || 0,
      executionMode: config?.executionMode
    })

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

    // Use sessionId for persistent mode to reuse sandbox, otherwise generate temp ID
    const agentId = config.executionMode === 'persistent' && sessionId 
      ? sessionId 
      : `test-${Date.now()}`

    // Build system prompt with conversation history for persistent mode
    let effectiveInput = input
    let systemPrompt = config.systemPrompt || 'You are a helpful AI assistant.'
    
    if (config.executionMode === 'persistent' && conversationHistory && conversationHistory.length > 0) {
      // Include conversation history in the prompt for context
      const historyText = conversationHistory.map((msg: any) => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n')
      
      effectiveInput = `Previous conversation:\n${historyText}\n\nUser: ${input}`
    }
    
    // Create agent configuration matching the expected format
    const agentConfig = {
      name: config.name || 'Test Agent',
      type: config.type || 'chatbot',
      model: config.model,
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2000,
      systemPrompt: systemPrompt,
      executionMode: config.executionMode || 'ephemeral'
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

    // Check if E2B is configured
    if (!process.env.E2B_API_KEY) {
      console.warn('E2B_API_KEY not configured, using mock execution')
      // Fall back to mock execution if E2B is not configured
      // This allows testing without E2B setup
    }

    // Execute the agent with E2B
    const result = await e2bClient.executeAgent(
      agentId,
      agentConfig,
      effectiveInput,
      envVars
    )

    if (!result.success) {
      console.error('Test execution failed:', result.error)
      console.error('Agent config:', agentConfig)
      console.error('Original input:', input)
      console.error('Effective input:', effectiveInput)
      
      // Provide more helpful error message
      let errorMessage = 'Failed to execute test agent'
      const errorString = typeof result.error === 'string' ? result.error : String(result.error || '')
      if (errorString.includes('E2B_API_KEY')) {
        errorMessage = 'E2B sandbox service not configured. The agent returned a simulated response.'
      } else if (errorString.includes('OPENAI_API_KEY') || errorString.includes('ANTHROPIC_API_KEY')) {
        errorMessage = 'API key for the selected model is not configured'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: result.error,
          output: result.output // Still return mock output if available
        },
        { status: 200 } // Return 200 so frontend can handle gracefully
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
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Internal server error during test execution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}