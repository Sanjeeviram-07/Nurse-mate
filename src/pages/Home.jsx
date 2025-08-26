import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Brain } from 'lucide-react';
import OnboardingForm from '../components/OnboardingForm';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Chatbot from '../components/Chatbot';

const Home = ({ user, showOnboarding, setShowOnboarding }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'admin') {
              setIsAdmin(true);
              setUserName(userData.name || 'Admin');
            } else {
              setIsAdmin(false);
              setUserName(userData.name || 'Student');
            }
          } else {
            setIsAdmin(false);
            setUserName('Student');
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          setIsAdmin(false);
          setUserName('Student');
        }
      } else {
        setIsAdmin(false);
        setUserName('');
      }
      setLoading(false);
    };

    checkUserRole();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
        {showOnboarding ? (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Welcome to NurseMate</h1>
            <OnboardingForm user={user} setShowOnboarding={setShowOnboarding} />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Hero Welcome Section */}
            <div className="text-center space-y-6">
              <div className="relative">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Welcome, {userName}
                </h1>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-xl"></div>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {isAdmin ? 'Admin Dashboard - Manage the NurseMate platform' : 'Your all-in-one nursing student companion'}
              </p>
              
              {/* Background Illustration */}
              <div className="relative mt-8">
                <svg className="w-full h-32 opacity-10" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 100C133.333 50 266.667 50 400 100C533.333 150 666.667 150 800 100V200H0V100Z" fill="url(#gradient)"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6"/>
                      <stop offset="50%" stopColor="#8B5CF6"/>
                      <stop offset="100%" stopColor="#1E40AF"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            {/* Admin Dashboard Link - Only show for admin users */}
            {isAdmin && (
              <div className="text-center">
                <Link 
                  to="/admin/dashboard" 
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Access Admin Dashboard
                </Link>
              </div>
            )}
            
            {/* Quick Access Cards Section - Only show for non-admin users */}
            {!isAdmin && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Clinical Logbook Card */}
                  <Link to="/clinical-logs" className="group">
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        Clinical Logbook
                      </h3>
                      <p className="text-gray-600 leading-relaxed flex-grow">
                        Track patient cases and procedures with detailed logging and progress monitoring
                      </p>
                    </div>
                  </Link>
                  
                  {/* Shift Planner Card */}
                  <Link to="/shift-planner" className="group">
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                        Shift Planner
                      </h3>
                      <p className="text-gray-600 leading-relaxed flex-grow">
                      Manage your nursing shifts with smart scheduling. Never miss a shift again.
                      </p>
                    </div>
                  </Link>
                  
                  {/* Nursing Quiz Card */}
                  <Link to="/quiz" className="group">
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                        Nursing Quiz
                      </h3>
                      <p className="text-gray-600 leading-relaxed flex-grow">
                        Practice nursing knowledge with interactive quizzes and instant feedback
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Second Row - Resume Builder */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mt-8">
                  {/* Resume Builder Card */}
                  <Link to="/resume-builder" className="group">
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-green-200 transform hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                        Resume Builder
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Create professional medical resumes with AI-powered templates and real-time preview
                      </p>
                    </div>
                  </Link>
                </div>
              </>
            )}

          </div>
        )}
      </div>

      {/* Minimal dark footer */}
      <footer className="mt-8 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-slate-700/50" />
          <p className="py-4 text-center text-sm text-slate-300">© 2025 NurseMate. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Chatbot for students */}
      {!isAdmin && <Chatbot userRole="nurse" />}
    </div>
  );
};

export default Home;