import React, { useState } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

const OnboardingForm = ({ user, setShowOnboarding }) => {
  const [formData, setFormData] = useState({
    nursingProgram: '',
    yearOfStudy: '',
    preferredLanguage: '',
    areaOfInterest: '',
    scheduleType: '',
    goals: '',
    phoneNumber: '',
    notificationsEnabled: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Saving profile for user:', user.uid);
      
      // Get existing user data to preserve role and organization info
      const userDocRef = doc(db, 'users', user.uid);
      
      // Update user document with additional profile information
      const profileData = {
        ...formData,
        updatedAt: new Date()
      };
      
      console.log('Profile data to save:', profileData);
      
      // Use merge: true to preserve existing data (role, universityId, hospitalId)
      await setDoc(userDocRef, profileData, { merge: true });
      
      console.log('Profile saved successfully');
      setShowOnboarding(false);
      console.log('Profile saved!');
    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
              console.error('Failed to save profile. Please try again. Error: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-100">
        <div className="px-6 sm:px-8 py-6 border-b bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="text-sm text-gray-600 mt-1">Tell us a bit about yourself to personalize your NurseMate experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nursing Program</label>
              <select
                name="nursingProgram"
                value={formData.nursingProgram}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                required
              >
                <option value="" disabled>Select your program</option>
                <option value="GNM">GNM</option>
                <option value="B.Sc.">B.Sc.</option>
                <option value="M.Sc.">M.Sc.</option>
          </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
              <select
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                required
              >
                <option value="" disabled>Select your year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                required
              >
                <option value="" disabled>Select a language</option>
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area of Interest</label>
              <input
                type="text"
                name="areaOfInterest"
                value={formData.areaOfInterest}
                onChange={handleChange}
                placeholder="e.g., Pediatrics, ICU, ER"
                className="w-full p-3 border rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Schedule Type</label>
              <select
                name="scheduleType"
                value={formData.scheduleType}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="" disabled>Select a schedule</option>
                <option value="Day">Day</option>
                <option value="Night">Night</option>
                <option value="Rotational">Rotational</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                placeholder="e.g., Job, Higher Studies, Specialization"
                rows={3}
                className="w-full p-3 border rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 resize-y"
              />
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Notification Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="notificationsEnabled"
                  name="notificationsEnabled"
                  checked={formData.notificationsEnabled}
                  onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable SMS notifications for shift reminders</span>
              </label>

              {formData.notificationsEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="e.g., +1234567890"
                    pattern="^\\+?[0-9]{7,15}$"
                    className="w-full p-3 border rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    required={formData.notificationsEnabled}
                  />
                  <p className="text-xs text-gray-500 mt-1">We will send SMS reminders for your upcoming shifts.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold shadow-md transition-colors">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingForm;