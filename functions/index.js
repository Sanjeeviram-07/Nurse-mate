const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Basic Firebase Functions setup
// All notification-related functions have been removed

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.json({ message: "Hello from Firebase Functions!" });
}); 