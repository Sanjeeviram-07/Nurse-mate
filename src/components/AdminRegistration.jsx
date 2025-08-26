import React, { useState } from 'react';
import { registerUser } from '../services/firebase';

const AdminRegistration = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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



    try {
      setLoading(true);
      
      // Use the new registerUser function with admin role
      const result = await registerUser(
        formData.email,
        formData.password,
        formData.name,
        'hospital-admin' // Default admin role
      );

      setLoading(false);
      onSuccess(`Account created successfully! Role: ${result.userDoc.role}`);
    } catch (error) {
      setLoading(false);
      console.error('Admin registration error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError(error.message || 'Failed to create account');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-red-100">
        <div className="px-6 sm:px-8 py-6 border-b bg-gradient-to-r from-red-50 to-red-100 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Account Registration</h2>
          <p className="text-sm text-gray-600 mt-1">Create your administrator account.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-4">
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
              placeholder="Your full name"
              autoComplete="name"
              className="w-full p-3 border rounded-lg border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/40 transition-shadow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              autoComplete="email"
              className="w-full p-3 border rounded-lg border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/40 transition-shadow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              autoComplete="new-password"
              className="w-full p-3 border rounded-lg border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/40 transition-shadow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className="w-full p-3 border rounded-lg border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/40 transition-shadow"
              required
            />
          </div>



          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-semibold shadow-md transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistration; 