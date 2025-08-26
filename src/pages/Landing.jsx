import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import AdminRegistration from '../components/AdminRegistration';


const Landing = () => {
  const navigate = useNavigate();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (!showAuthModal) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [showAuthModal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMobileMenu]);

  const openAuthModal = (registerMode = false) => {
    setIsRegister(registerMode);
    setShowAuthModal(true);
    setShowRegistration(false);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    setShowAuthModal(false);
    setIsRegister(false);
    setAuthError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const openRegistration = () => {
    setShowAuthModal(false);
    setShowRegistration(true);
    setIsRegister(true);
  };


  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      setAuthError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // For Google sign-in, we'll need to handle the profile creation differently
      // For now, redirect to home and let the onboarding handle it
      if (result.user) {
        navigate('/');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        setAuthError(
          `Unauthorized domain: ${window.location.host}. Add this domain in Firebase Console → Authentication → Settings → Authorized domains, then retry.`
        );
      } else {
        setAuthError(error.message || 'Failed to sign in with Google');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegistration = async (e) => {
    e?.preventDefault();
    try {
      setAuthLoading(true);
      setAuthError('');
      
      // Create user with Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document with student role
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: "student",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setAuthLoading(false);
      navigate('/');
    } catch (error) {
      setAuthLoading(false);
      console.error('Registration Error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password is too weak');
      } else {
        setAuthError(error.message || 'Registration failed');
      }
    }
  };

  const handleEmailAuth = async (e) => {
    e?.preventDefault();
    try {
      setAuthLoading(true);
      setAuthError('');
      if (isRegister) {
        await handleRegistration(e);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (error) {
      console.error('Email Auth Error:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        setAuthError(
          `Unauthorized domain: ${window.location.host}. Add this domain in Firebase Console → Authentication → Settings → Authorized domains.`
        );
      } else {
        setAuthError(error.message || 'Authentication failed');
      }
    } finally {
      setAuthLoading(false);
    }
  };



  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 pt-20">
      {/* Pill Navbar matching home theme */}
      <div className="fixed top-4 left-0 right-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-full navbar-pill text-white h-14 px-3 sm:px-5 flex items-center justify-between">
            {/* Brand */}
            <button onClick={() => navigate('/')} className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 grid place-items-center shadow-inner">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="hidden sm:inline text-lg font-semibold tracking-tight">NurseMate</span>
            </button>

            {/* Center links */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="nav-link-pill text-slate-200 hover:text-white">Home</button>
              <button onClick={scrollToFeatures} className="nav-link-pill text-slate-200 hover:text-white">Features</button>
              <a href="#contact" className="nav-link-pill text-slate-200 hover:text-white">Contact</a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden mobile-menu-container">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="nav-link-pill text-slate-200 hover:text-white p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openAuthModal(false)}
                className="nav-link-pill text-slate-200 hover:text-white"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/register-nurse')}
                className="px-3 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white border border-white/10 transition-colors"
              >
                Register as Nurse
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed top-20 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700 mobile-menu-container">
          <div className="px-4 py-4 space-y-2">
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setShowMobileMenu(false); }}
              className="block w-full text-left text-slate-200 hover:text-white py-2 px-3 rounded transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => { scrollToFeatures(); setShowMobileMenu(false); }}
              className="block w-full text-left text-slate-200 hover:text-white py-2 px-3 rounded transition-colors"
            >
              Features
            </button>
            <a 
              href="#contact"
              onClick={() => setShowMobileMenu(false)}
              className="block w-full text-left text-slate-200 hover:text-white py-2 px-3 rounded transition-colors"
            >
              Contact
            </a>

            <button 
              onClick={() => { navigate('/register-nurse'); setShowMobileMenu(false); }}
              className="block w-full text-left text-slate-200 hover:text-white py-2 px-3 rounded transition-colors"
            >
              Register as Nurse
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center px-6 py-16">
        <motion.h1
          className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Streamline Your Nursing
          <br />
          <span className="text-blue-600">Education Journey</span>
        </motion.h1>
        
        <motion.p
          className="text-xl text-gray-600 mt-6 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Manage clinical logs, schedule shifts, and enhance your skills with 
          AI-powered practice quizzes designed for nursing success.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button 
            onClick={() => navigate('/register-nurse')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
          >
            Register as Nurse
          </button>
          <button 
            className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium transition-colors"
            onClick={scrollToFeatures}
          >
            Learn More
          </button>
        </motion.div>

        {/* Upload Placeholder */}
        <motion.div
          className="mt-16 bg-white rounded-2xl p-12 shadow-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Clinical Log Entry</h3>
            <p className="text-gray-600">Log • Track • Excel</p>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features-section" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Success, Our Technology</h2>
            <p className="text-xl text-gray-600">
              Experience comprehensive nursing education tools designed for modern healthcare professionals
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {/* Feature cards unchanged */}
            <motion.div
              className="text-center p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
              variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Clinical Log Management</h3>
              <p className="text-gray-600">
                Record and track clinical hours with intelligent categorization and progress monitoring.
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
              variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Study Assistant</h3>
              <p className="text-gray-600">
                Chat with our intelligent assistant for personalized study guidance and nursing concepts.
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
              variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shift Scheduling</h3>
              <p className="text-gray-600">
                Plan and organize your clinical rotations with smart scheduling and reminder systems.
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
              variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Safe & Secure</h3>
              <p className="text-gray-600">
                Your educational data is protected with enterprise-grade security and privacy measures.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Ready to Excel in Your Nursing Career?
          </motion.h2>
          <motion.p
            className="text-xl text-blue-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands of nursing students who trust NurseMate for comprehensive 
            clinical training and education management
          </motion.p>
          <motion.button
            onClick={() => openAuthModal(false)}
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Start Your Nursing Journey
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold text-blue-400 mb-4">NurseMate</div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Empowering nursing students with comprehensive tools for clinical training, 
                education management, and professional development.
              </p>
              <p className="text-sm text-gray-500">Made with Care for Future Nurses</p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/about')} className="text-gray-400 hover:text-white transition-colors">About Us</button></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>

              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">support@nursemate.com</li>
                <li className="text-gray-400">24/7 Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500">© 2025 NurseMate. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegistration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRegistration(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <AdminRegistration 
                onSuccess={handleRegistrationSuccess}
                onCancel={() => setShowRegistration(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500">
                <h3 className="text-white text-lg font-semibold">
                  {isRegister ? 'Create your student account' : 'Welcome back'}
                </h3>
                <button onClick={() => setShowAuthModal(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="px-6 py-5 space-y-4">
                {authError && (
                  <div className="bg-red-50 text-red-700 border border-red-200 text-sm rounded-lg px-3 py-2">
                    {authError}
                  </div>
                )}

                {isRegister && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your full name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                </div>



                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  {authLoading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
                </button>

                <div className="relative text-center">
                  <span className="px-3 text-sm text-gray-500 bg-white relative z-10">or</span>
                  <div className="absolute inset-x-0 top-1/2 border-t border-gray-200 -z-0" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  <span>Continue with Google</span>
                </button>

                <div className="text-center text-sm text-gray-600">
                  {isRegister ? (
                    <>
                      Already have an account?{' '}
                      <button type="button" className="text-blue-600 hover:underline" onClick={() => setIsRegister(false)}>
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      New to NurseMate?{' '}
                      <button type="button" className="text-blue-600 hover:underline" onClick={() => setIsRegister(true)}>
                        Create an account
                      </button>
                    </>
                  )}
                  
                  {isRegister && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      <p>Need a student account?{' '}
                        <button 
                          type="button" 
                          className="text-blue-600 hover:text-blue-700 hover:underline" 
                          onClick={() => window.location.href = '/register-student'}
                        >
                          Register as Student
                        </button>
                      </p>
                    </div>
                  )}
                </div>


              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing; 