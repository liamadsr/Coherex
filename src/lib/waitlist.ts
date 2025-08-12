export interface WaitlistResponse {
  success: boolean
  message?: string
  error?: string
}

export interface WaitlistData {
  name: string
  email: string
  company: string
}

export async function submitToWaitlist(data: WaitlistData | string): Promise<WaitlistResponse> {
  try {
    // Create payload based on input type
    const payload = typeof data === 'string' 
      ? { email: data }
      : { name: data.name, email: data.email, company: data.company };
      
    console.log('Submitting to waitlist:', payload);
    
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log('Waitlist API response:', response.status, responseData);

    if (!response.ok) {
      return {
        success: false,
        error: responseData.error || 'Failed to join waitlist',
      };
    }

    return {
      success: responseData.success !== false,
      message: responseData.message || 'Successfully joined the waitlist!',
      error: responseData.error,
    };
  } catch (error) {
    console.error('Error submitting to waitlist:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}