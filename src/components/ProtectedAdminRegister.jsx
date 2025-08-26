import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const ProtectedAdminRegister = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'university-admin',
    university: '',
    hospital: ''
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');

  // Check if current user is super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'super-admin') {
            setIsSuperAdmin(true);
          } else {
            // Not super admin, redirect to home
            navigate('/');
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          navigate('/');
        }
      } else if (!loading) {
        // Not logged in, redirect to home
        navigate('/');
      }
      setCheckingAuth(false);
    };

    checkSuperAdmin();
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'university-admin' && !formData.university) {
      setError('University is required for university admin');
      return;
    }

    if (formData.role === 'hospital-admin' && !formData.hospital) {
      setError('Hospital is required for hospital admin');
      return;
    }

    try {
      // Create user with Firebase Auth
      const { user: newUser } = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Create user document with admin role
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid // Track who created this admin
      };

      // Add institution-specific data
      if (formData.role === 'university-admin') {
        userData.university = formData.university;
      } else if (formData.role === 'hospital-admin') {
        userData.hospital = formData.hospital;
      }

      await setDoc(doc(db, "users", newUser.uid), userData);

      // Sign out the new user (they should sign in with their own credentials)
      await auth.signOut();

      // Show success message
      console.log(`Admin account created successfully for ${formData.email}`);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'university-admin',
        university: '',
        hospital: ''
      });

    } catch (error) {
      console.error('Admin creation error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError(error.message || 'Failed to create admin account');
      }
    }
  };

  // Show loading while checking authentication
  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // If not super admin, this component won't render (redirected)
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Admin Account</h1>
            <p className="text-gray-600">Create new administrator accounts</p>
            <p className="text-xs text-red-600 mt-2">⚠️ Only super admins can access this page</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="Admin's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="admin@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              >
                <option value="university-admin">University Administrator</option>
                <option value="hospital-admin">Hospital Administrator</option>
              </select>
            </div>

            {formData.role === 'university-admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University/Institution
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="University name"
                />
              </div>
            )}

            {formData.role === 'hospital-admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital/Medical Center
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="Hospital name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="Create a strong password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="Confirm password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Create Admin Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 hover:underline"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedAdminRegister; 