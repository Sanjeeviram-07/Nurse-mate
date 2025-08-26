NurseMate
NurseMate is an all-in-one companion web application for nursing students, providing tools for clinical log tracking, shift planning, quiz preparation, and more.
Features

Clinical Logbook: Track patient cases, procedures, and vitals.
Shift Planner: Manage and visualize shift schedules.
Quiz: Practice nursing-related MCQs for exam preparation.
Onboarding: Collect user details for personalized content.
Authentication: Secure login with Google via Firebase.
AI Chatbot: Local AI assistant powered by Ollama for platform guidance.

Setup Instructions

Clone the repository:
git clone <repository-url>
cd nursemate


Install dependencies:
npm install


Configure Firebase:

Create a Firebase project at console.firebase.google.com.
Copy your Firebase configuration and update src/services/firebase.js with your credentials.


Run the app:
npm start


Optional: Set up Ollama for AI chatbot:
1. Install Ollama from https://ollama.ai
2. Run: ollama pull llama3
3. Start Ollama service
4. See OLLAMA_SETUP.md for detailed instructions


Build for production:
npm run build



Tech Stack

Frontend: React, Tailwind CSS
Backend: Firebase (Authentication, Firestore)
AI: Ollama (Local LLM for chatbot)
Deployment: Firebase Hosting (recommended)

Future Enhancements

Add community forum for peer-to-peer Q&A.
Implement AI-driven resume builder.
Support multi-language clinical terms.
Add self-care reminders using browser notifications.

Contributing
Contributions are welcome! Please submit a pull request or open an issue for suggestions.
License
MIT