import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  assignUserToTeam,
  getAllUsers,
  getTeamDetails,
  removeUserFromTeam,
} from "../api/adminApi";
import { getApiErrorMessage } from "../utils/apiError";

function AdminTeamDetailsPage() {
  const { teamId } = useParams();

  const [teamDetails, setTeamDetails] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 NEW granular states
  const [adding, setAdding] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [teamData, usersData] = await Promise.all([
        getTeamDetails(teamId),
        getAllUsers(),
      ]);

      setTeamDetails(teamData);
      setAllUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("LOAD TEAM DETAILS ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to load team details."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teamId]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 2500);
  };

  const members = teamDetails?.members || teamDetails?.users || [];

  const availableUsers = useMemo(() => {
    const memberIds = new Set(members.map((member) => Number(member.id)));
    return allUsers.filter((user) => !memberIds.has(Number(user.id)));
  }, [allUsers, members]);

  // ✅ ADD MEMBER
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setAdding(true);
      setError("");

      await assignUserToTeam({
        userId: Number(selectedUserId),
        teamId: Number(teamId),
      });

      setSelectedUserId("");
      showSuccess("Member added to team.");
      await loadData();
    } catch (err) {
      console.error("ADD MEMBER ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to add member."));
    } finally {
      setAdding(false);
    }
  };

  // ✅ REMOVE MEMBER (row-specific)
  const handleRemoveMember = async (userId) => {
    try {
      setRemovingUserId(userId);
      setError("");

      await removeUserFromTeam(userId);

      showSuccess("Member removed from team.");
      await loadData();
    } catch (err) {
      console.error("REMOVE MEMBER ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to remove member."));
    } finally {
      setRemovingUserId(null);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>Loading team workspace...</div>
      </div>
    );
  }

  if (error && !teamDetails) {
    return (
      <div style={pageStyle}>
        <Toast message={error} type="error" />
      </div>
    );
  }

  if (!teamDetails) return null;

  const openTasks = teamDetails.openTasks || 0;
  const inProgressTasks = teamDetails.inProgressTasks || 0;
  const doneTasks = teamDetails.doneTasks || 0;
  const totalTasks = openTasks + inProgressTasks + doneTasks;
  const openIncidents = teamDetails.openIncidents || 0;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>{teamDetails.teamName}</h1>
          <p style={subtitleStyle}>
            Team workspace for members, assignments, and performance.
          </p>
        </div>
      </div>

      {successMessage && <Toast message={successMessage} type="success" />}
      {error && <Toast message={error} type="error" />}

      <div style={statsGridStyle}>
        <StatCard label="Members" value={members.length} />
        <StatCard label="Total Tasks" value={totalTasks} />
        <StatCard label="Open" value={openTasks} />
        <StatCard label="In Progress" value={inProgressTasks} />
        <StatCard label="Done" value={doneTasks} />
        <StatCard label="Open Incidents" value={openIncidents} />
      </div>

      <div style={mainGridStyle}>
        {/* ADD MEMBER */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Add Member</h2>
          <p style={sectionSubtitleStyle}>
            Add an existing user to this team.
          </p>

          <form onSubmit={handleAddMember}>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={inputStyle}
              required
              disabled={adding}
            >
              <option value="">Select user</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || "Unnamed User"} ({user.email})
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={adding || !selectedUserId}
              style={{
                ...primaryButtonStyle,
                opacity: adding || !selectedUserId ? 0.65 : 1,
                cursor: adding || !selectedUserId ? "not-allowed" : "pointer",
              }}
            >
              {adding ? "Adding..." : "Add Member"}
            </button>
          </form>
        </div>

        {/* MEMBERS LIST */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Members</h2>
          <p style={sectionSubtitleStyle}>
            Current members assigned to this team.
          </p>

          {members.length === 0 ? (
            <p style={mutedTextStyle}>No members yet.</p>
          ) : (
            <div style={memberListStyle}>
              {members.map((member) => (
                <div key={member.id} style={memberRowStyle}>
                  <Link
                    to={`/admin/users/${member.id}/performance`}
                    style={memberLinkStyle}
                  >
                    <div style={avatarStyle}>
                      {member.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div>
                      <div style={memberNameStyle}>
                        {member.name || "Unnamed User"}
                      </div>
                      <div style={memberEmailStyle}>{member.email}</div>

                      <div style={badgeRowStyle}>
                        {member.roles?.map((role) => (
                          <span key={role} style={badgeStyle}>
                            {role}
                          </span>
                        ))}
                      </div>

                      <div style={viewPerformanceStyle}>
                        View performance →
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    style={dangerButtonStyle}
                    disabled={removingUserId === member.id}
                  >
                    {removingUserId === member.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- rest unchanged --- */

function StatCard({ label, value }) {
  return (
    <div style={statCardStyle}>
      <p style={statLabelStyle}>{label}</p>
      <h3 style={statValueStyle}>{value}</h3>
    </div>
  );
}

function Toast({ message, type }) {
  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "14px 16px",
        borderRadius: "10px",
        fontWeight: "700",
        backgroundColor: type === "success" ? "#dcfce7" : "#fee2e2",
        color: type === "success" ? "#166534" : "#991b1b",
        border: type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
      }}
    >
      {message}
    </div>
  );
}

const pageStyle = {
  maxWidth: "1280px",
  margin: "0 auto",
};

const headerStyle = {
  marginBottom: "24px",
};

const titleStyle = {
  margin: 0,
  fontSize: "34px",
  fontWeight: "800",
  color: "#111827",
};

const subtitleStyle = {
  marginTop: "8px",
  color: "#4b5563",
  fontSize: "15px",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "16px",
  marginBottom: "24px",
};

const statCardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "14px",
  padding: "20px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
};

const statLabelStyle = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "700",
};

const statValueStyle = {
  marginTop: "10px",
  marginBottom: 0,
  fontSize: "28px",
  color: "#111827",
  fontWeight: "800",
};

const mainGridStyle = {
  display: "grid",
  gridTemplateColumns: "360px minmax(0, 1fr)",
  gap: "24px",
  alignItems: "start",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "14px",
  padding: "24px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
};

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom: "6px",
  color: "#111827",
  fontSize: "22px",
  fontWeight: "800",
};

const sectionSubtitleStyle = {
  marginTop: 0,
  marginBottom: "16px",
  color: "#6b7280",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "13px 14px",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: "800",
};

const mutedTextStyle = {
  color: "#6b7280",
  margin: 0,
};

const memberListStyle = {
  display: "grid",
  gap: "14px",
  maxHeight: "560px",
  overflowY: "auto",
  paddingRight: "8px",
};

const memberRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
};

const memberLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  textDecoration: "none",
  color: "inherit",
  flex: 1,
};

const avatarStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "999px",
  backgroundColor: "#dbeafe",
  color: "#1d4ed8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
  flexShrink: 0,
};

const memberNameStyle = {
  color: "#111827",
  fontWeight: "800",
  marginBottom: "4px",
};

const memberEmailStyle = {
  color: "#4b5563",
  fontSize: "14px",
  marginBottom: "8px",
};

const badgeRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginBottom: "6px",
};

const badgeStyle = {
  display: "inline-block",
  padding: "5px 9px",
  fontSize: "11px",
  fontWeight: "800",
  borderRadius: "999px",
  backgroundColor: "#e0e7ff",
  color: "#3730a3",
};

const viewPerformanceStyle = {
  color: "#2563eb",
  fontWeight: "800",
  fontSize: "13px",
};

const dangerButtonStyle = {
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  padding: "10px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "800",
};

export default AdminTeamDetailsPage;