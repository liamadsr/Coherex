import { NextRequest, NextResponse } from 'next/server'
import { e2bClient } from '@/lib/e2b/client'

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      )
    }

    // Close the sandbox for this session
    await e2bClient.closeSandbox(sessionId)

    return NextResponse.json({
      success: true,
      message: `Sandbox ${sessionId} closed successfully`
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to cleanup sandbox',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}