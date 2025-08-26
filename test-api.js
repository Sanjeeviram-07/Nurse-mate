const fetch = require('node-fetch');

async function testEmailAPI() {
  try {
    console.log('Testing /api/send-email endpoint...');
    
    const testData = {
      userEmail: 'sanjeeviram422@gmail.com',
      shiftData: {
        date: '15-01-2025',
        start_time: '08:00',
        end_time: '16:00',
        shift_type: 'Day Shift',
        department: 'Emergency',
        notes: 'Test shift for debugging'
      }
    };

    console.log('Sending request with data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    const result = await response.json();
    console.log('Response body:', result);

    if (response.ok) {
      console.log('✅ Email API test successful!');
    } else {
      console.log('❌ Email API test failed!');
    }
  } catch (error) {
    console.error('❌ Error testing email API:', error);
  }
}

testEmailAPI(); 