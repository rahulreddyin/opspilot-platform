import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUserRoles, isAdmin, logout } from "../utils/auth";

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const adminUser = isAdmin();
  const roles = getCurrentUserRoles();
const workspaceUser =
  roles.includes("TEAM_LEAD") ||
  roles.includes("INCIDENT_MANAGER") ||
  roles.includes("ADMIN");

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={shellStyle}>
      <aside style={sidebarStyle}>
        <div>
          <h2 style={logoStyle}>OpsPilot</h2>

          <nav style={navStyle}>
            <Link
              to="/dashboard"
              style={isActive("/dashboard") ? activeLinkStyle : linkStyle}
            >
              Dashboard
            </Link>

            <Link
              to="/incidents"
              style={isActive("/incidents") ? activeLinkStyle : linkStyle}
            >
              Incidents
            </Link>

            {workspaceUser && (
  <Link
    to="/team/workspace"
    style={isActive("/team/workspace") ? activeLinkStyle : linkStyle}
  >
    Team Workspace
  </Link>
)}

            {adminUser && (
              <Link
                to="/admin/teams"
                style={isActive("/admin/teams") ? activeLinkStyle : linkStyle}
              >
                Manage Teams
              </Link>
            )}
          </nav>
        </div>

        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
      </aside>

      <main style={mainStyle}>{children}</main>
    </div>
  );
}

const shellStyle = {
  height: "100vh",
  overflow: "hidden",
  backgroundColor: "#f3f4f6",
};

const sidebarStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "240px",
  height: "100vh",
  backgroundColor: "#111827",
  color: "#ffffff",
  padding: "28px 18px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  zIndex: 100,
};

const mainStyle = {
  marginLeft: "240px",
  height: "100vh",
  overflowY: "auto",
  padding: "32px",
  boxSizing: "border-box",
};

const logoStyle = {
  margin: "0 0 32px 0",
  fontSize: "24px",
  fontWeight: "800",
};

const navStyle = {
  display: "grid",
  gap: "10px",
};

const linkStyle = {
  color: "#d1d5db",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: "10px",
  fontWeight: "700",
  display: "block",
};

const activeLinkStyle = {
  ...linkStyle,
  backgroundColor: "#374151",
  color: "#ffffff",
};

const logoutButtonStyle = {
  width: "100%",
  backgroundColor: "#dc2626",
  color: "#ffffff",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "800",
  cursor: "pointer",
};

export default Layout;
