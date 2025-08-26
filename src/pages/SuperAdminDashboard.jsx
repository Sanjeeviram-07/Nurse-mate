import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { 
  getHospitals, 
  getHospitalAdmins, 
  createHospitalAdmin,
  resetHospitalAdminPassword,
  deleteHospitalAdmin
} from '../services/firebase';

const SuperAdminDashboard = () => {
  const [hospitals, setHospitals] = useState([]);
  const [hospitalAdmins, setHospitalAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalAddress: '',
    deanName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading super admin dashboard data...');
      console.log('Current user:', auth.currentUser);
      
      const [hospitalsData, adminsData] = await Promise.all([
        getHospitals(),
        getHospitalAdmins()
      ]);
      setHospitals(hospitalsData);
      setHospitalAdmins(adminsData);
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/superadmin-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddHospitalAdmin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createHospitalAdmin(formData);
      setFormData({
        hospitalName: '',
        hospitalAddress: '',
        deanName: '',
        adminEmail: '',
        adminPassword: ''
      });
      setShowAddForm(false);
      await loadData(); // Reload data
              console.log('✅ Hospital admin created successfully!\n\nHospital: ' + formData.hospitalName + '\nAdmin Email: ' + formData.adminEmail + '\n\nHospital admin can now log in using the main login page with their email and password.');
    } catch (error) {
      console.error('Error creating hospital admin:', error);
              console.error('Failed to create hospital admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (adminId) => {
    if (window.confirm('Are you sure you want to reset this admin\'s password?')) {
      try {
        await resetHospitalAdminPassword(adminId);
        console.log('Password reset email sent successfully');
      } catch (error) {
        console.error('Error resetting password:', error);
                  console.error('Failed to reset password: ' + error.message);
      }
    }
  };

  const handleDeleteAdmin = async (adminId, hospitalId) => {
    if (window.confirm('Are you sure you want to delete this hospital admin? This action cannot be undone.')) {
      try {
        await deleteHospitalAdmin(adminId, hospitalId);
        await loadData(); // Reload data
        console.log('Hospital admin deleted successfully');
      } catch (error) {
        console.error('Error deleting admin:', error);
                  console.error('Failed to delete admin: ' + error.message);
      }
    }
  };

  if (loading && hospitals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-sm text-gray-600">NurseMate System Administration</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Hospital Admin Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Hospital Administration</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {showAddForm ? 'Cancel' : 'Add Hospital Admin'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddHospitalAdmin} className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                  <input
                    type="text"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter hospital name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Address</label>
                  <input
                    type="text"
                    value={formData.hospitalAddress}
                    onChange={(e) => setFormData({...formData, hospitalAddress: e.target.value})}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter hospital address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dean Name</label>
                  <input
                    type="text"
                    value={formData.deanName}
                    onChange={(e) => setFormData({...formData, deanName: e.target.value})}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter dean name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@hospital.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
                  <input
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter admin password"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Hospital Admin'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Hospital Admins List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Hospital Admins ({hospitalAdmins.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dean</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hospitalAdmins.map((admin) => (
                  <tr key={admin.uid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{admin.hospitalName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.email}</div>
                      <div className="text-sm text-gray-500">{admin.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {admin.deanName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {admin.hospitalAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleResetPassword(admin.uid)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin.uid, admin.hospitalId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard; 