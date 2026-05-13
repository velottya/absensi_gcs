import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/AuthContext.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Dashboard from './components/Dashboard.jsx'
import Attendance from './components/Attendance.jsx'
import History from './components/History.jsx'
import Employees from './components/Employees.jsx'
import EmployeeDetail from './components/EmployeeDetail.jsx'
import Settings from './components/Settings.jsx'
import Leave from './components/Leave.jsx'
import LeaveHistory from './components/LeaveHistory.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  return user ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  return user ? <Navigate to="/dashboard" /> : children;
}

import TopNavbar from './components/TopNavbar.jsx';
import Profile from './components/Profile.jsx';
import LocationGate from './components/LocationGate.jsx';

function AppContent() {
  return (
    <div className="min-h-screen bg-[#f2fbf6]">
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen">
                <TopNavbar />
                <main className="pb-28">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/employees/:employeeId" element={<EmployeeDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/setting" element={<Settings />} />
                    <Route path="/leave" element={<Leave />} />
                    <Route path="/leave/history" element={<LeaveHistory />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}


function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationGate>
          <AppContent />
        </LocationGate>
      </AuthProvider>
    </Router>
  );
}

export default App;
