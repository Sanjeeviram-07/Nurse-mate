import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Users, MapPin, Edit3, Trash2, Info, Mail, Bell } from 'lucide-react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Chatbot from './Chatbot';

const ShiftPlanner = ({ user }) => {
  const [shifts, setShifts] = useState([]);
  const [currentShift, setCurrentShift] = useState({
    date: '',
    start_time: '',
    end_time: '',
    shift_type: '',
    department: '',
    notes: ''
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const departments = ['Emergency', 'ICU', 'Surgery', 'Pediatrics', 'Cardiology', 'Neurology'];
  const shiftTypes = ['Day Shift', 'Night Shift', 'Evening Shift', 'Weekend', 'On-Call'];
  const shiftColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500'];

  // Helper function to format date consistently
  const formatDate = (date) => {
    if (typeof date === 'string') {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.getFullYear() + '-' + 
               String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
               String(dateObj.getDate()).padStart(2, '0');
      }
    } else if (date && date.toDate) {
      const dateObj = date.toDate();
      return dateObj.getFullYear() + '-' + 
             String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
             String(dateObj.getDate()).padStart(2, '0');
    } else if (date instanceof Date) {
      return date.getFullYear() + '-' + 
             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
             String(date.getDate()).padStart(2, '0');
    }
    return date;
  };

  // Fetch shifts from Firebase
  const fetchShifts = async () => {
    try {
      console.log('Fetching shifts for user:', user?.uid || 'demo-user');
      
      // Test Firebase connection
      console.log('Testing Firebase connection...');
      const testCollection = collection(db, 'test');
      console.log('Firebase collection created successfully');
      
      const q = query(collection(db, 'shifts'), where('userId', '==', user?.uid || 'demo-user'));
      const querySnapshot = await getDocs(q);
      const shiftsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure date is in dd-mm-yyyy format
          date: data.date || formatDate(new Date())
        };
      });
      console.log('Fetched shifts:', shiftsData);
      setShifts(shiftsData);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      console.error('Firebase connection test failed:', error.message);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          setUserProfile(profileData);
          
          console.log('User profile loaded:', {
            phoneNumber: profileData.phoneNumber
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    console.log('ShiftPlanner useEffect - User:', user);
    console.log('Firebase db object:', db);
    
    if (user) {
      console.log('User authenticated, fetching shifts...');
      console.log('User UID:', user.uid);
      fetchShifts();
      fetchUserProfile();
    } else {
      console.log('No user authenticated');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('User object:', user);
      console.log('Current shift data:', currentShift);
      console.log('Firebase db object:', db);
      
      // Validate required fields
      if (!currentShift.date || !currentShift.start_time || !currentShift.end_time || !currentShift.shift_type || !currentShift.department) {
        setLoading(false);
        return;
      }


      
      // Test Firebase write permission
      console.log('Testing Firebase write permission...');
      const testDoc = {
        test: true,
        timestamp: new Date(),
        userId: user?.uid || 'demo-user'
      };
      
      // Get user profile to get hospitalId
      let hospitalId = null;
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            hospitalId = userData.hospitalId;
          }
        } catch (error) {
          console.error('Error getting user profile:', error);
        }
      }

      // Format date as dd-mm-yyyy
      const formatDateForSMS = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const shiftData = {
        date: formatDateForSMS(currentShift.date), // Save as dd-mm-yyyy format
        start_time: currentShift.start_time,
        end_time: currentShift.end_time,
        shift_type: currentShift.shift_type,
        department: currentShift.department,
        notes: currentShift.notes,

        userId: user?.uid || 'demo-user',
        nurseId: user?.uid || 'demo-user', // Add nurseId for consistency
        hospitalId: hospitalId, // Add hospitalId
        color: shiftColors[Math.floor(Math.random() * shiftColors.length)],
        createdAt: new Date().toISOString(),
        status: 'scheduled'
      };
      
      console.log('Shift data to save:', shiftData);
      console.log('Date validation:', {
        originalDate: currentShift.date,
        formattedDate: formatDateForSMS(currentShift.date),
        startTime: currentShift.start_time,
        endTime: currentShift.end_time
      });

      if (editingId) {
        // Update existing shift
        console.log('Updating shift with ID:', editingId);
        await updateDoc(doc(db, 'shifts', editingId), shiftData);
        setShifts(shifts.map(s => s.id === editingId ? { ...shiftData, id: editingId } : s));
        setEditingId(null);
        console.log('Shift updated successfully');
      } else {
        // Add new shift
        console.log('Adding new shift to Firebase...');
        
        // First, try a simple test write
        try {
          console.log('Testing simple write...');
          const testRef = await addDoc(collection(db, 'test'), { test: true, timestamp: new Date().toISOString() });
          console.log('Test write successful:', testRef.id);
        } catch (testError) {
          console.error('Test write failed:', testError);
        }
        
        const docRef = await addDoc(collection(db, 'shifts'), shiftData);
        const newShift = { ...shiftData, id: docRef.id };
        setShifts([...shifts, newShift]);
        console.log('Shift added successfully with ID:', docRef.id);
        
        // Shift saved successfully
        console.log('Shift saved successfully');
      }

      setCurrentShift({ date: '', start_time: '', end_time: '', shift_type: '', department: '', notes: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving shift:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      console.error(`Failed to save shift: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shift) => {
    // Map database fields to form fields
    const formData = {
      date: shift.date,
      start_time: shift.start_time || shift.time || '',
      end_time: shift.end_time || shift.endTime || '',
      shift_type: shift.shift_type || shift.type || '',
      department: shift.department || '',
      notes: shift.notes || ''
    };
    setCurrentShift(formData);
    setEditingId(shift.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await deleteDoc(doc(db, 'shifts', id));
        setShifts(shifts.filter(shift => shift.id !== id));
        console.log('Shift deleted successfully');
      } catch (error) {
        console.error('Error deleting shift:', error);
        console.error(`Failed to delete shift: ${error.message}`);
      }
    }
  };





  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      // Format date as dd-mm-yyyy to match database format
      const day = String(current.getDate()).padStart(2, '0');
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const year = current.getFullYear();
      const dateStr = `${day}-${month}-${year}`;
      
      const dayShifts = shifts.filter(shift => shift.date === dateStr);
      
      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth: current.getMonth() === month,
        shifts: dayShifts
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shift Planner</h1>
              <p className="text-gray-600 mt-2">Manage your schedule with intelligent planning tools</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Add Shift</span>
              </button>
            </div>
            

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Calendar View</h3>
                <p className="text-gray-600 text-sm">Visual schedule overview</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Edit3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Add/Edit Shift</h3>
                <p className="text-gray-600 text-sm">Dept, Time, Notes management</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <p className="text-gray-600 text-sm">Under process - Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendar().map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-100 ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${day.date.toDateString() === new Date().toDateString() ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="text-sm text-gray-500 mb-2">
                    {day.date.getDate()}
                  </div>
                  
                  {day.shifts.map((shift, shiftIndex) => (
                    <div
                      key={shiftIndex}
                      className={`text-xs p-1 mb-1 rounded text-white cursor-pointer ${shift.color || 'bg-blue-500'}`}
                      onClick={() => handleEdit(shift)}
                      title={`${shift.shift_type} - ${shift.department}`}
                    >
                      <div className="font-medium truncate">{shift.shift_type}</div>
                      <div className="truncate">{shift.department}</div>
                      <div className="text-xs opacity-75">
                        {shift.start_time} - {shift.end_time}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View/Edit Schedule Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">View/Edit Schedule</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {shifts.length} shift{shifts.length !== 1 ? 's' : ''} scheduled
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {shifts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Shift Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts
                      .sort((a, b) => {
                        // Sort by date (newest first)
                        const dateA = new Date(a.date.split('-').reverse().join('-'));
                        const dateB = new Date(b.date.split('-').reverse().join('-'));
                        return dateB - dateA;
                      })
                      .map((shift) => (
                        <tr key={shift.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${shift.color || 'bg-blue-500'}`}></div>
                              <span className="font-medium text-gray-900">
                                {shift.date}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {shift.start_time} - {shift.end_time}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {shift.shift_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{shift.department}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 max-w-xs">
                            <div className="truncate" title={shift.notes}>
                              {shift.notes || '-'}
                            </div>
                          </td>
                                                  <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(shift)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit shift"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(shift.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete shift"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                    // Show shift details in console
    console.log(`Shift Details: Date: ${shift.date}, Time: ${shift.start_time} - ${shift.end_time}, Type: ${shift.shift_type}, Department: ${shift.department}, Notes: ${shift.notes || 'None'}`);
                              }}
                              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts scheduled</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first shift to the schedule.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Your First Shift</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Shift Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingId ? 'Edit Shift' : 'Add New Shift'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={currentShift.date}
                  onChange={(e) => setCurrentShift({ ...currentShift, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={currentShift.start_time}
                    onChange={(e) => setCurrentShift({ ...currentShift, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={currentShift.end_time}
                    onChange={(e) => setCurrentShift({ ...currentShift, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift Type</label>
                <select
                  value={currentShift.shift_type}
                  onChange={(e) => setCurrentShift({ ...currentShift, shift_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select shift type</option>
                  {shiftTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={currentShift.department}
                  onChange={(e) => setCurrentShift({ ...currentShift, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={currentShift.notes}
                  onChange={(e) => setCurrentShift({ ...currentShift, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {loading ? 'Saving...' : (editingId ? 'Update Shift' : 'Add Shift')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setCurrentShift({ date: '', start_time: '', end_time: '', shift_type: '', department: '', notes: '' });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Schedule?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Take control of your work-life balance with intelligent shift planning.
          </p>
        </div>
      </div>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default ShiftPlanner;