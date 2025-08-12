import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// POST /api/preview/[token]/verify - Verify password for protected preview
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { password } = await req.json()
    
    // Use service role client for public preview access (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Find preview link by token
    const { data: previewLink, error: linkError } = await supabase
      .from('preview_links')
      .select('id, password_hash')
      .eq('token', token)
      .single()

    if (linkError || !previewLink) {
      return NextResponse.json({ error: 'Invalid preview link' }, { status: 404 })
    }

    if (!previewLink.password_hash) {
      return NextResponse.json({ error: 'This preview does not require a password' }, { status: 400 })
    }

    // Hash the provided password
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const passwordHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Compare hashes
    if (passwordHash !== previewLink.password_hash) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    // Password is correct
    return NextResponse.json({ 
      success: true,
      message: 'Password verified successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/preview/[token]/verify:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}