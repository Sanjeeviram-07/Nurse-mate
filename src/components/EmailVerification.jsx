import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const EmailVerification = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
          <div className="px-8 py-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Email Verification Required</h1>
              <p className="text-blue-100 text-sm mt-1">Please verify your email to continue</p>
            </div>
          </div>

          <div className="px-8 py-6 space-y-4">
            <div className="text-center space-y-3">
              <p className="text-gray-700">
                We've sent a verification email to:
              </p>
              <p className="font-semibold text-blue-600">{user?.email}</p>
              <p className="text-sm text-gray-600">
                Please check your Gmail inbox and click the verification link to activate your account.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">What to do next:</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Check your Gmail inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return here and refresh the page</li>
                <li>Sign in with your verified account</li>
              </ol>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleRefresh}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                I've Verified My Email - Refresh
              </button>
              
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing Out...' : 'Back to Login'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 