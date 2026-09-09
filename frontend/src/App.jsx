import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import MyProjects from "./pages/MyProjects";
import ProjectDetails from "./pages/ProjectDetails";
import MyProposals from "./pages/MyProposals";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import Toaster from "./components/Toaster";
import EditJob from "./pages/EditJob";
import PostJob from "./pages/PostJob";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = (user?.role || user?.user_type || "").toLowerCase();

  if (!user) return <Navigate to="/login" replace />;

  if (userRole !== "admin") {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9ff' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '60px' }}>⛔</div>
          <h2 style={{ fontWeight: '800' }}>Access Denied</h2>
          <p className="text-muted">Admin only! This section is restricted.</p>
          <p className="small">Your role: <span className="badge bg-primary">{user.role || 'unknown'}</span></p>
          <button className="btn btn-dark rounded-pill px-4 mt-3" onClick={() => window.location.href='/dashboard'}>
            ← Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  return children;
};

function App() {
  return (
    <>
      <Toaster />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/my-jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
      <Route path="/post-job" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
      <Route path="/edit-job/:id" element={<ProtectedRoute><EditJob /></ProtectedRoute>} />
      <Route path="/my-projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
      <Route path="/my-proposals" element={<ProtectedRoute><MyProposals /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Suspense fallback={
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f5fc' }}>
                  <div className="app-lazy-loader">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              }>
                <AdminDashboard />
              </Suspense>
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  );
}

export default App;
