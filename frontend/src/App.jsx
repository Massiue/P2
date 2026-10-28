import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';

import ReportFault from './pages/citizen/ReportFault';
import MyComplaints from './pages/citizen/MyComplaints';
import Feedback from './pages/citizen/Feedback';

import Dashboard from './pages/admin/Dashboard';
import Reports from './pages/admin/Reports';
import AllComplaints from './pages/admin/AllComplaints';
import ManageUsers from './pages/admin/ManageUsers';
import Profile from './pages/admin/Profile';
import FeedbackInbox from './pages/admin/FeedbackInbox';
import StaffActivity from './pages/admin/StaffActivity';
import StreetLights from './pages/admin/StreetLights';
import StaffCredits from './pages/admin/StaffCredits';

import AssignedTasks from './pages/staff/AssignedTasks';
import CreditPoints from './pages/staff/CreditPoints';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full mb-2"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect according to actual user role if trying to access unauthorized route
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'staff') return <Navigate to="/staff/assigned" replace />;
    return <Navigate to="/my-complaints" replace />;
  }

  return children;
};

// Main App Layout
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {children}
        </main>
      </div>
    </div>
  );
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'staff') return <Navigate to="/staff/assigned" replace />;
  return <Navigate to="/my-complaints" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<HomeRedirect />} />

      {/* Citizen Protected Routes */}
      <Route
        path="/report-fault"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'admin']}>
            <AppLayout>
              <ReportFault />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-complaints"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'admin']}>
            <AppLayout>
              <MyComplaints />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <AppLayout>
              <Feedback />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'staff', 'admin']}>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <Reports />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff-activity"
        element={
          <ProtectedRoute allowedRoles={[ 'admin' ]}>
            <AppLayout>
              <StaffActivity />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff-credits"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <StaffCredits />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <AllComplaints />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <ManageUsers />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/lights"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <StreetLights />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <FeedbackInbox />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Maintenance Staff Protected Routes */}
      <Route
        path="/staff/assigned"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <AppLayout>
              <AssignedTasks />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/credits"
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <AppLayout>
              <CreditPoints />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default App;
