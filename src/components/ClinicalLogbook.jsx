import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Chatbot from './Chatbot';

const ClinicalLogbook = ({ user }) => {
  const [activeTab, setActiveTab] = useState('entry');
  const [log, setLog] = useState({
    date: '',
    department: '',
    caseTitle: '',
    patientSummary: '',
    procedures: [],
    supervisorName: '',
    uploads: []
  });
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    department: ''
  });

  // Sample data for dropdowns
  const departments = [
    'Emergency Department',
    'Intensive Care Unit',
    'Medical Ward',
    'Surgical Ward',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Orthopedics',
    'Cardiology',
    'Psychiatry',
    'Oncology'
  ];

  const availableProcedures = [
    'Blood Pressure Monitoring',
    'Temperature Check',
    'IV Administration',
    'Wound Dressing',
    'Medication Administration',
    'Patient Assessment',
    'Catheter Care',
    'Injection Administration',
    'Blood Draw',
    'ECG Recording',
    'Oxygen Therapy',
    'Patient Education'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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

      const newLog = {
        ...log,
        userId: user?.uid || 'demo-user',
        nurseId: user?.uid || 'demo-user', // Add nurseId for consistency
        hospitalId: hospitalId, // Add hospitalId
        timestamp: new Date(),
        status: 'Submitted'
      };
      
      // Save to Firebase
      const docRef = await addDoc(collection(db, 'clinicalLogs'), newLog);
      
      // Update local state with the new log including the Firebase document ID
      const savedLog = { ...newLog, id: docRef.id };
      setLogs(prev => [savedLog, ...prev]);
      
      // Reset form
      setLog({
        date: '',
        department: '',
        caseTitle: '',
        patientSummary: '',
        procedures: [],
        supervisorName: '',
        uploads: []
      });
      
      console.log('Log entry submitted successfully!');
      setActiveTab('logs');
    } catch (error) {
      console.error('Error adding log:', error);
              console.error('Failed to add log. Please try again.');
    }
  };

  const handleProcedureToggle = (procedure) => {
    setLog(prev => ({
      ...prev,
      procedures: prev.procedures.includes(procedure)
        ? prev.procedures.filter(p => p !== procedure)
        : [...prev.procedures, procedure]
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setLog(prev => ({
      ...prev,
      uploads: [...prev.uploads, ...files.map(file => ({ name: file.name, type: file.type }))]
    }));
  };

  const deleteLog = async (logId) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      try {
        // Delete from Firebase
        await deleteDoc(doc(db, 'clinicalLogs', logId));
        
        // Update local state
        setLogs(prev => prev.filter(log => log.id !== logId));
        console.log('Log deleted successfully!');
      } catch (error) {
        console.error('Error deleting log:', error);
        console.error('Failed to delete log. Please try again.');
      }
    }
  };

  const fetchLogs = async () => {
    try {
      const q = query(collection(db, 'clinicalLogs'), where('userId', '==', user?.uid || 'demo-user'));
      const querySnapshot = await getDocs(q);
      const logsData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.date || log.timestamp);
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
    
    const dateMatch = (!fromDate || logDate >= fromDate) && (!toDate || logDate <= toDate);
    const deptMatch = !filters.department || log.department === filters.department;
    
    return dateMatch && deptMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Clinical Logbook</h1>
          <p className="text-gray-600 mt-1">Track your clinical experiences and learning progress</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('entry')}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'entry'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            New Log Entry
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'logs'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Logs ({logs.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {activeTab === 'entry' ? (
          /* Log Entry Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Clinical Log Entry</h2>
                <p className="text-gray-600">Record your clinical experience details</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Date and Department Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={log.date}
                    onChange={(e) => setLog({ ...log, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department/Ward *
                  </label>
                  <select
                    value={log.department}
                    onChange={(e) => setLog({ ...log, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Case Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Title *
                </label>
                <input
                  type="text"
                  value={log.caseTitle}
                  onChange={(e) => setLog({ ...log, caseTitle: e.target.value })}
                  placeholder="e.g., Post-operative care for appendectomy patient"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Patient Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Summary *
                </label>
                <textarea
                  value={log.patientSummary}
                  onChange={(e) => setLog({ ...log, patientSummary: e.target.value })}
                  placeholder="Describe the patient's condition, symptoms, and relevant medical history..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Procedures Done */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Procedures Done *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableProcedures.map(procedure => (
                    <label key={procedure} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={log.procedures.includes(procedure)}
                        onChange={() => handleProcedureToggle(procedure)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{procedure}</span>
                    </label>
                  ))}
                </div>
                {log.procedures.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">Please select at least one procedure</p>
                )}
              </div>

              {/* Supervisor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor Name *
                </label>
                <input
                  type="text"
                  value={log.supervisorName}
                  onChange={(e) => setLog({ ...log, supervisorName: e.target.value })}
                  placeholder="e.g., Dr. Sarah Johnson, RN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* File Uploads */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uploads (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 mb-2">Click to upload files</p>
                    <p className="text-sm text-gray-500">PDF, Images, Documents (Max 10MB each)</p>
                  </label>
                </div>
                {log.uploads.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</p>
                    <div className="space-y-1">
                      {log.uploads.map((file, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={log.procedures.length === 0}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  Submit Log Entry
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* My Logs Table */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Filters */}
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My Clinical Logs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                  <p className="text-gray-500 mb-4">Start by creating your first clinical log entry</p>
                  <button
                    onClick={() => setActiveTab('entry')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create New Log
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((logEntry) => (
                      <tr key={logEntry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(logEntry.date || logEntry.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {logEntry.department}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate">{logEntry.caseTitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            logEntry.status === 'Approved' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {logEntry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => console.log('View functionality would be implemented')}
                            >
                              View
                            </button>
                            <button 
                              className="text-gray-600 hover:text-gray-800 font-medium"
                              onClick={() => console.log('Edit functionality would be implemented')}
                            >
                              Edit
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800 font-medium"
                              onClick={() => deleteLog(logEntry.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Chatbot */}
      <Chatbot userRole="nurse" />
    </div>
  );
};

export default ClinicalLogbook;