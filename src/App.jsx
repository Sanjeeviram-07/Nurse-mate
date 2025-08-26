import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import ClinicalLogs from './pages/ClinicalLogs';
import ShiftPlanner from './pages/ShiftPlanner';
import Quiz from './pages/Quiz';
import ResumeBuilder from './pages/ResumeBuilder';
import Profile from './pages/Profile';

import AdminDashboard from './pages/AdminDashboard';
import StudentRegister from './components/StudentRegister';
import ProtectedAdminRegister from './components/ProtectedAdminRegister';
import { BackgroundWrapper } from './components/ui/background-wrapper';
import { auth, db, checkUserRole } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import RouteTransitionLoader from './components/RouteTransitionLoader';
import ProtectedRoute from './components/ProtectedRoute';
import EmailVerification from './components/EmailVerification';

// New imports for role-based architecture
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import HospitalAdminDashboard from './pages/HospitalAdminDashboard';
import NurseRegistration from './pages/NurseRegistration';

const App = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            setShowOnboarding(true);
            setUserRole(null);
            setEmailVerified(false);
          } else {
            setShowOnboarding(false);
            const userData = docSnap.data();
            setUserRole(userData.role);
            // Check if user is a nurse/student and if email is verified
            if ((userData.role === 'nurse' || userData.role === 'student') && !user.emailVerified) {
              setEmailVerified(false);
            } else {
              setEmailVerified(true);
            }
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
          setShowOnboarding(false);
          setUserRole(null);
          setEmailVerified(false);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setShowOnboarding(false);
        setEmailVerified(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Role-based redirect logic
  const getRedirectPath = (role) => {
    switch (role) {
      case 'super-admin':
        return '/superadmin-dashboard';
      case 'hospital-admin':
        return '/hospital-admin-dashboard';
      case 'nurse':
      case 'student':
        return '/'; // Nurse/Student dashboard (existing Home page)
      default:
        return '/';
    }
  };

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

  return (
    <Router>
      <BackgroundWrapper variant="tertiary">
        {user && userRole && (userRole === 'nurse' || userRole === 'student' || userRole === 'hospital-admin') && <Navbar user={user} />}
        <RouteTransitionLoader />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            user ? (
              userRole === 'super-admin' ? (
                <Navigate to="/superadmin-dashboard" replace />
              ) : userRole === 'hospital-admin' ? (
                <Navigate to="/hospital-admin-dashboard" replace />
              ) : userRole === 'nurse' || userRole === 'student' ? (
                emailVerified ? (
                  <Home user={user} showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding} />
                ) : (
                  <EmailVerification user={user} />
                )
              ) : (
                <Home user={user} showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding} />
              )
            ) : (
              <Landing />
            )
          } />
          
          {/* Super Admin routes (completely separate) */}
          <Route path="/superadmin-login" element={
            user && userRole === 'super-admin' ? (
              <Navigate to="/superadmin-dashboard" replace />
            ) : (
              <SuperAdminLogin />
            )
          } />
          
          <Route path="/superadmin-dashboard" element={
            <ProtectedRoute user={user} allowedRoles={['super-admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />

          {/* Hospital Admin routes */}
          <Route path="/hospital-admin-dashboard" element={
            <ProtectedRoute user={user} allowedRoles={['hospital-admin']}>
              <HospitalAdminDashboard />
            </ProtectedRoute>
          } />

          {/* Nurse Registration */}
          <Route path="/register-nurse" element={<NurseRegistration />} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/register-student" element={<StudentRegister />} />
          
          {/* Protected Admin routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute user={user} allowedRoles={['hospital-admin', 'university-admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/register-admin" 
            element={
              <ProtectedRoute user={user} allowedRoles={['super-admin']}>
                <ProtectedAdminRegister />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Nurse routes (formerly student routes) */}
          <Route 
            path="/clinical-logs" 
            element={
              <ProtectedRoute user={user} allowedRoles={['nurse', 'student']}>
                <ClinicalLogs user={user} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/shift-planner" 
            element={
              <ProtectedRoute user={user} allowedRoles={['nurse', 'student']}>
                <ShiftPlanner user={user} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/quiz" 
            element={
              <ProtectedRoute user={user} allowedRoles={['nurse', 'student']}>
                <Quiz user={user} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/resume-builder" 
            element={
              <ProtectedRoute user={user} allowedRoles={['nurse', 'student']}>
                <ResumeBuilder user={user} />
              </ProtectedRoute>
            } 
          />
          
          {/* Profile route - accessible to hospital admins, nurses, and nursing students */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute user={user} allowedRoles={['nurse', 'student', 'hospital-admin']}>
                <Profile user={user} />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BackgroundWrapper>
    </Router>
  );
};

export default App;