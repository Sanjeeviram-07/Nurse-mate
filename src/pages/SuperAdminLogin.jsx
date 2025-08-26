import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { checkUserRole } from '../services/firebase';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting to sign in with:', email);
      console.log('Firebase auth object:', auth);
      console.log('Current auth state:', auth.currentUser);
      
      // Sign in with Firebase Auth
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful, user ID:', user.uid);
      
      // Check if user is super admin
      const role = await checkUserRole(user.uid);
      console.log('User role:', role);
      
      if (role === 'super-admin') {
        console.log('Super admin confirmed, navigating to dashboard');
        navigate('/superadmin-dashboard');
      } else {
        console.log('Access denied, role is:', role);
        setError('Access denied. Super admin privileges required.');
        await auth.signOut();
      }
    } catch (error) {
      console.error('Super admin login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid credentials');
      } else {
        setError(error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden">
          <div className="px-8 py-6 border-b bg-gradient-to-r from-red-600 to-red-500">
            <h1 className="text-2xl font-bold text-white text-center">Super Admin Portal</h1>
            <p className="text-red-100 text-sm text-center mt-1">NurseMate System Administration</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="superadmin@nursemate.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="px-8 py-4 bg-gray-50 border-t">
            <p className="text-xs text-gray-500 text-center">
              This portal is restricted to authorized super administrators only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin; 