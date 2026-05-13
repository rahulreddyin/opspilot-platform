import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import IncidentsPage from "./pages/IncidentsPage";
import AdminTeamsPage from "./pages/AdminTeamsPage";
import AdminTeamDetailsPage from "./pages/AdminTeamDetailsPage";
import UserPerformancePage from "./pages/UserPerformancePage";
import PublicRoute from "./components/PublicRoute";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout";
import TeamWorkspacePage from "./pages/TeamWorkspacePage";

function ProtectedShell({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function AdminShell({ children }) {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <Layout>{children}</Layout>
      </AdminRoute>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
<Route
  path="/login"
  element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  }
/>

<Route
  path="/register"
  element={
    <PublicRoute>
      <RegisterPage />
    </PublicRoute>
  }
/>

      <Route
        path="/dashboard"
        element={
          <ProtectedShell>
            <DashboardPage />
          </ProtectedShell>
        }
      />

      <Route
        path="/incidents"
        element={
          <ProtectedShell>
            <IncidentsPage />
          </ProtectedShell>
        }
      />

      {/* 🔐 ADMIN ONLY */}
      <Route
        path="/admin/teams"
        element={
          <AdminShell>
            <AdminTeamsPage />
          </AdminShell>
        }
      />

      <Route
  path="/team/workspace"
  element={
    <ProtectedShell>
      <TeamWorkspacePage />
    </ProtectedShell>
  }
/>

      <Route
        path="/admin/teams/:teamId"
        element={
          <AdminShell>
            <AdminTeamDetailsPage />
          </AdminShell>
        }
      />

      <Route
        path="/admin/users/:userId/performance"
        element={
          <AdminShell>
            <UserPerformancePage />
          </AdminShell>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;