import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { checkUserRole } from '../services/firebase';
import { BackgroundWrapper } from './ui/background-wrapper';
import EmailVerification from './EmailVerification';

const ProtectedRoute = ({ user, allowedRoles = [], children, redirectTo = '/' }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (user) {
        try {
          const role = await checkUserRole(user.uid);
          setUserRole(role);
          
          // Check email verification for nurse/student roles
          if ((role === 'nurse' || role === 'student') && !user.emailVerified) {
            setEmailVerified(false);
          } else {
            setEmailVerified(true);
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          setUserRole(null);
          setEmailVerified(false);
        }
      } else {
        setUserRole(null);
        setEmailVerified(false);
      }
      setLoading(false);
    };

    checkRole();
  }, [user]);

  if (loading) {
    return (
      <BackgroundWrapper variant="tertiary">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return (
      <BackgroundWrapper variant="tertiary">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-md max-w-md mx-auto border border-orange-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access this page.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-orange"
            >
              Go to Login
            </button>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  // If no specific roles are required, allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is allowed and email is verified (for nurse/student roles)
  if (userRole && allowedRoles.includes(userRole)) {
    if ((userRole === 'nurse' || userRole === 'student') && !emailVerified) {
      return <EmailVerification user={user} />;
    }
    return children;
  }

  // Role not allowed, redirect based on user's role
  if (userRole === 'student') {
    return <Navigate to="/" replace />;
  } else if (userRole === 'hospital-admin' || userRole === 'university-admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Default redirect
  return <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute; 