const fetch = require('node-fetch');

async function testResendAPI() {
  try {
    console.log('Testing Resend API...');
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Email</title>
      </head>
      <body>
        <h1>Test Email from NurseMate</h1>
        <p>This is a test email to verify the Resend API is working.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      </body>
      </html>
    `;

    const emailPayload = {
      from: 'onboarding@resend.dev', // Use Resend's verified domain
      to: ['sanjeeviram422@gmail.com'], // Use your verified email
      subject: 'Test Email – NurseMate',
      html: emailContent
    };

    console.log('Sending test email...');
    console.log('Payload:', JSON.stringify(emailPayload, null, 2));

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_SPNbn8RW_HcE76WeWYo1fmxB8Yf6AE25Z',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    const result = await response.json();
    console.log('Response body:', result);

    if (response.ok) {
      console.log('✅ Test email sent successfully!');
      console.log('Email ID:', result.id);
    } else {
      console.log('❌ Test email failed:');
      console.log('Error:', result.message);
      console.log('Code:', result.statusCode);
    }
  } catch (error) {
    console.error('❌ Error testing Resend API:', error);
  }
}

testResendAPI(); 