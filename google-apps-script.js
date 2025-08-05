// Google Apps Script for COHEREX Waitlist
// 
// Instructions:
// 1. Go to your Google Sheet: https://docs.google.com/spreadsheets/d/1rdPtlwEzDaKnL_29RwsFpQoShzhVNNWoB_SKjQLn6Ms/edit
// 2. Click on Extensions -> Apps Script
// 3. Delete any existing code and paste this entire script
// 4. Click Deploy -> New Deployment
// 5. Choose "Web app" as the type
// 6. Set "Execute as" to "Me"
// 7. Set "Who has access" to "Anyone"
// 8. Click Deploy and copy the Web App URL
// 9. Add the URL to your .env.local file as GOOGLE_SCRIPT_URL=your_url_here

function doPost(e) {
  try {
    // Log the request for debugging
    console.log('Received POST request:', e.postData.contents);
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // If this is the first entry, add headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Name', 'Email', 'Company', 'Timestamp', 'Source']);
    }
    
    // Append the new data
    sheet.appendRow([
      data.name || '',
      data.email,
      data.company || '',
      data.timestamp || new Date().toISOString(),
      data.source || 'Unknown'
    ]);
    
    // Force save
    SpreadsheetApp.flush();
    
    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Email saved successfully',
        email: data.email
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error.toString());
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Failed to save email'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: 'Google Apps Script is working!',
      sheet: SpreadsheetApp.getActiveSpreadsheet().getName()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Test function to verify the script is working
function testScript() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        timestamp: new Date().toISOString(),
        source: 'Test'
      })
    }
  };
  
  const result = doPost(testData);
  console.log(result.getContent());
}