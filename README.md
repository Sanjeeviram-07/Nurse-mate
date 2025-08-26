# NurseMate - All-in-One Nursing Student Companion

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.2-orange.svg)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-2.2.19-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Your comprehensive digital companion for nursing education, clinical practice, and career development.**

## Features

### **Educational Tools**
- **Interactive Quiz System** - Practice nursing MCQs with instant feedback and progress tracking
- **Clinical Logbook** - Document patient cases, procedures, and clinical experiences
- **AI-Powered Learning Assistant** - Get instant help with nursing concepts and procedures

### **Clinical Management**
- **Shift Planner** - Visualize and manage your nursing shifts with drag-and-drop interface
- **Clinical Logs** - Track patient vitals, medications, and care plans
- **Patient Case Management** - Organize and review clinical experiences

### **User Management & Authentication**
- **Multi-Role System** - Support for Students, Nurses, Hospital Admins, and Super Admins
- **Secure Authentication** - Firebase-powered login with Google OAuth
- **Role-Based Access Control** - Different dashboards and permissions for each user type
- **Profile Management** - Comprehensive user profiles with professional details

### **Advanced Features**
- **AI Chatbot** - Local AI assistant powered by Ollama for platform guidance
- **Resume Builder** - Professional resume creation with nursing-specific templates
- **Email Verification** - Secure account verification system
- **Mobile-Responsive Design** - Works seamlessly on all devices

### **Admin Features**
- **Super Admin Dashboard** - Complete system oversight and user management
- **Hospital Admin Dashboard** - Manage hospital-specific users and settings
- **User Registration Management** - Controlled access and invitation system
- **Analytics & Reporting** - Monitor platform usage and user engagement

##  Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing and navigation

### **Backend & Services**
- **Firebase** - Authentication, Firestore database, and hosting
- **Express.js** - Custom server for additional backend functionality
- **Node.js** - Server-side JavaScript runtime

### **AI & Machine Learning**
- **Ollama** - Local large language model for AI chatbot
- **Google Generative AI** - Cloud-based AI services integration

### **Development Tools**
- **Webpack** - Module bundling and optimization
- **Babel** - JavaScript transpilation
- **ESLint** - Code quality and consistency

## Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase account
- Git

### **1. Clone the Repository**
```bash
git clone https://github.com/Sanjeeviram-07/NurseMate.git
cd NurseMate
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Firebase Configuration**
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Google Sign-in)
3. Create a Firestore database
4. Download your Firebase config file
5. Update `src/services/firebase.js` with your credentials

### **4. Environment Variables**
Create a `.env` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### **5. Start Development Server**
```bash
npm start
```

Your app will be available at `http://localhost:3000`

## Advanced Setup

### **Ollama AI Setup (Optional)**
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull the required model:
   ```bash
   ollama pull llama3
   ```
3. Start Ollama service:
   ```bash
   ollama serve
   ```

### **Firebase Functions Setup**
```bash
cd functions
npm install
npm run deploy
```

### **Production Build**
```bash
npm run build
```

## 📱 Usage Guide

### **For Nursing Students**
1. **Register** with your student credentials
2. **Complete onboarding** to personalize your experience
3. **Access clinical logbook** to document your clinical experiences
4. **Practice with quizzes** to prepare for exams
5. **Use AI chatbot** for instant help with nursing concepts

### **For Nurses**
1. **Log in** with your professional credentials
2. **Manage shifts** using the shift planner
3. **Document clinical cases** in the logbook
4. **Build your resume** with the resume builder
5. **Track your progress** and achievements

### **For Hospital Administrators**
1. **Access admin dashboard** with elevated permissions
2. **Manage user registrations** and access control
3. **Monitor platform usage** and user engagement
4. **Generate reports** on clinical activities

### **For Super Administrators**
1. **Complete system oversight** and management
2. **User role management** and permissions
3. **System configuration** and settings
4. **Analytics and reporting** across all hospitals

##  Project Structure

```
NurseMate/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── services/           # API and external services
│   ├── ai/                 # AI and chatbot functionality
│   └── styles.css          # Global styles
├── functions/              # Firebase Cloud Functions
├── public/                 # Static assets
├── server.js              # Custom Express server
└── package.json           # Dependencies and scripts
```

## Security Features

- **Firebase Authentication** - Secure user authentication
- **Role-based Access Control** - Different permissions for different user types
- **Protected Routes** - Secure access to sensitive features
- **Environment Variables** - Secure configuration management
- **Input Validation** - Protection against malicious input

## Deployment

### **Firebase Hosting (Recommended)**
```bash
npm run build
firebase deploy
```

### **Other Platforms**
- **Vercel** - Zero-config deployment
- **Netlify** - Easy static site hosting
- **AWS S3** - Scalable cloud hosting

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow React best practices
- Use TypeScript for new components (optional)
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

##  Performance

- **Lazy Loading** - Components load on demand
- **Code Splitting** - Optimized bundle sizes
- **Image Optimization** - Compressed and optimized assets
- **Caching** - Efficient data and resource caching

##  Troubleshooting

### **Common Issues**

**Firebase Connection Error**
- Verify your Firebase configuration
- Check if your project is active
- Ensure proper API keys

**Ollama AI Not Working**
- Verify Ollama is running: `ollama serve`
- Check if the model is downloaded: `ollama list`
- Restart the Ollama service

**Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all environment variables are set

##  Roadmap

### **Phase 1 (Current)**
- ✅ Core authentication and user management
- ✅ Clinical logbook and shift planning
- ✅ Quiz system and AI chatbot
- ✅ Basic admin dashboards

### **Phase 2 (Next)**
- 🔄 Advanced analytics and reporting
- 🔄 Mobile app development
- 🔄 Integration with hospital systems
- 🔄 Enhanced AI capabilities

### **Phase 3 (Future)**
- 📋 Community features and peer learning
- 📋 Advanced clinical decision support
- 📋 Multi-language support
- 📋 Offline functionality

## Support

- **Documentation**: [GitHub Wiki](https://github.com/Sanjeeviram-07/NurseMate/wiki)
- **Issues**: [GitHub Issues](https://github.com/Sanjeeviram-07/NurseMate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Sanjeeviram-07/NurseMate/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **Firebase Team** - For the excellent backend services
- **React Community** - For the amazing frontend framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Ollama Team** - For local AI capabilities

---

<div align="center">

**Built for the nursing community**

[![GitHub stars](https://img.shields.io/github/stars/Sanjeeviram-07/NurseMate?style=social)](https://github.com/Sanjeeviram-07/NurseMate/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Sanjeeviram-07/NurseMate?style=social)](https://github.com/Sanjeeviram-07/NurseMate/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Sanjeeviram-07/NurseMate)](https://github.com/Sanjeeviram-07/NurseMate/issues)

</div>
