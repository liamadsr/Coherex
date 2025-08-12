import { e2bClient, ExecutionResult } from './client'
import type { Database } from '@/lib/supabase/types'

type Agent = Database['public']['Tables']['agents']['Row']
type AgentExecution = Database['public']['Tables']['agent_executions']['Row']

export interface AgentConfig {
  id: string
  name: string
  type: 'data_processor' | 'analyzer' | 'chatbot' | 'automation' | 'custom'
  description?: string
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  tools?: AgentTool[]
  dataSources?: string[] // IDs of connected data sources
  schedule?: string // Cron expression for scheduled execution
  triggers?: AgentTrigger[]
  outputFormat?: 'text' | 'json' | 'markdown' | 'html'
  settings?: Record<string, any>
}

export interface AgentTool {
  name: string
  description: string
  parameters: Record<string, any>
  handler?: string // Code to execute for this tool
}

export interface AgentTrigger {
  type: 'webhook' | 'event' | 'schedule'
  config: Record<string, any>
}

export interface AgentExecutionContext {
  agent: AgentConfig
  input: any
  dataSources?: any[]
  metadata?: Record<string, any>
}

export class AgentRuntime {
  /**
   * Parse agent configuration from database JSON
   */
  static parseConfig(agent: Agent): AgentConfig {
    const config = agent.config as any || {}
    
    // Extract type from config or determine based on capabilities
    let type: 'data_processor' | 'analyzer' | 'chatbot' | 'automation' | 'custom' = 'chatbot'
    if (config.type) {
      type = config.type
    } else if (agent.capabilities) {
      // Infer type from capabilities if not explicitly set
      const caps = agent.capabilities as string[]
      if (caps.includes('data-analysis')) {
        type = 'analyzer'
      } else if (caps.includes('data-processing')) {
        type = 'data_processor'
      } else if (caps.includes('automation')) {
        type = 'automation'
      } else if (caps.includes('chat') || caps.includes('email')) {
        type = 'chatbot'
      }
    }
    
    return {
      id: agent.id,
      name: agent.name,
      type: type,
      description: agent.description || undefined,
      // Use top-level fields from agent, falling back to config
      model: agent.model || config.model || 'gpt-4',
      temperature: agent.temperature !== null && agent.temperature !== undefined ? 
        Number(agent.temperature) : (config.temperature || 0.7),
      maxTokens: agent.max_tokens || config.maxTokens || 2000,
      systemPrompt: agent.system_prompt || config.systemPrompt || `You are ${agent.name}, a helpful AI assistant.`,
      tools: config.tools || [],
      dataSources: agent.knowledge_sources || config.dataSources || [],
      schedule: config.schedule,
      triggers: config.triggers || [],
      outputFormat: config.outputFormat || 'text',
      settings: config.settings || {}
    }
  }

  /**
   * Generate Python runtime code for agent execution
   */
  static generatePythonRuntime(context: AgentExecutionContext): string {
    const { agent, input } = context

    return `
import json
import sys
import os
from datetime import datetime
from typing import Dict, Any, List

# Agent configuration
agent_config = ${JSON.stringify(agent, null, 2)}

# Input data
input_data = ${JSON.stringify(input, null, 2)}

class AgentExecutor:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.name = config.get('name', 'Unknown Agent')
        self.type = config.get('type', 'custom')
        self.tools = config.get('tools', [])
        self.output_format = config.get('outputFormat', 'text')
        
    def execute(self, input_data: Any) -> Dict[str, Any]:
        """Execute the agent with given input"""
        result = {
            'success': True,
            'timestamp': datetime.utcnow().isoformat(),
            'agent': self.name,
            'type': self.type,
            'input': input_data,
            'output': None,
            'metadata': {}
        }
        
        try:
            # Route to appropriate handler based on agent type
            if self.type == 'data_processor':
                output = self.process_data(input_data)
            elif self.type == 'analyzer':
                output = self.analyze_data(input_data)
            elif self.type == 'automation':
                output = self.automate_task(input_data)
            else:
                output = self.custom_execution(input_data)
            
            result['output'] = self.format_output(output)
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
            result['output'] = None
            
        return result
    
    def process_data(self, data: Any) -> Any:
        """Process data according to configuration"""
        # Implement data processing logic
        processed = {
            'processed_at': datetime.utcnow().isoformat(),
            'record_count': len(data) if isinstance(data, list) else 1,
            'data': data
        }
        return processed
    
    def analyze_data(self, data: Any) -> Any:
        """Analyze data and generate insights"""
        # Implement analysis logic
        analysis = {
            'analyzed_at': datetime.utcnow().isoformat(),
            'insights': [],
            'summary': 'Analysis completed',
            'data_points': len(data) if isinstance(data, list) else 1
        }
        return analysis
    
    def automate_task(self, task: Any) -> Any:
        """Execute automation task"""
        # Implement automation logic
        result = {
            'task': task,
            'status': 'completed',
            'executed_at': datetime.utcnow().isoformat()
        }
        return result
    
    def custom_execution(self, input_data: Any) -> Any:
        """Custom execution logic"""
        # Implement custom logic based on agent configuration
        return {
            'message': f'Agent {self.name} executed successfully',
            'input_received': input_data,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def format_output(self, output: Any) -> Any:
        """Format output based on configured format"""
        if self.output_format == 'json':
            return output
        elif self.output_format == 'text':
            if isinstance(output, dict):
                return json.dumps(output, indent=2)
            return str(output)
        elif self.output_format == 'markdown':
            return self.to_markdown(output)
        else:
            return output
    
    def to_markdown(self, data: Any) -> str:
        """Convert data to markdown format"""
        md = f"# Agent Output: {self.name}\\n\\n"
        md += f"**Type:** {self.type}\\n"
        md += f"**Timestamp:** {datetime.utcnow().isoformat()}\\n\\n"
        md += "## Results\\n\\n"
        md += f"\`\`\`json\\n{json.dumps(data, indent=2)}\\n\`\`\`\\n"
        return md

# Execute the agent
if __name__ == "__main__":
    executor = AgentExecutor(agent_config)
    result = executor.execute(input_data)
    
    # Output result as JSON
    print(json.dumps(result, indent=2))
    
    # Exit with appropriate code
    sys.exit(0 if result.get('success', False) else 1)
`
  }

  /**
   * Generate JavaScript runtime code for agent execution
   */
  static generateJavaScriptRuntime(context: AgentExecutionContext): string {
    const { agent, input } = context

    return `
const agentConfig = ${JSON.stringify(agent, null, 2)};
const inputData = ${JSON.stringify(input, null, 2)};

class AgentExecutor {
  constructor(config) {
    this.config = config;
    this.name = config.name || 'Unknown Agent';
    this.type = config.type || 'custom';
    this.tools = config.tools || [];
    this.outputFormat = config.outputFormat || 'text';
  }

  async execute(input) {
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      agent: this.name,
      type: this.type,
      input: input,
      output: null,
      metadata: {}
    };

    try {
      let output;
      
      switch (this.type) {
        case 'data_processor':
          output = await this.processData(input);
          break;
        case 'analyzer':
          output = await this.analyzeData(input);
          break;
        case 'automation':
          output = await this.automateTask(input);
          break;
        default:
          output = await this.customExecution(input);
      }
      
      result.output = this.formatOutput(output);
      
    } catch (error) {
      result.success = false;
      result.error = error.message;
      result.output = null;
    }

    return result;
  }

  async processData(data) {
    return {
      processedAt: new Date().toISOString(),
      recordCount: Array.isArray(data) ? data.length : 1,
      data: data
    };
  }

  async analyzeData(data) {
    return {
      analyzedAt: new Date().toISOString(),
      insights: [],
      summary: 'Analysis completed',
      dataPoints: Array.isArray(data) ? data.length : 1
    };
  }

  async automateTask(task) {
    return {
      task: task,
      status: 'completed',
      executedAt: new Date().toISOString()
    };
  }

  async customExecution(input) {
    return {
      message: \`Agent \${this.name} executed successfully\`,
      inputReceived: input,
      timestamp: new Date().toISOString()
    };
  }

  formatOutput(output) {
    if (this.outputFormat === 'json') {
      return output;
    } else if (this.outputFormat === 'text') {
      return typeof output === 'object' ? JSON.stringify(output, null, 2) : String(output);
    } else if (this.outputFormat === 'markdown') {
      return this.toMarkdown(output);
    }
    return output;
  }

  toMarkdown(data) {
    let md = \`# Agent Output: \${this.name}\\n\\n\`;
    md += \`**Type:** \${this.type}\\n\`;
    md += \`**Timestamp:** \${new Date().toISOString()}\\n\\n\`;
    md += \`## Results\\n\\n\`;
    md += \`\\\`\\\`\\\`json\\n\${JSON.stringify(data, null, 2)}\\n\\\`\\\`\\\`\\n\`;
    return md;
  }
}

// Execute the agent
(async () => {
  const executor = new AgentExecutor(agentConfig);
  const result = await executor.execute(inputData);
  
  console.log(JSON.stringify(result, null, 2));
  
  process.exit(result.success ? 0 : 1);
})();
`
  }

  /**
   * Execute an agent with given input
   */
  static async execute(
    agent: Agent,
    input: any,
    options: { language?: 'python' | 'javascript' } = {}
  ): Promise<ExecutionResult> {
    const config = AgentRuntime.parseConfig(agent)
    const context: AgentExecutionContext = {
      agent: config,
      input
    }

    // Generate runtime code based on language preference
    const language = options.language || 'python'
    const runtimeCode = language === 'javascript'
      ? AgentRuntime.generateJavaScriptRuntime(context)
      : AgentRuntime.generatePythonRuntime(context)

    // Prepare environment variables for the sandbox
    const envVars: Record<string, string> = {}
    
    // Add API keys based on the model being used
    const model = agent.model || config.model || 'gpt-4'
    if (model.startsWith('gpt') || model.startsWith('text-') || model.includes('davinci')) {
      if (process.env.OPENAI_API_KEY) {
        envVars.OPENAI_API_KEY = process.env.OPENAI_API_KEY
      }
    } else if (model.startsWith('claude')) {
      if (process.env.ANTHROPIC_API_KEY) {
        envVars.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
      }
    } else {
      // Default to OpenAI if model is unknown
      if (process.env.OPENAI_API_KEY) {
        envVars.OPENAI_API_KEY = process.env.OPENAI_API_KEY
      }
    }

    // Add other potentially useful environment variables
    if (process.env.EXA_API_KEY) {
      envVars.EXA_API_KEY = process.env.EXA_API_KEY
    }

    // Execute in E2B sandbox with environment variables
    const result = await e2bClient.executeAgent(agent.id, config, input, envVars)

    return result
  }
}