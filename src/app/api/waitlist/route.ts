import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Support both old format (email only) and new format (name, email, company)
    const email = data.email
    const name = data.name || ''
    const company = data.company || ''
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Google Sheets configuration
    const SHEET_ID = '1rdPtlwEzDaKnL_29RwsFpQoShzhVNNWoB_SKjQLn6Ms'
    const SHEET_NAME = 'Sheet1' // Default sheet name, adjust if needed
    
    // Using Google Sheets API v4 with API key (for public sheets)
    // For a more secure solution, you should use OAuth2 or service account
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    
    if (!API_KEY) {
      // Use Google Apps Script Web App
      const scriptUrl = process.env.GOOGLE_SCRIPT_URL || ''
      
      console.log('Script URL configured:', !!scriptUrl)
      
      if (!scriptUrl) {
        console.error('GOOGLE_SCRIPT_URL not configured in environment variables')
        console.log('Waitlist submission (not saved to sheet):', { email, name, company }, new Date().toISOString())
        return NextResponse.json({ 
          success: false, 
          error: 'Google Sheets not configured. Please contact support.',
          message: 'Submission recorded but not saved to sheet' 
        })
      }
      
      // Send to Google Apps Script
      console.log('Sending to Google Apps Script:', scriptUrl)
      
      try {
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name,
            company,
            timestamp: new Date().toISOString(),
            source: 'COHEREX Landing Page'
          })
        })
        
        const responseText = await response.text()
        console.log('Google Script Response:', response.status, responseText)
        
        if (!response.ok) {
          throw new Error(`Failed to save to Google Sheets: ${response.status} ${responseText}`)
        }
        
        // Try to parse as JSON
        let result
        try {
          result = JSON.parse(responseText)
        } catch (e) {
          console.log('Response is not JSON:', responseText)
          result = { success: true }
        }
        
        if (result.success === false) {
          throw new Error(result.error || 'Google Script returned error')
        }
      } catch (fetchError) {
        console.error('Error calling Google Script:', fetchError)
        throw fetchError
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully joined the waitlist!' 
      })
    }
    
    // If API key is available, use Sheets API directly
    const range = `${SHEET_NAME}!A:C`
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:append?key=${API_KEY}&valueInputOption=USER_ENTERED`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[
          name,
          email,
          company,
          new Date().toISOString(),
          'COHEREX Landing Page'
        ]]
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to save to Google Sheets')
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully joined the waitlist!' 
    })
    
  } catch (error) {
    console.error('Error saving email:', error)
    return NextResponse.json(
      { error: 'Failed to save email. Please try again.' },
      { status: 500 }
    )
  }
}