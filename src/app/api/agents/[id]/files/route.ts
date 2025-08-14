import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api-client-production'
import { e2bClient } from '@/lib/e2b/client'
import { sessionManager } from '@/lib/e2b/session-manager'
import { AgentRuntime } from '@/lib/e2b/runtime'

interface FileInfo {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  lastModified?: string
}

// GET /api/agents/[id]/files - List files in agent sandbox
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await createRouteHandlerClient(req)
    const { id: agentId } = await params
    const { searchParams } = new URL(req.url)
    const path = searchParams.get('path') || '/'
    const sessionId = searchParams.get('sessionId')
    
    // Handle test agent (for agent builder)
    if (agentId === 'test-agent') {
      // Check if there's an active sandbox
      // Try sessionId first (most specific), then test-agent
      let sandbox = null
      if (sessionId) {
        sandbox = e2bClient.getSandbox(sessionId)
      }
      if (!sandbox) {
        sandbox = e2bClient.getSandbox('test-agent')
      }
      
      // If we have a sandbox, treat it like a normal agent
      if (sandbox) {
        // List real files in the sandbox using E2B files API
        try {
          // Use E2B's files.list() method
          const entries = await sandbox.files.list(path)
          const files: FileInfo[] = []
          
          for (const entry of entries) {
            // Skip . and .. entries
            if (entry.name === '.' || entry.name === '..') continue
            
            files.push({
              name: entry.name,
              path: path === '/' ? `/${entry.name}` : `${path}/${entry.name}`,
              type: entry.type === 'directory' ? 'directory' : 'file',
              size: entry.type === 'file' ? 1024 : 0, // E2B might not provide size
              lastModified: new Date().toISOString()
            })
          }
          
          return NextResponse.json({
            files,
            isVirtual: false,
            currentPath: path
          })
          
        } catch (error) {
          console.error('Error listing files:', error)
          return NextResponse.json(
            { error: 'Failed to list files' },
            { status: 500 }
          )
        }
      }
      
      // No sandbox - show virtual files
      const testConfig = {
        id: 'test-agent',
        name: 'Test Agent',
        type: 'custom' as const,
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: 'You are a helpful AI assistant.',
        description: 'Test agent for previewing runtime code'
      }
      
      const context = {
        agent: testConfig,
        input: '# Sample input for demonstration'
      }
      
      // Generate both Python and JavaScript versions
      const pythonCode = AgentRuntime.generatePythonRuntime(context)
      const jsCode = AgentRuntime.generateJavaScriptRuntime(context)
      
      const files: FileInfo[] = [
        {
          name: 'agent.py',
          path: '/agent.py',
          type: 'file',
          size: pythonCode.length,
          lastModified: new Date().toISOString()
        },
        {
          name: 'agent.js',
          path: '/agent.js',
          type: 'file',
          size: jsCode.length,
          lastModified: new Date().toISOString()
        },
        {
          name: 'config.json',
          path: '/config.json',
          type: 'file',
          size: JSON.stringify(testConfig, null, 2).length,
          lastModified: new Date().toISOString()
        }
      ]
      
      return NextResponse.json({
        files,
        isVirtual: true,
        message: 'Preview of generated runtime code'
      })
    }
    
    // Verify agent exists and user has access
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (fetchError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Get the current sandbox for this agent
    let sandbox = e2bClient.getSandbox(agentId)
    
    // If no sandbox exists and sessionId provided, try to get from session
    if (!sandbox && sessionId) {
      const session = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
        .then(r => r.data)
        
      if (session && session.status === 'active') {
        sandbox = e2bClient.getSandbox(session.id)
      }
    }
    
    if (!sandbox) {
      // Generate the agent runtime code to show what would be deployed
      const config = AgentRuntime.parseConfig(agent)
      const context = {
        agent: config,
        input: '# Sample input for demonstration'
      }
      
      // Generate both Python and JavaScript versions
      const pythonCode = AgentRuntime.generatePythonRuntime(context)
      const jsCode = AgentRuntime.generateJavaScriptRuntime(context)
      
      // Return virtual file system showing the generated code
      const files: FileInfo[] = [
        {
          name: 'agent.py',
          path: '/agent.py',
          type: 'file',
          size: pythonCode.length,
          lastModified: new Date().toISOString()
        },
        {
          name: 'agent.js',
          path: '/agent.js',
          type: 'file',
          size: jsCode.length,
          lastModified: new Date().toISOString()
        },
        {
          name: 'config.json',
          path: '/config.json',
          type: 'file',
          size: JSON.stringify(config, null, 2).length,
          lastModified: new Date().toISOString()
        }
      ]
      
      return NextResponse.json({
        files,
        isVirtual: true,
        message: 'No active sandbox. Showing generated runtime code.'
      })
    }
    
    // List files in the sandbox using E2B files API
    try {
      const entries = await sandbox.files.list(path)
      const files: FileInfo[] = []
      
      for (const entry of entries) {
        // Skip . and .. entries
        if (entry.name === '.' || entry.name === '..') continue
        
        files.push({
          name: entry.name,
          path: path === '/' ? `/${entry.name}` : `${path}/${entry.name}`,
          type: entry.type === 'directory' ? 'directory' : 'file',
          size: entry.type === 'file' ? 1024 : 0, // E2B might not provide size
          lastModified: new Date().toISOString()
        })
      }
      
      return NextResponse.json({
        files,
        isVirtual: false,
        currentPath: path
      })
      
    } catch (error) {
      console.error('Error listing files:', error)
      return NextResponse.json(
        { error: 'Failed to list files' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Files API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/agents/[id]/files - Read or write a file
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await createRouteHandlerClient(req)
    const { id: agentId } = await params
    const { action, path, content, sessionId } = await req.json()
    
    // Handle test agent (for agent builder)
    if (agentId === 'test-agent') {
      // Check if there's an active sandbox
      // Try sessionId first (most specific), then test-agent
      let sandbox = null
      if (sessionId) {
        sandbox = e2bClient.getSandbox(sessionId)
      }
      if (!sandbox) {
        sandbox = e2bClient.getSandbox('test-agent')
      }
      
      // If we have a sandbox, handle it like a normal agent
      if (sandbox) {
        if (action === 'read') {
          try {
            const content = await e2bClient.downloadFile(sandbox, path)
            if (content === null) {
              return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
              )
            }
            
            return NextResponse.json({
              content,
              isVirtual: false
            })
          } catch (error) {
            console.error('Error reading file:', error)
            return NextResponse.json(
              { error: 'Failed to read file' },
              { status: 500 }
            )
          }
        } else if (action === 'write') {
          if (!content) {
            return NextResponse.json(
              { error: 'Content is required for write action' },
              { status: 400 }
            )
          }
          
          try {
            const success = await e2bClient.uploadFile(sandbox, path, content)
            if (!success) {
              return NextResponse.json(
                { error: 'Failed to write file' },
                { status: 500 }
              )
            }
            
            return NextResponse.json({
              success: true,
              message: 'File saved successfully'
            })
          } catch (error) {
            console.error('Error writing file:', error)
            return NextResponse.json(
              { error: 'Failed to write file' },
              { status: 500 }
            )
          }
        } else if (action === 'delete') {
          try {
            // Use E2B runCode to delete (no direct delete API)
            await sandbox.runCode(`import os; os.remove('${path}')`)
            
            return NextResponse.json({
              success: true,
              message: 'File deleted successfully'
            })
          } catch (error) {
            console.error('Error deleting file:', error)
            return NextResponse.json(
              { error: 'Failed to delete file' },
              { status: 500 }
            )
          }
        }
      }
      
      // No sandbox - handle virtual files
      if (action === 'read') {
        const testConfig = {
          id: 'test-agent',
          name: 'Test Agent',
          type: 'custom' as const,
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: 'You are a helpful AI assistant.',
          description: 'Test agent for previewing runtime code'
        }
        
        const context = {
          agent: testConfig,
          input: '# Sample input for demonstration'
        }
        
        // Return the generated code based on the requested file
        if (path === '/agent.py') {
          return NextResponse.json({
            content: AgentRuntime.generatePythonRuntime(context),
            isVirtual: true
          })
        } else if (path === '/agent.js') {
          return NextResponse.json({
            content: AgentRuntime.generateJavaScriptRuntime(context),
            isVirtual: true
          })
        } else if (path === '/config.json') {
          return NextResponse.json({
            content: JSON.stringify(testConfig, null, 2),
            isVirtual: true
          })
        }
      }
      
      // Virtual files don't support write/delete operations
      return NextResponse.json(
        { error: 'Start the agent sandbox to modify files' },
        { status: 400 }
      )
    }
    
    // Verify agent exists and user has access
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (fetchError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Handle virtual files (when no sandbox is active)
    if (action === 'read' && !e2bClient.getSandbox(agentId)) {
      const config = AgentRuntime.parseConfig(agent)
      const context = {
        agent: config,
        input: '# Sample input for demonstration'
      }
      
      // Return the generated code based on the requested file
      if (path === '/agent.py') {
        return NextResponse.json({
          content: AgentRuntime.generatePythonRuntime(context),
          isVirtual: true
        })
      } else if (path === '/agent.js') {
        return NextResponse.json({
          content: AgentRuntime.generateJavaScriptRuntime(context),
          isVirtual: true
        })
      } else if (path === '/config.json') {
        return NextResponse.json({
          content: JSON.stringify(config, null, 2),
          isVirtual: true
        })
      } else {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
    }
    
    // Get the sandbox
    let sandbox = e2bClient.getSandbox(agentId)
    
    if (!sandbox && sessionId) {
      const session = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
        .then(r => r.data)
        
      if (session && session.status === 'active') {
        sandbox = e2bClient.getSandbox(session.id)
      }
    }
    
    if (!sandbox) {
      return NextResponse.json(
        { error: 'No active sandbox. Start the agent to create a sandbox.' },
        { status: 400 }
      )
    }
    
    if (action === 'read') {
      // Read file from sandbox
      try {
        const content = await e2bClient.downloadFile(sandbox, path)
        if (content === null) {
          return NextResponse.json(
            { error: 'File not found' },
            { status: 404 }
          )
        }
        
        return NextResponse.json({
          content,
          isVirtual: false
        })
      } catch (error) {
        console.error('Error reading file:', error)
        return NextResponse.json(
          { error: 'Failed to read file' },
          { status: 500 }
        )
      }
      
    } else if (action === 'write') {
      // Write file to sandbox
      if (!content) {
        return NextResponse.json(
          { error: 'Content is required for write action' },
          { status: 400 }
        )
      }
      
      try {
        const success = await e2bClient.uploadFile(sandbox, path, content)
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to write file' },
            { status: 500 }
          )
        }
        
        return NextResponse.json({
          success: true,
          message: 'File saved successfully'
        })
      } catch (error) {
        console.error('Error writing file:', error)
        return NextResponse.json(
          { error: 'Failed to write file' },
          { status: 500 }
        )
      }
      
    } else if (action === 'delete') {
      // Delete file from sandbox using E2B runCode (no direct delete API)
      try {
        await sandbox.runCode(`import os; os.remove('${path}')`)
        
        return NextResponse.json({
          success: true,
          message: 'File deleted successfully'
        })
      } catch (error) {
        console.error('Error deleting file:', error)
        return NextResponse.json(
          { error: 'Failed to delete file' },
          { status: 500 }
        )
      }
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use read, write, or delete.' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Files API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}