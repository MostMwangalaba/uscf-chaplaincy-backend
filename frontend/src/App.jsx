import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import MemberPublic from './pages/MemberPublic';
import MemberDashboard from './pages/MemberDashboard';
import QRCode from './pages/QRCode';
import MemberContributions from './pages/MemberContributions';
import Statement from './pages/Statement';
import Announcements from './pages/Announcements';
import Progress from './pages/Progress';
import FacultyAdminOverview from './pages/FacultyAdminOverview';
import FacultyAdminBuilding from './pages/FacultyAdminBuilding';
import FacultyAdminExport from './pages/FacultyAdminExport';
import FacultyAdminMembers from './pages/FacultyAdminMembers';
import FacultyAdminMessages from './pages/FacultyAdminMessages';
import FacultyAdminBroadcast from './pages/FacultyAdminBroadcast';
import FacultyAdminAdvices from './pages/FacultyAdminAdvices';
import FacultyAdminReports from './pages/FacultyAdminReports';
import SuperAdminOverview from './pages/SuperAdminOverview';
import SuperAdminMembers from './pages/SuperAdminMembers';
import SuperAdminUsers from './pages/SuperAdminUsers';
import SuperAdminTargets from './pages/SuperAdminTargets';
import SuperAdminBackups from './pages/SuperAdminBackups';
import SuperAdminAudit from './pages/SuperAdminAudit';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/" />;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (user.role === 'super_admin') return <Navigate to="/super-admin/overview" />;
  if (user.role === 'faculty_admin' || user.role === 'leader') return <Navigate to="/faculty-admin/overview" />;
  return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/member/:id" element={<MemberPublic />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
          <Route path="/qr" element={<ProtectedRoute><QRCode /></ProtectedRoute>} />
          <Route path="/contributions" element={<ProtectedRoute><MemberContributions /></ProtectedRoute>} />
          <Route path="/statement" element={<ProtectedRoute><Statement /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          
          <Route path="/faculty-admin/overview" element={<ProtectedRoute><FacultyAdminOverview /></ProtectedRoute>} />
          <Route path="/faculty-admin/building" element={<ProtectedRoute><FacultyAdminBuilding /></ProtectedRoute>} />
          <Route path="/faculty-admin/export" element={<ProtectedRoute><FacultyAdminExport /></ProtectedRoute>} />
          <Route path="/faculty-admin/members" element={<ProtectedRoute><FacultyAdminMembers /></ProtectedRoute>} />
          <Route path="/faculty-admin/messages" element={<ProtectedRoute><FacultyAdminMessages /></ProtectedRoute>} />
          <Route path="/faculty-admin/broadcast" element={<ProtectedRoute><FacultyAdminBroadcast /></ProtectedRoute>} />
          <Route path="/faculty-admin/advices" element={<ProtectedRoute><FacultyAdminAdvices /></ProtectedRoute>} />
          <Route path="/faculty-admin/reports" element={<ProtectedRoute><FacultyAdminReports /></ProtectedRoute>} />
          
          <Route path="/super-admin/overview" element={<ProtectedRoute><SuperAdminOverview /></ProtectedRoute>} />
          <Route path="/super-admin/members" element={<ProtectedRoute><SuperAdminMembers /></ProtectedRoute>} />
          <Route path="/super-admin/users" element={<ProtectedRoute><SuperAdminUsers /></ProtectedRoute>} />
          <Route path="/super-admin/targets" element={<ProtectedRoute><SuperAdminTargets /></ProtectedRoute>} />
          <Route path="/super-admin/backups" element={<ProtectedRoute><SuperAdminBackups /></ProtectedRoute>} />
          <Route path="/super-admin/audit" element={<ProtectedRoute><SuperAdminAudit /></ProtectedRoute>} />
          <Route path="/super-admin/messages" element={<ProtectedRoute><FacultyAdminMessages /></ProtectedRoute>} />
          
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
