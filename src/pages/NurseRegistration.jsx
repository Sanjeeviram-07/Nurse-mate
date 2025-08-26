import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getHospitals, isValidGmail } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const NurseRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    hospitalId: ''
  });
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      setError('');
      const hospitalsData = await getHospitals();
      setHospitals(hospitalsData);
      
      if (hospitalsData.length === 0) {
        setError('No hospitals found. Please contact your administrator to add hospitals first.');
      }
    } catch (error) {
      console.error('Error loading hospitals:', error);
      
      // Provide specific error messages based on the error
      if (error.message.includes('permission') || error.message.includes('permissions')) {
        setError('Access denied. Firestore rules need to be updated. Please contact your administrator.');
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('Failed to load hospitals. Please try again or contact support.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.hospitalId) {
      setError('Please select a hospital');
      return;
    }

    // Gmail validation
    if (!isValidGmail(formData.email)) {
      setError('Only Gmail addresses are accepted. Please use a valid Gmail account.');
      return;
    }

    try {
      setLoading(true);
      
      // Register nurse with hospital assignment
      await registerUser(
        formData.email,
        formData.password,
        formData.name,
        'nurse',
        formData.hospitalId
      );

      setLoading(false);
      
      // Sign out the user after successful registration
      try {
        await signOut(auth);
        console.log('Registration successful! Please check your Gmail inbox for a verification email. You must verify your email before you can log in.');
        navigate('/');
      } catch (signOutError) {
        console.error('Error signing out after registration:', signOutError);
        console.log('Registration successful! Please check your Gmail inbox for a verification email. You must verify your email before you can log in.');
        navigate('/');
      }
    } catch (error) {
      setLoading(false);
      console.error('Nurse registration error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError(error.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
          <div className="px-8 py-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
            <h1 className="text-2xl font-bold text-white text-center">Nurse Registration</h1>
            <p className="text-blue-100 text-sm text-center mt-1">Join NurseMate as a Student Nurse</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gmail Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="yourname@gmail.com"
              />
              <p className="text-xs text-gray-500 mt-1">Only Gmail addresses are accepted</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Hospital</label>
              {hospitals.length > 0 ? (
                <select
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a hospital...</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name} - {hospital.address}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2">
                  <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    No hospitals available
                  </div>
                  <button
                    type="button"
                    onClick={loadHospitals}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ↻ Retry loading hospitals
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Create a strong password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>

          <div className="px-8 py-4 bg-gray-50 border-t">
            <p className="text-xs text-gray-500 text-center">
              By registering, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseRegistration; 