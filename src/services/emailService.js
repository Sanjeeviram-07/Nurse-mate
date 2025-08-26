import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Email service using local server to avoid CORS issues
export const testResendDirectly = async (userEmail, shiftData) => {
  try {
    const response = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        shiftData
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        message: result.message,
        resendId: result.resendId
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to send email'
      };
    }
  } catch (error) {
    console.error('Error sending email via local server:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

 