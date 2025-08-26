import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userData, setUserData] = useState(null);

  const isActive = (path) => location.pathname === path;

  // Check if user has admin role and get user name
  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
                  if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
          if (userData.role === 'admin') {
            setIsAdmin(true);
            setUserName(userData.name || 'Admin');
          } else {
            setIsAdmin(false);
            setUserName(userData.name || 'Student');
          }
        } else {
          setIsAdmin(false);
          setUserName('User');
        }
        } catch (error) {
          console.error('Error checking user role:', error);
          setIsAdmin(false);
          setUserName('User');
        }
      } else {
        setIsAdmin(false);
        setUserName('');
      }
      setLoading(false);
    };

    checkUserRole();
  }, [user]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut(auth);
        localStorage.removeItem('nursemate_completed_topics');
        navigate('/');
      } catch (error) {
        console.error('Error signing out:', error);
        console.error('Failed to logout. Please try again.');
      }
    }
  };

  // Student navigation links - only show for nursing students
  const studentNavLinks = [
    { to: '/clinical-logs', label: 'Clinical Logs' },
    { to: '/shift-planner', label: 'Shift Planner' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/resume-builder', label: 'Resume Builder' },
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-[60] pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-auto flex items-center justify-between rounded-full bg-white shadow-md border border-blue-100 text-gray-800 px-3 sm:px-5 h-14">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 grid place-items-center shadow-inner">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="hidden sm:inline text-2xl font-bold text-gray-800">NurseMate</span>
          </Link>

          {/* Links */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`transition-colors text-base p-2 rounded ${
                  isActive('/') ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                }`}
              >
                Home
              </Link>
              
              {/* Show navigation links based on user role */}
              {(userData?.role === 'student' || userData?.role === 'nurse') && studentNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`transition-colors text-base p-2 rounded ${
                    isActive(link.to) ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Show admin dashboard link for hospital admins */}
              {userData?.role === 'hospital-admin' && (
                <Link
                  to="/admin/dashboard"
                  className={`transition-colors text-base p-2 rounded ${
                    isActive('/admin/dashboard') ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                  }`}
                >
                  Admin Dashboard
                </Link>
              )}
            </div>

            {/* Compact scrollable links on small screens */}
            <div className="md:hidden flex items-center space-x-6 overflow-x-auto no-scrollbar px-2">
              {[
                { to: '/', label: 'Home' },
                // Show navigation links based on user role
                ...((userData?.role === 'student' || userData?.role === 'nurse') ? studentNavLinks : []),
                // Add Admin Dashboard link for hospital admins
                ...(userData?.role === 'hospital-admin' ? [{ to: '/admin/dashboard', label: 'Admin Dashboard' }] : []),
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`whitespace-nowrap text-sm transition-colors p-2 rounded ${
                    isActive(item.to) ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User / Logout */}
          <div className="flex items-center space-x-4">
            {/* Admin Link - Only visible to admin users */}
            {!loading && userData?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors font-medium"
              >
                Admin
              </Link>
            )}
            
            <Link 
              to="/profile" 
              className="hidden sm:inline text-gray-600 font-medium hover:text-blue-500 transition-colors cursor-pointer"
            >
              {userName}
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;