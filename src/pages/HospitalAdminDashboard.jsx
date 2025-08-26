import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { 
  getCurrentUser,
  getNurseClinicalLogs,
  getNurseShifts
} from '../services/firebase';
import Chatbot from '../components/Chatbot';

const HospitalAdminDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [clinicalLogs, setClinicalLogs] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current user data
      const user = await getCurrentUser();
      if (!user || user.role !== 'hospital-admin') {
        throw new Error('Access denied. Hospital admin privileges required.');
      }
      setCurrentUser(user);

      // Load nurse data for this hospital
      const [logsData, shiftsData] = await Promise.all([
        getNurseClinicalLogs(user.hospitalId),
        getNurseShifts(user.hospitalId)
      ]);
      
      setClinicalLogs(logsData);
      setShifts(shiftsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      console.error('Error loading dashboard: ' + error.message);
      await handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      console.log('No data to export');
      return;
    }

    // Define proper headers and data mapping for clinical logs
    if (filename === 'clinical_logs') {
      const headers = [
        'Nurse Name',
        'Nurse Email', 
        'Date',
        'Department',
        'Case Title',
        'Patient Summary',
        'Procedures',
        'Supervisor Name',
        'Status',
        'Timestamp'
      ];

      const csvRows = data.map(log => [
        log.nurseName || 'N/A',
        log.nurseEmail || 'N/A',
        log.date ? new Date(log.date).toLocaleDateString() : 'N/A',
        log.department || 'N/A',
        log.caseTitle || 'N/A',
        log.patientSummary || 'N/A',
        Array.isArray(log.procedures) ? log.procedures.join('; ') : (log.procedures || 'N/A'),
        log.supervisorName || log.supervisor || 'N/A',
        log.status || 'N/A',
        log.timestamp ? new Date(log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleString() : 'N/A'
      ]);

      const csvContent = [headers.join(','), ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    // Define proper headers and data mapping for shifts
    else if (filename === 'shifts') {
      const headers = [
        'Nurse Name',
        'Nurse Email',
        'Date',
        'Department',
        'Shift Type',
        'Start Time',
        'End Time',
        'Duration (hours)',
        'Notes',
        'Status'
      ];

      const csvRows = data.map(shift => {
        const startTime = new Date(shift.startTime);
        const endTime = new Date(shift.endTime);
        const duration = Math.round((endTime - startTime) / (1000 * 60 * 60)); // hours

        return [
          shift.nurseName || 'N/A',
          shift.nurseEmail || 'N/A',
          startTime.toLocaleDateString(),
          shift.department || 'N/A',
          shift.type || 'N/A',
          startTime.toLocaleTimeString(),
          endTime.toLocaleTimeString(),
          duration,
          shift.notes || 'N/A',
          shift.status || 'N/A'
        ];
      });

      const csvContent = [headers.join(','), ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Loading Hospital Dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Hospital Admin Dashboard</h1>
              <p className="text-sm text-gray-600">{currentUser?.hospitalName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {currentUser?.name}!</h2>
          <p className="text-gray-600">Manage and monitor your hospital's nursing activities and schedules.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Clinical Logs Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Clinical Logs</p>
                  <p className="text-3xl font-bold text-gray-900">{clinicalLogs.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shifts Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Shifts</p>
                  <p className="text-3xl font-bold text-gray-900">{shifts.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Nurses Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Nurses</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Set([...clinicalLogs.map(log => log.nurseId), ...shifts.map(shift => shift.nurseId)]).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('logs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Clinical Logs ({clinicalLogs.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('shifts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'shifts'
                    ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Shifts ({shifts.length})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Export Button */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {activeTab === 'logs' ? 'Clinical Logs' : 'Shift Schedule'}
              </h3>
              <button
                onClick={() => exportToCSV(
                  activeTab === 'logs' ? clinicalLogs : shifts,
                  activeTab === 'logs' ? 'clinical_logs' : 'shifts'
                )}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export to CSV</span>
              </button>
            </div>

            {/* Clinical Logs Tab */}
            {activeTab === 'logs' && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nurse</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Department</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Procedures</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supervisor</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clinicalLogs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="mt-2 text-sm font-medium">No clinical logs found</p>
                              <p className="text-xs">Clinical logs will appear here once nurses start logging their activities.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        clinicalLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-sm">
                                    {log.nurseName?.charAt(0) || 'N'}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{log.nurseName}</div>
                                  <div className="text-sm text-gray-500">{log.nurseEmail}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {log.date ? new Date(log.date).toLocaleDateString() : 'No date'}
                              </div>
                              <div className="text-sm text-gray-500">{log.department || 'No department'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs">
                                <div className="truncate">
                                  {Array.isArray(log.procedures) 
                                    ? log.procedures.join(', ') 
                                    : log.procedures || 'No procedures recorded'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {log.supervisorName || log.supervisor || 'Not specified'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Shifts Tab */}
            {activeTab === 'shifts' && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nurse</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Time</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End Time</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {shifts.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="mt-2 text-sm font-medium">No shifts found</p>
                              <p className="text-xs">Shift schedules will appear here once nurses start planning their shifts.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        shifts.map((shift) => {
                          const startTime = new Date(shift.startTime);
                          const endTime = new Date(shift.endTime);
                          const duration = Math.round((endTime - startTime) / (1000 * 60 * 60)); // hours
                          
                          return (
                            <tr key={shift.id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-medium text-sm">
                                      {shift.nurseName?.charAt(0) || 'N'}
                                    </span>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{shift.nurseName}</div>
                                    <div className="text-sm text-gray-500">{shift.nurseEmail}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{startTime.toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {startTime.toLocaleTimeString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {endTime.toLocaleTimeString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{duration} hours</div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Chatbot */}
      <Chatbot userRole="hospital-admin" />
    </div>
  );
};

export default HospitalAdminDashboard; 