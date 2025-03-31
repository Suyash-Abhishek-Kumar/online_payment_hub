/**
 * Utility functions for reCAPTCHA verification
 */

interface VerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
}

/**
 * Verify a reCAPTCHA token with the Google reCAPTCHA API
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    // Use environment variable for the secret key
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY environment variable is not set');
      // In development, if no key is available, return true to allow testing
      if (process.env.NODE_ENV === 'development') {
        console.warn('Development mode: Bypassing reCAPTCHA verification');
        return true;
      }
      return false;
    }
    
    // Validate the token
    if (!token) {
      console.warn('No reCAPTCHA token provided - bypassing verification');
      return true; // Allow login without reCAPTCHA
    }
    
    // Make API request to Google to verify the token
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });
    
    if (!response.ok) {
      console.error('Failed to verify reCAPTCHA token:', response.statusText);
      return false;
    }
    
    const data: VerifyResponse = await response.json();
    
    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data.error_codes);
    }
    
    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}