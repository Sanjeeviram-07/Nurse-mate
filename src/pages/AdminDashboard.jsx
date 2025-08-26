import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, getDocs, query, where, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { 
  Users, 
  FileText, 
  Award, 
  Calendar, 
  BarChart3, 
  Download, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Chatbot from '../components/Chatbot';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
          setUser(currentUser);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch real-time data when admin is authenticated
  useEffect(() => {
    if (!isAdmin) return;

    // Fetch students
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
    });

    // Fetch logs
    const logsQuery = query(collection(db, 'clinicalLogs'), orderBy('timestamp', 'desc'));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
    });

    // Fetch quizzes
    const quizzesQuery = query(collection(db, 'quizResults'), orderBy('timestamp', 'desc'));
    const unsubscribeQuizzes = onSnapshot(quizzesQuery, (snapshot) => {
      const quizzesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuizzes(quizzesData);
    });

    // Fetch shifts
    const shiftsQuery = query(collection(db, 'shifts'), orderBy('date', 'asc'));
    const unsubscribeShifts = onSnapshot(shiftsQuery, (snapshot) => {
      const shiftsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShifts(shiftsData);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeLogs();
      unsubscribeQuizzes();
      unsubscribeShifts();
    };
  }, [isAdmin]);

  const handleLogApproval = async (logId, status) => {
    try {
      await updateDoc(doc(db, 'clinicalLogs', logId), {
        status: status,
        reviewedBy: user.uid,
        reviewedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating log status:', error);
    }
  };

  const exportToCSV = () => {
    // Implementation for CSV export
    console.log('Exporting to CSV...');
  };

  const exportToPDF = () => {
    // Implementation for PDF export
    console.log('Exporting to PDF...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const pendingLogs = logs.filter(log => log.status === 'pending');
  const completedQuizzes = quizzes.filter(quiz => quiz.completed);
  const todayShifts = shifts.filter(shift => {
    const today = new Date().toDateString();
    return new Date(shift.date).toDateString() === today;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Logs</p>
                <p className="text-2xl font-bold text-gray-900">{pendingLogs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{completedQuizzes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Shifts</p>
                <p className="text-2xl font-bold text-gray-900">{todayShifts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Progress Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Student Progress Overview</h3>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select 
                  value={selectedFilter} 
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                >
                  <option value="all">All Students</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {students.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {student.displayName?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{student.displayName || 'Student'}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">85%</span>
                    </div>
                    <p className="text-xs text-gray-500">Progress</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log Review */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Log Review</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pendingLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{log.studentName || 'Student'}</p>
                      <p className="text-sm text-gray-600 mt-1">{log.description?.substring(0, 100)}...</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(log.timestamp?.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleLogApproval(log.id, 'approved')}
                        className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleLogApproval(log.id, 'rejected')}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </button>
                      <button className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No pending logs to review</p>
                </div>
              )}
            </div>
          </div>

          {/* Quiz/Certification Monitoring */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Quiz & Certification Status</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {quizzes.slice(0, 5).map((quiz) => (
                <div key={quiz.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{quiz.studentName || 'Student'}</p>
                      <p className="text-sm text-gray-600">Quiz: {quiz.quizName || 'Nursing Quiz'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Completed: {new Date(quiz.timestamp?.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-gray-800">{quiz.score || 0}%</span>
                      </div>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shift Monitoring */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Today's Shift Schedule</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {todayShifts.slice(0, 5).map((shift) => (
                <div key={shift.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{shift.studentName || 'Student'}</p>
                      <p className="text-sm text-gray-600">{shift.department || 'General'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {shift.startTime} - {shift.endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className={`text-sm font-medium ${
                          shift.status === 'completed' ? 'text-green-600' : 
                          shift.status === 'in-progress' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {shift.status || 'Scheduled'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Status</p>
                    </div>
                  </div>
                </div>
              ))}
              {todayShifts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No shifts scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Reports & Analytics</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-blue-600">78%</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600">92%</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingLogs.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2025 NurseMate Admin Dashboard. All rights reserved.</p>
          <p className="mt-1">For technical support, contact your system administrator</p>
        </footer>
      </div>
      
      {/* Chatbot */}
      <Chatbot userRole="nurse" />
    </div>
  );
};

export default AdminDashboard; 