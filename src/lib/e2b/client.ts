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

      return {
        success: !execution.error,
        output: execution.results,
        error: execution.error,
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
    input: any
  ): Promise<ExecutionResult> {
    // If E2B is not configured, use mock execution
    if (!E2B_API_KEY) {
      return this.mockExecuteAgent(agentConfig, input)
    }

    let sandbox: Sandbox | undefined

    try {
      // Create sandbox for this agent
      sandbox = await this.createSandbox(agentId)

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
        output = `Hello! I'm ${agentConfig.name}. You said: "${input}". ` +
                `\n\nNote: E2B_API_KEY not configured - running in simulation mode. In production, this would process with ${agentConfig.model || 'AI'}.`
        logs.push(`[${new Date().toISOString()}] Response generated`)
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
    // Convert JavaScript null to Python None
    const pythonConfig = JSON.stringify(agentConfig, null, 2)
      .replace(/null/g, 'None')
      .replace(/true/g, 'True')
      .replace(/false/g, 'False')
    
    const pythonInput = JSON.stringify(input)
      .replace(/null/g, 'None')
      .replace(/true/g, 'True')
      .replace(/false/g, 'False')
    
    // This is a simplified version - we'll expand this based on agent config structure
    const code = `
import json
import sys

# Agent configuration
config = ${pythonConfig}

# Input data
input_data = ${pythonInput}

# Agent execution logic
def execute_agent(config, input_data):
    """Execute agent based on configuration"""
    result = {
        "status": "completed",
        "output": None,
        "metadata": {}
    }
    
    # Parse agent type and execute accordingly
    agent_type = config.get("type", "generic")
    
    if agent_type == "data_processor":
        # Data processing logic
        result["output"] = process_data(input_data)
    elif agent_type == "analyzer":
        # Analysis logic
        result["output"] = analyze_data(input_data)
    else:
        # Generic execution
        result["output"] = f"Processed input: {input_data}"
    
    return result

def process_data(data):
    """Process data based on configuration"""
    # Add data processing logic here
    return {"processed": True, "data": data}

def analyze_data(data):
    """Analyze data based on configuration"""
    # Add analysis logic here
    return {"analysis": "completed", "insights": []}

# Execute the agent
try:
    result = execute_agent(config, input_data)
    print(json.dumps(result))
except Exception as e:
    error_result = {
        "status": "error",
        "error": str(e)
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
        await sandbox.close()
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