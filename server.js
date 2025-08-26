const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const twilio = require('twilio');
const admin = require('firebase-admin');
const cron = require('node-cron');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Twilio client
const twilioClient = twilio(
  process.env.REACT_APP_TWILIO_ACCOUNT_SID,
  process.env.REACT_APP_TWILIO_AUTH_TOKEN
);
const TWILIO_PHONE_NUMBER = process.env.REACT_APP_TWILIO_PHONE_NUMBER;

// Initialize Firebase Admin (for accessing Firestore)
if (!admin.apps.length) {
  admin.initializeApp({
    // Your Firebase config
  });
}

const db = admin.firestore();

// In-memory store for failed notification attempts (in production, use database)
const failedAttempts = [];

// Enable CORS for React app
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Resend API endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    console.log('Received email request:', req.body);
    console.log('Request headers:', req.headers);
    
    const { userEmail, shiftData } = req.body;

    if (!userEmail) {
      console.log('Missing userEmail field');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: userEmail' 
      });
    }

    if (!shiftData) {
      console.log('Missing shiftData field');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: shiftData' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.log('Invalid email format:', userEmail);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    // Validate shiftData fields
    if (!shiftData.date || !shiftData.start_time || !shiftData.end_time || !shiftData.shift_type || !shiftData.department) {
      console.log('Missing shift data fields:', shiftData);
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required shift data fields' 
      });
    }

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shift Reminder - NurseMate</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
          }
          .shift-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #495057;
          }
          .value {
            color: #212529;
          }
          .time-highlight {
            background-color: #007bff;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;
          }
          .department-badge {
            background-color: #28a745;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
          .reminder-tips {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏥 NurseMate</div>
            <h1 style="color: #007bff; margin: 0;">Shift Reminder</h1>
            <p style="color: #6c757d; margin: 10px 0 0 0;">Your shift is coming up soon!</p>
          </div>
          
          <div class="shift-details">
            <div class="detail-row">
              <span class="label">📅 Date:</span>
              <span class="value">${shiftData.date}</span>
            </div>
            <div class="detail-row">
              <span class="label">⏰ Time:</span>
              <span class="value">
                <span class="time-highlight">${shiftData.start_time} - ${shiftData.end_time}</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">🔄 Shift Type:</span>
              <span class="value">${shiftData.shift_type}</span>
            </div>
            <div class="detail-row">
              <span class="label">🏢 Department:</span>
              <span class="value">
                <span class="department-badge">${shiftData.department}</span>
              </span>
            </div>
            ${shiftData.notes ? `
            <div class="detail-row">
              <span class="label">📝 Notes:</span>
              <span class="value">${shiftData.notes}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="reminder-tips">
            <h3 style="margin: 0 0 10px 0; color: #007bff;">💡 Reminder Tips:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Prepare your uniform and equipment</li>
              <li>Check your route to the hospital</li>
              <li>Ensure you have all necessary credentials</li>
              <li>Get adequate rest before your shift</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>This is an automated reminder from NurseMate</p>
            <p>If you have any questions, please contact your supervisor</p>
            <p style="font-size: 12px; margin-top: 15px;">
              Sent on ${new Date().toLocaleString('en-US', { 
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('Sending email to Resend API...');
    
    const emailPayload = {
      from: 'onboarding@resend.dev', // Use Resend's verified domain
      to: [userEmail],
      subject: 'Shift Reminder – NurseMate',
      html: emailContent
    };
    
    // Check if user email matches the verified email for testing
    if (userEmail !== 'sanjeeviram422@gmail.com') {
      console.log('Warning: Sending to non-verified email. This may fail in production.');
    }
    
    console.log('Email payload:', JSON.stringify(emailPayload, null, 2));
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_SPNbn8RW_HcE76WeWYo1fmxB8Yf6AE25Z',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    });

    console.log('Resend API response status:', response.status);
    
    const result = await response.json();
    console.log('Resend API response:', result);

    if (response.ok) {
      console.log('Email sent successfully!');
      res.json({
        success: true,
        message: `Email sent successfully to ${userEmail}`,
        resendId: result.id
      });
    } else {
      console.log('Email failed to send:', result);
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to send email'
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// OneSignal Push Notification endpoint
app.post('/api/send-notification', async (req, res) => {
  try {
    console.log('Received notification request:', req.body);
    
    const { notification } = req.body;
    const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    if (!ONESIGNAL_REST_API_KEY || ONESIGNAL_REST_API_KEY === 'your_onesignal_rest_api_key_here') {
      console.error('OneSignal REST API key not configured');
      return res.status(500).json({
        success: false,
        error: 'OneSignal REST API key not configured. Please set ONESIGNAL_REST_API_KEY in your .env file'
      });
    }

    if (!notification) {
      return res.status(400).json({
        success: false,
        error: 'Missing notification data'
      });
    }

    // Ensure app_id is set
    if (!notification.app_id) {
      notification.app_id = process.env.REACT_APP_ONESIGNAL_APP_ID || '9ed10e4d-0f63-4508-99d9-9773080c0111';
    }

    console.log('Sending notification to OneSignal:', notification);

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(notification)
    });

    const result = await response.json();
    console.log('OneSignal response:', result);

    if (response.ok) {
      res.json({
        success: true,
        message: 'Notification sent successfully',
        notificationId: result.id,
        recipients: result.recipients
      });
    } else {
      console.error('OneSignal API error:', result);
      res.status(400).json({
        success: false,
        error: result.errors ? result.errors.join(', ') : 'Failed to send notification',
        details: result
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// ============= TWILIO SMS & VOICE ENDPOINTS =============

// Send SMS endpoint
app.post('/api/twilio/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, message'
      });
    }

    if (!TWILIO_PHONE_NUMBER) {
      return res.status(500).json({
        success: false,
        error: 'Twilio phone number not configured'
      });
    }

    console.log(`Sending SMS to ${to}: ${message}`);

    const sms = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log('SMS sent successfully:', sms.sid);

    res.json({
      success: true,
      sid: sms.sid,
      status: sms.status
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    failedAttempts.push({
      type: 'sms',
      error: error.message,
      timestamp: new Date(),
      to: req.body.to
    });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send Voice Call endpoint
app.post('/api/twilio/send-voice', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, message'
      });
    }

    if (!TWILIO_PHONE_NUMBER) {
      return res.status(500).json({
        success: false,
        error: 'Twilio phone number not configured'
      });
    }

    console.log(`Making voice call to ${to}`);

    // Create TwiML for text-to-speech
    const twiml = `
      <Response>
        <Say voice="alice" language="en-US">${message}</Say>
        <Pause length="2"/>
        <Say voice="alice" language="en-US">Thank you for using NurseMate. Goodbye.</Say>
      </Response>
    `;

    const call = await twilioClient.calls.create({
      twiml: twiml,
      from: TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log('Voice call initiated:', call.sid);

    res.json({
      success: true,
      sid: call.sid,
      status: call.status
    });
  } catch (error) {
    console.error('Error making voice call:', error);
    failedAttempts.push({
      type: 'voice',
      error: error.message,
      timestamp: new Date(),
      to: req.body.to
    });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update subscription status
app.post('/api/twilio/update-subscription', async (req, res) => {
  try {
    const { userId, subscribed } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId'
      });
    }

    // Update user's subscription status in Firestore
    await db.collection('users').doc(userId).update({
      smsNotifications: subscribed,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Updated subscription for user ${userId}: ${subscribed}`);

    res.json({
      success: true,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Log failed attempts
app.post('/api/twilio/log-failure', async (req, res) => {
  try {
    const { type, error, timestamp, phone } = req.body;

    const failureLog = {
      type,
      error,
      timestamp,
      phone
    };

    // Store in memory (in production, save to database)
    failedAttempts.push(failureLog);

    // Also log to Firestore
    await db.collection('notification_failures').add({
      ...failureLog,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Failed attempt logged:', failureLog);

    res.json({
      success: true,
      message: 'Failure logged'
    });
  } catch (error) {
    console.error('Error logging failure:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get notification history
app.get('/api/twilio/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get notification history from Firestore
    const snapshot = await db.collection('notification_logs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const history = [];
    snapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      history: history
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verify phone status
app.post('/api/twilio/verify-status', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing phone number'
      });
    }

    // Check if phone is verified in database
    const usersSnapshot = await db.collection('users')
      .where('mobileNumber', '==', phone)
      .where('phoneVerified', '==', true)
      .limit(1)
      .get();

    const verified = !usersSnapshot.empty;

    res.json({
      success: true,
      verified: verified
    });
  } catch (error) {
    console.error('Error checking verification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get failed attempts (admin only)
app.get('/api/twilio/failed-attempts', (req, res) => {
  res.json({
    success: true,
    attempts: failedAttempts
  });
});

// ============= CRON JOBS FOR SHIFT REMINDERS =============

// Helper function to check and send shift reminders
async function checkAndSendShiftReminders(hoursBefore) {
  try {
    console.log(`Checking for shifts ${hoursBefore} hours from now...`);
    
    const now = new Date();
    const targetTime = new Date(now.getTime() + (hoursBefore * 60 * 60 * 1000));
    
    // Format date for comparison
    const targetDate = `${String(targetTime.getDate()).padStart(2, '0')}-${String(targetTime.getMonth() + 1).padStart(2, '0')}-${targetTime.getFullYear()}`;
    const targetHour = targetTime.getHours();
    
    // Get all shifts for the target date
    const shiftsSnapshot = await db.collection('shifts')
      .where('date', '==', targetDate)
      .get();
    
    const reminders = [];
    
    for (const doc of shiftsSnapshot.docs) {
      const shift = doc.data();
      const [shiftHour] = shift.start_time.split(':').map(Number);
      
      // Check if shift is within 1 hour of target time
      if (Math.abs(shiftHour - targetHour) <= 1) {
        // Get user data
        const userDoc = await db.collection('users').doc(shift.userId).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          
          if (userData.smsNotifications && userData.mobileNumber) {
            // Send reminder
            const timeText = hoursBefore === 24 ? '24 hours' : '2 hours';
            
            const smsMessage = `NurseMate Alert: Shift in ${timeText}!
Date: ${shift.date}
Time: ${shift.start_time} to ${shift.end_time}
Location: ${shift.department}`;

            const voiceMessage = `This is NurseMate. You have a shift in ${timeText}. On ${shift.date}, from ${shift.start_time} to ${shift.end_time}, at ${shift.department}.`;
            
            try {
              // Send SMS
              await twilioClient.messages.create({
                body: smsMessage,
                from: TWILIO_PHONE_NUMBER,
                to: userData.mobileNumber
              });
              
              // Send Voice Call
              const twiml = `
                <Response>
                  <Say voice="alice">${voiceMessage}</Say>
                </Response>
              `;
              
              await twilioClient.calls.create({
                twiml: twiml,
                from: TWILIO_PHONE_NUMBER,
                to: userData.mobileNumber
              });
              
              // Log successful reminder
              await db.collection('notification_logs').add({
                userId: shift.userId,
                shiftId: doc.id,
                type: 'shift_reminder',
                hoursBefore: hoursBefore,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent'
              });
              
              reminders.push({
                userId: shift.userId,
                shiftId: doc.id,
                phone: userData.mobileNumber
              });
              
              console.log(`Reminder sent to ${userData.mobileNumber} for shift ${doc.id}`);
            } catch (error) {
              console.error(`Failed to send reminder to ${userData.mobileNumber}:`, error);
              failedAttempts.push({
                type: 'shift_reminder',
                error: error.message,
                timestamp: new Date(),
                to: userData.mobileNumber,
                shiftId: doc.id
              });
            }
          }
        }
      }
    }
    
    console.log(`Sent ${reminders.length} reminders for ${hoursBefore}h check`);
    return reminders;
  } catch (error) {
    console.error(`Error in shift reminder check (${hoursBefore}h):`, error);
    return [];
  }
}

// Schedule cron jobs for shift reminders
// Run every hour to check for shifts 24 hours away
cron.schedule('0 * * * *', async () => {
  console.log('Running 24-hour shift reminder check...');
  await checkAndSendShiftReminders(24);
});

// Run every hour to check for shifts 2 hours away
cron.schedule('0 * * * *', async () => {
  console.log('Running 2-hour shift reminder check...');
  await checkAndSendShiftReminders(2);
});

// Manual trigger endpoint for testing (admin only)
app.post('/api/twilio/trigger-reminders', async (req, res) => {
  try {
    const { hours } = req.body;
    
    if (![2, 24].includes(hours)) {
      return res.status(400).json({
        success: false,
        error: 'Hours must be 2 or 24'
      });
    }
    
    const reminders = await checkAndSendShiftReminders(hours);
    
    res.json({
      success: true,
      message: `Triggered ${hours}-hour reminders`,
      remindersSent: reminders.length,
      reminders: reminders
    });
  } catch (error) {
    console.error('Error triggering reminders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email server is running' });
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 