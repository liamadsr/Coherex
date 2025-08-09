import { Sandbox } from '@e2b/code-interpreter'

// E2B API Key from environment
const E2B_API_KEY = process.env.E2B_API_KEY

if (!E2B_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('E2B_API_KEY is not set. E2B functionality will be limited.')
}

export interface SandboxOptions {
  timeout?: number // in seconds, default 300 (5 minutes)
  metadata?: Record<string, any>
}

export interface ExecutionResult {
  success: boolean
  output?: any
  error?: string
  logs?: string[]
  executionTime?: number
}

class E2BClient {
  private sandboxes: Map<string, Sandbox> = new Map()

  /**
   * Create a new sandbox for agent execution
   */
  async createSandbox(agentId: string, options: SandboxOptions = {}): Promise<Sandbox> {
    try {
      // Create sandbox with custom timeout
      const sandbox = await Sandbox.create({
        apiKey: E2B_API_KEY,
        timeout: options.timeout || 300, // 5 minutes default
      })

      // Store sandbox reference
      this.sandboxes.set(agentId, sandbox)

      return sandbox
    } catch (error) {
      console.error('Failed to create E2B sandbox:', error)
      throw new Error(`Failed to create sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Execute code in a sandbox
   */
  async executeCode(
    sandbox: Sandbox,
    code: string,
    language: 'python' | 'javascript' = 'python'
  ): Promise<ExecutionResult> {
    try {
      const startTime = Date.now()
      
      // Execute code based on language
      const execution = await sandbox.runCode(code)
      
      const executionTime = Date.now() - startTime
      

      // Parse output - E2B returns logs with stdout/stderr
      let output = execution.results
      let actualError = execution.error
      
      // Check if this is a SystemExit which means successful completion
      if (execution.error && typeof execution.error === 'object') {
        const error = execution.error as any
        if (error.name === 'SystemExit' && error.value === '0') {
          // This is actually a successful exit, not an error
          actualError = null
        }
      }
      
      // Check if output is in logs.stdout
      if (execution.logs && typeof execution.logs === 'object') {
        const logs = execution.logs as any
        if (logs.stdout && Array.isArray(logs.stdout) && logs.stdout.length > 0) {
          // Get the last stdout line as output
          output = logs.stdout[logs.stdout.length - 1]
        }
      }
      
      // If still no output but we have results array
      if (!output && Array.isArray(execution.results) && execution.results.length > 0) {
        // E2B returns array of results, get the last one
        const lastResult = execution.results[execution.results.length - 1]
        // If it's a data result with text, extract it
        if (lastResult && typeof lastResult === 'object' && 'text' in lastResult) {
          output = lastResult.text
        } else if (lastResult && typeof lastResult === 'object' && 'data' in lastResult) {
          output = lastResult.data
        } else {
          output = lastResult
        }
      }
      
      // Try to parse JSON output if it looks like JSON
      if (typeof output === 'string' && output.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(output)
          if (parsed.success && parsed.output) {
            output = parsed.output
          }
        } catch {
          // Not JSON or failed to parse, keep as-is
        }
      }
      
      return {
        success: !actualError,
        output: output,
        error: actualError,
        logs: execution.logs,
        executionTime
      }
    } catch (error) {
      console.error('Failed to execute code:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown execution error'
      }
    }
  }

  /**
   * Execute an agent configuration in a sandbox
   */
  async executeAgent(
    agentId: string,
    agentConfig: any,
    input: any,
    envVars?: Record<string, string>
  ): Promise<ExecutionResult> {
    // If E2B is not configured, use mock execution
    if (!E2B_API_KEY) {
      return this.mockExecuteAgent(agentConfig, input)
    }

    let sandbox: Sandbox | undefined

    try {
      // Create sandbox for this agent
      sandbox = await this.createSandbox(agentId)

      // Set environment variables in sandbox
      if (envVars) {
        await this.setEnvironmentVariables(sandbox, envVars)
      }

      // Install required packages based on model
      const packages = this.getRequiredPackages(agentConfig)
      if (packages.length > 0) {
        await this.installPackages(sandbox, packages)
      }

      // Prepare agent runtime code
      const runtimeCode = this.generateAgentRuntime(agentConfig, input)

      // Execute the agent
      const result = await this.executeCode(sandbox, runtimeCode)

      return result
    } catch (error) {
      console.error('Failed to execute agent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      // Clean up sandbox
      if (sandbox) {
        await this.closeSandbox(agentId)
      }
    }
  }

  /**
   * Mock agent execution for development/testing
   */
  private mockExecuteAgent(agentConfig: any, input: any): ExecutionResult {
    const startTime = Date.now()
    const logs: string[] = []
    
    logs.push(`[${new Date().toISOString()}] E2B not configured - running in simulation mode`)
    logs.push(`[${new Date().toISOString()}] Agent '${agentConfig.name}' started`)
    logs.push(`[${new Date().toISOString()}] Processing input with ${agentConfig.model || 'default model'}`)
    logs.push(`[${new Date().toISOString()}] Execution mode: ${agentConfig.executionMode || 'ephemeral'}`)
    
    let output: any
    const agentType = agentConfig.type || 'custom'
    
    switch (agentType) {
      case 'data_processor':
        output = {
          processed: true,
          inputLength: JSON.stringify(input).length,
          summary: `Processed data with ${agentConfig.name}`,
          timestamp: new Date().toISOString(),
          note: 'E2B_API_KEY not configured - running in simulation output (E2B not configured)'
        }
        logs.push(`[${new Date().toISOString()}] Data processing completed`)
        break
        
      case 'analyzer':
        output = {
          analysis: `Analysis of input: "${input}"`,
          insights: [
            'Mock Insight 1: Input received successfully',
            'Mock Insight 2: Agent is functioning in test mode',
            `Mock Insight 3: Would use model ${agentConfig.model || 'gpt-4'} in production`
          ],
          confidence: 0.95,
          note: 'E2B_API_KEY not configured - running in simulation analysis (E2B not configured)'
        }
        logs.push(`[${new Date().toISOString()}] Analysis completed`)
        break
        
      case 'chatbot':
        // Check if this appears to be a conversation with history
        if (input.includes('Previous conversation:')) {
          // Extract the actual user message from the formatted input
          const lines = input.split('\n')
          const userLineIndex = lines.findIndex(line => line.startsWith('User:') && lines.indexOf(line) === lines.length - 1)
          const actualMessage = userLineIndex >= 0 ? lines[userLineIndex].replace('User: ', '') : input
          
          // Check for name context
          if (actualMessage.toLowerCase().includes("what's my name") || actualMessage.toLowerCase().includes("what is my name")) {
            // Look for name in conversation history
            const nameMatch = input.match(/User: .*?[Ii]'m ([A-Z][a-z]+)/);
            if (nameMatch) {
              output = `Your name is ${nameMatch[1]}. How else can I help you today?`
            } else {
              output = `I don't believe you've told me your name yet. What would you like me to call you?`
            }
          } else if (actualMessage.toLowerCase().includes("hi") || actualMessage.toLowerCase().includes("hello")) {
            // Check if name was mentioned
            const nameIntro = actualMessage.match(/[Ii]'m ([A-Z][a-z]+)/);
            if (nameIntro) {
              output = `Hello ${nameIntro[1]}! It's nice to meet you. How can I assist you today?`
            } else {
              output = `Hello! How can I help you today?`
            }
          } else {
            output = `I understand you said: "${actualMessage}". ` +
                    `\n\nNote: E2B_API_KEY not configured - running in simulation mode with conversation context.`
          }
        } else {
          // Single message without history
          if (input.toLowerCase().includes("hi") || input.toLowerCase().includes("hello")) {
            const nameIntro = input.match(/[Ii]'m ([A-Z][a-z]+)/);
            if (nameIntro) {
              output = `Hello ${nameIntro[1]}! It's nice to meet you. How can I assist you today?`
            } else {
              output = `Hello! How can I help you today?`
            }
          } else {
            output = `Hello! I'm ${agentConfig.name}. You said: "${input}". ` +
                    `\n\nNote: E2B_API_KEY not configured - running in simulation mode. In production, this would process with ${agentConfig.model || 'AI'}.`
          }
        }
        logs.push(`[${new Date().toISOString()}] Response generated`)
        logs.push(`[${new Date().toISOString()}] Mode: ${agentConfig.executionMode === 'persistent' ? 'Conversational (with context)' : 'Ephemeral (stateless)'}`)
        break
        
      case 'automation':
        output = {
          task: 'Automation task',
          status: 'completed',
          actions: [
            { action: 'receive_input', status: 'done' },
            { action: 'process_request', status: 'done' },
            { action: 'generate_output', status: 'done' }
          ],
          note: 'E2B_API_KEY not configured - running in simulation automation (E2B not configured)'
        }
        logs.push(`[${new Date().toISOString()}] Automation workflow executed`)
        break
        
      default:
        output = {
          message: `Agent ${agentConfig.name} processed your input (mock mode)`,
          input: input,
          agentType: agentType,
          config: {
            model: agentConfig.model,
            temperature: agentConfig.temperature
          },
          note: 'E2B_API_KEY not configured - running in simulation output (E2B not configured)'
        }
        logs.push(`[${new Date().toISOString()}] Custom agent execution completed`)
    }
    
    const executionTime = Date.now() - startTime
    logs.push(`[${new Date().toISOString()}] Execution completed in ${executionTime}ms`)
    logs.push(`[${new Date().toISOString()}] To enable real sandbox execution, configure E2B_API_KEY in .env.local`)
    
    return {
      success: true,
      output,
      logs,
      executionTime
    }
  }

  /**
   * Generate runtime code for agent execution
   */
  private generateAgentRuntime(agentConfig: any, input: any): string {
    // Convert JavaScript values to Python
    const pythonConfig = JSON.stringify(agentConfig, null, 2)
      .replace(/null/g, 'None')
      .replace(/true/g, 'True')
      .replace(/false/g, 'False')
    
    const pythonInput = JSON.stringify(input)
      .replace(/null/g, 'None')
      .replace(/true/g, 'True')
      .replace(/false/g, 'False')
    
    // Generate Python code that uses actual LLM APIs
    const code = `
import json
import sys
import os

# Agent configuration
config = ${pythonConfig}

# Input data  
input_data = ${pythonInput}

# Initialize LLM client based on model
def initialize_llm_client(model):
    """Initialize the appropriate LLM client based on model name"""
    if model.startswith('gpt') or model.startswith('text-') or 'davinci' in model:
        # OpenAI models
        try:
            from openai import OpenAI
            api_key = os.environ.get('OPENAI_API_KEY')
            if not api_key:
                raise ValueError("OPENAI_API_KEY not found in environment")
            return OpenAI(api_key=api_key), 'openai'
        except ImportError:
            raise ImportError("OpenAI package not installed")
    elif model.startswith('claude'):
        # Anthropic models
        try:
            from anthropic import Anthropic
            api_key = os.environ.get('ANTHROPIC_API_KEY')
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY not found in environment")
            return Anthropic(api_key=api_key), 'anthropic'
        except ImportError:
            raise ImportError("Anthropic package not installed")
    else:
        # Default to OpenAI
        from openai import OpenAI
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")
        return OpenAI(api_key=api_key), 'openai'

# Call LLM with agent configuration
def call_llm(client, provider, config, user_input):
    """Make API call to LLM based on provider"""
    model = config.get('model', 'gpt-4')
    temperature = config.get('temperature', 0.7)
    max_tokens = config.get('maxTokens', 2000)
    system_prompt = config.get('systemPrompt', 'You are a helpful AI assistant.')
    
    if provider == 'openai':
        # OpenAI API call
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": str(user_input)}
        ]
        
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return response.choices[0].message.content
        
    elif provider == 'anthropic':
        # Anthropic API call
        # Map common model names to Anthropic models
        anthropic_model = model
        if model == 'claude-3' or model == 'claude':
            anthropic_model = 'claude-3-opus-20240229'
        elif model == 'claude-3-sonnet':
            anthropic_model = 'claude-3-sonnet-20240229'
        elif model == 'claude-3-haiku':
            anthropic_model = 'claude-3-haiku-20240307'
            
        message = client.messages.create(
            model=anthropic_model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[
                {"role": "user", "content": str(user_input)}
            ]
        )
        
        return message.content[0].text
    else:
        raise ValueError(f"Unsupported provider: {provider}")

# Agent execution logic
def execute_agent(config, input_data):
    """Execute agent based on configuration"""
    result = {
        "success": True,
        "output": None,
        "metadata": {}
    }
    
    try:
        # Initialize LLM client
        model = config.get('model', 'gpt-4')
        client, provider = initialize_llm_client(model)
        
        # Get agent type
        agent_type = config.get('type', 'chatbot')
        
        # Format input based on agent type
        if agent_type == 'chatbot':
            # Direct chat interaction
            response = call_llm(client, provider, config, input_data)
            result['output'] = response
            
        elif agent_type == 'data_processor':
            # Process data with LLM assistance
            prompt = f"Process the following data and provide insights: {input_data}"
            response = call_llm(client, provider, config, prompt)
            result['output'] = {
                "processed": True,
                "analysis": response,
                "original_input": input_data
            }
            
        elif agent_type == 'analyzer':
            # Analyze input
            prompt = f"Analyze the following and provide detailed insights: {input_data}"
            response = call_llm(client, provider, config, prompt)
            result['output'] = {
                "analysis": response,
                "input_analyzed": input_data
            }
            
        elif agent_type == 'automation':
            # Automation task
            prompt = f"Execute the following automation task: {input_data}"
            response = call_llm(client, provider, config, prompt)
            result['output'] = {
                "task": input_data,
                "execution_result": response,
                "status": "completed"
            }
            
        else:
            # Custom/generic execution
            response = call_llm(client, provider, config, input_data)
            result['output'] = response
            
        result['metadata'] = {
            "model": model,
            "provider": provider,
            "agent_type": agent_type
        }
        
    except Exception as e:
        result['success'] = False
        result['error'] = str(e)
        result['output'] = None
    
    return result

# Execute the agent
try:
    result = execute_agent(config, input_data)
    print(json.dumps(result))
    sys.exit(0 if result.get('success', False) else 1)
except Exception as e:
    error_result = {
        "success": False,
        "error": str(e),
        "output": None
    }
    print(json.dumps(error_result))
    sys.exit(1)
`
    return code
  }

  /**
   * Upload a file to sandbox
   */
  async uploadFile(
    sandbox: Sandbox,
    filePath: string,
    content: string | Buffer
  ): Promise<boolean> {
    try {
      await sandbox.writeFile(filePath, content)
      return true
    } catch (error) {
      console.error('Failed to upload file to sandbox:', error)
      return false
    }
  }

  /**
   * Download a file from sandbox
   */
  async downloadFile(sandbox: Sandbox, filePath: string): Promise<string | null> {
    try {
      const content = await sandbox.readFile(filePath)
      return content
    } catch (error) {
      console.error('Failed to download file from sandbox:', error)
      return null
    }
  }

  /**
   * Install packages in sandbox
   */
  async installPackages(
    sandbox: Sandbox,
    packages: string[]
  ): Promise<boolean> {
    try {
      const installCmd = `pip install ${packages.join(' ')}`
      const result = await sandbox.runCode(installCmd)
      return !result.error
    } catch (error) {
      console.error('Failed to install packages:', error)
      return false
    }
  }

  /**
   * Set environment variables in sandbox
   */
  async setEnvironmentVariables(
    sandbox: Sandbox,
    envVars: Record<string, string>
  ): Promise<boolean> {
    try {
      // Create a Python script to set environment variables
      const envCode = `
import os
${Object.entries(envVars).map(([key, value]) => `os.environ['${key}'] = '''${value}'''`).join('\n')}
print("Environment variables set successfully")
`
      const result = await sandbox.runCode(envCode)
      return !result.error
    } catch (error) {
      console.error('Failed to set environment variables:', error)
      return false
    }
  }

  /**
   * Get required packages based on agent configuration
   */
  private getRequiredPackages(agentConfig: any): string[] {
    const packages: string[] = []
    const model = agentConfig.model || 'gpt-4'
    
    // Add packages based on model provider
    if (model.startsWith('gpt') || model.startsWith('text-') || model.includes('davinci')) {
      packages.push('openai')
    } else if (model.startsWith('claude')) {
      packages.push('anthropic')
    }
    
    // Add common packages for agent functionality
    packages.push('requests', 'json5')
    
    return packages
  }

  /**
   * Get sandbox by agent ID
   */
  getSandbox(agentId: string): Sandbox | undefined {
    return this.sandboxes.get(agentId)
  }

  /**
   * Close and clean up a sandbox
   */
  async closeSandbox(agentId: string): Promise<void> {
    const sandbox = this.sandboxes.get(agentId)
    if (sandbox) {
      try {
        await sandbox.kill()
        this.sandboxes.delete(agentId)
      } catch (error) {
        console.error('Failed to close sandbox:', error)
      }
    }
  }

  /**
   * Close all active sandboxes
   */
  async closeAllSandboxes(): Promise<void> {
    const closePromises = Array.from(this.sandboxes.keys()).map(agentId =>
      this.closeSandbox(agentId)
    )
    await Promise.all(closePromises)
  }
}

// Export singleton instance
export const e2bClient = new E2BClient()

// Export types
export type { Sandbox }