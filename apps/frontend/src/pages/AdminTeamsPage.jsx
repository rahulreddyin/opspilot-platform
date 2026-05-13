import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  bulkAddRoleToUsers,
  bulkAssignUsersToTeam,
  createTeam,
  deleteTeam,
  deleteUser,
  getAllTeams,
  getAllUsers,
  removeRoleFromUser,
} from "../api/adminApi";
import { getApiErrorMessage } from "../utils/apiError";

function AdminTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [teamName, setTeamName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedRoleUserIds, setSelectedRoleUserIds] = useState([]);
  const [selectedRole, setSelectedRole] = useState("TEAM_LEAD");

  const [assignSearch, setAssignSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");

  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assigningRole, setAssigningRole] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRemoveRole = async (userId, role) => {
  const confirmed = window.confirm(`Remove ${role} role from this user?`);
  if (!confirmed) return;

  try {
    setError("");

    await removeRoleFromUser({
      userId: Number(userId),
      role,
    });

    showSuccess(`${role} role removed successfully.`);
    await loadData();
  } catch (err) {
    console.error("REMOVE ROLE ERROR:", err);
    setError(getApiErrorMessage(err, "Failed to remove role."));
  }
};

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 2500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [teamsData, usersData] = await Promise.all([
        getAllTeams(),
        getAllUsers(),
      ]);

      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("ADMIN TEAMS LOAD ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to load teams and users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAssignUsers = useMemo(() => {
    const term = assignSearch.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const text = `${user.name || ""} ${user.email || ""} ${
        user.teamName || ""
      } ${(user.roles || []).join(" ")}`.toLowerCase();

      return text.includes(term);
    });
  }, [users, assignSearch]);

  const filteredRoleUsers = useMemo(() => {
    const term = roleSearch.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const text = `${user.name || ""} ${user.email || ""} ${
        user.teamName || ""
      } ${(user.roles || []).join(" ")}`.toLowerCase();

      return text.includes(term);
    });
  }, [users, roleSearch]);

  const toggleUserSelection = (userId, setter) => {
    const id = Number(userId);

    setter((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) return;

    try {
      setCreating(true);
      setError("");

      await createTeam({
        name: teamName.trim(),
      });

      setTeamName("");
      showSuccess("Team created successfully.");
      await loadData();
    } catch (err) {
      console.error("CREATE TEAM ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to create team."));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId, name) => {
    const confirmed = window.confirm(
      `Delete team "${name}"? Users will remain in the system, but will no longer belong to this team.`
    );

    if (!confirmed) return;

    try {
      setDeletingTeamId(teamId);
      setError("");

      await deleteTeam(teamId);

      showSuccess("Team deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("DELETE TEAM ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to delete team."));
    } finally {
      setDeletingTeamId(null);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    const confirmed = window.confirm(
      `Permanently delete user "${email}"? This removes the user from the platform.`
    );

    if (!confirmed) return;

    try {
      setDeletingUserId(userId);
      setError("");

      await deleteUser(userId);

      showSuccess("User deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("DELETE USER ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to delete user."));
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleBulkAssignUsers = async (e) => {
    e.preventDefault();

    if (selectedUserIds.length === 0 || !selectedTeamId) {
      setError("Select at least one user and target team.");
      return;
    }

    try {
      setAssigning(true);
      setError("");

      await bulkAssignUsersToTeam({
        userIds: selectedUserIds.map(Number),
        teamId: Number(selectedTeamId),
      });

      setSelectedUserIds([]);
      setSelectedTeamId("");
      setAssignSearch("");

      showSuccess("Selected users assigned successfully.");
      await loadData();
    } catch (err) {
      console.error("BULK ASSIGN ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to assign users to team."));
    } finally {
      setAssigning(false);
    }
  };

  const handleBulkRoleAssign = async (e) => {
    e.preventDefault();

    if (selectedRoleUserIds.length === 0 || !selectedRole) {
      setError("Select at least one user and role.");
      return;
    }

    try {
      setAssigningRole(true);
      setError("");

      await bulkAddRoleToUsers({
        userIds: selectedRoleUserIds.map(Number),
        role: selectedRole,
      });

      setSelectedRoleUserIds([]);
      setSelectedRole("TEAM_LEAD");
      setRoleSearch("");

      showSuccess("Role assigned successfully.");
      await loadData();
    } catch (err) {
      console.error("BULK ROLE ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to assign role."));
    } finally {
      setAssigningRole(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Admin Team Management</h1>
          <p style={subtitleStyle}>
            Create teams, assign members, manage roles, and monitor team access.
          </p>
        </div>
      </div>

      {error && <Toast message={error} type="error" />}
      {success && <Toast message={success} type="success" />}

      {loading ? (
        <div style={cardStyle}>
          <p style={mutedTextStyle}>Loading teams and users...</p>
        </div>
      ) : (
        <>
          <div style={topGridStyle}>
            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Create Team</h2>
              <p style={sectionSubtitleStyle}>
                Add a new team for incident ownership and task assignment.
              </p>

              <form onSubmit={handleCreateTeam}>
                <input
                  type="text"
                  placeholder="Team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  style={inputStyle}
                  disabled={creating}
                />

                <button type="submit" style={primaryButtonStyle} disabled={creating}>
                  {creating ? "Creating..." : "Create Team"}
                </button>
              </form>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Overview</h2>
              <p style={sectionSubtitleStyle}>Current platform access summary.</p>

              <div style={miniStatsGridStyle}>
                <MiniStat label="Teams" value={teams.length} />
                <MiniStat label="Users" value={users.length} />
              </div>
            </div>
          </div>

          <div style={bulkGridStyle}>
            <div style={cardStyle}>
              <div style={cardHeaderRowStyle}>
                <div>
                  <h2 style={sectionTitleStyle}>Bulk Assign Users</h2>
                  <p style={sectionSubtitleStyle}>
                    Select users and assign them to a target team.
                  </p>
                </div>

                <span style={countPillStyle}>
                  Selected: {selectedUserIds.length}
                </span>
              </div>

              <form onSubmit={handleBulkAssignUsers}>
                <input
                  type="text"
                  placeholder="Search users by name, email, team, or role..."
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  style={inputStyle}
                  disabled={assigning}
                />

                <div style={smallScrollableListStyle}>
                  {filteredAssignUsers.length === 0 ? (
                    <p style={mutedTextStyle}>No users found.</p>
                  ) : (
                    filteredAssignUsers.map((user) => (
                      <SelectableUser
                        key={user.id}
                        user={user}
                        checked={selectedUserIds.includes(Number(user.id))}
                        disabled={assigning}
                        onChange={() =>
                          toggleUserSelection(user.id, setSelectedUserIds)
                        }
                      />
                    ))
                  )}
                </div>

                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  required
                  style={inputStyle}
                  disabled={assigning}
                >
                  <option value="">Select target team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>

                <button type="submit" style={primaryButtonStyle} disabled={assigning}>
                  {assigning ? "Assigning..." : "Assign Selected Users"}
                </button>
              </form>
            </div>

            <div style={cardStyle}>
              <div style={cardHeaderRowStyle}>
                <div>
                  <h2 style={sectionTitleStyle}>Bulk Assign Role</h2>
                  <p style={sectionSubtitleStyle}>
                    Apply the same role to selected users.
                  </p>
                </div>

                <span style={countPillStyle}>
                  Selected: {selectedRoleUserIds.length}
                </span>
              </div>

              <form onSubmit={handleBulkRoleAssign}>
                <input
                  type="text"
                  placeholder="Search users for role assignment..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  style={inputStyle}
                  disabled={assigningRole}
                />

                <div style={smallScrollableListStyle}>
                  {filteredRoleUsers.length === 0 ? (
                    <p style={mutedTextStyle}>No users found.</p>
                  ) : (
                    filteredRoleUsers.map((user) => (
                      <SelectableUser
                        key={user.id}
                        user={user}
                        checked={selectedRoleUserIds.includes(Number(user.id))}
                        disabled={assigningRole}
                        onChange={() =>
                          toggleUserSelection(user.id, setSelectedRoleUserIds)
                        }
                      />
                    ))
                  )}
                </div>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={inputStyle}
                  disabled={assigningRole}
                >
                  <option value="USER">USER</option>
                  <option value="TEAM_LEAD">TEAM_LEAD</option>
                  <option value="INCIDENT_MANAGER">INCIDENT_MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>

                <button
                  type="submit"
                  style={primaryButtonStyle}
                  disabled={assigningRole}
                >
                  {assigningRole ? "Assigning..." : "Assign Role to Selected Users"}
                </button>
              </form>
            </div>
          </div>

          <div style={bottomGridStyle}>
            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Teams</h2>
              <p style={sectionSubtitleStyle}>
                Open a team workspace or delete a team.
              </p>

              <div style={largeScrollableListStyle}>
                {teams.length === 0 ? (
                  <EmptyState
                    title="No teams yet"
                    text="Create a team to start assigning users."
                  />
                ) : (
                  teams.map((team) => (
                    <div key={team.id} style={teamRowStyle}>
                      <Link
                        to={`/admin/teams/${team.id}`}
                        style={teamLinkStyle}
                      >
                        <div>
                          <div style={teamTitleStyle}>{team.name}</div>
                          <div style={metaTextStyle}>Team ID: {team.id}</div>
                        </div>

                        <span style={openTextStyle}>Open →</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(team.id, team.name)}
                        style={dangerButtonStyle}
                        disabled={deletingTeamId === team.id}
                      >
                        {deletingTeamId === team.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Users</h2>
              <p style={sectionSubtitleStyle}>
                Review team membership, roles, and performance.
              </p>

              <div style={largeScrollableListStyle}>
                {users.length === 0 ? (
                  <EmptyState
                    title="No users found"
                    text="Registered users will appear here."
                  />
                ) : (
                  users.map((user) => (
                    <div key={user.id} style={userRowStyle}>
                      <Link
                        to={`/admin/users/${user.id}/performance`}
                        style={userLinkStyle}
                      >
                        <div style={avatarStyle}>
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <div style={userNameStyle}>
                            {user.name || "Unnamed User"}
                          </div>
                          <div style={userEmailStyle}>{user.email}</div>
                          <div style={metaTextStyle}>
                            Team: {user.teamName || "No team"}
                          </div>

<div style={badgeRowStyle}>
  {(user.roles || []).map((role) => (
    <span key={role} style={roleBadgeWrapperStyle}>
      <span>{role}</span>

      {role !== "USER" && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveRole(user.id, role);
          }}
          style={removeRoleButtonStyle}
        >
          ×
        </button>
      )}
    </span>
  ))}
</div>

                          <div style={viewPerformanceStyle}>
                            View performance →
                          </div>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        style={dangerButtonStyle}
                        disabled={deletingUserId === user.id}
                      >
                        {deletingUserId === user.id ? "Deleting..." : "Delete User"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={miniStatCardStyle}>
      <div style={miniStatLabelStyle}>{label}</div>
      <div style={miniStatValueStyle}>{value}</div>
    </div>
  );
}

function SelectableUser({ user, checked, onChange, disabled }) {
  return (
    <label
      style={{
        ...selectableRowStyle,
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div style={selectableLeftStyle}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={checkboxStyle}
          disabled={disabled}
        />

        <div>
          <div style={userNameStyle}>{user.name || "Unnamed User"}</div>
          <div style={userEmailStyle}>{user.email}</div>
          <div style={metaTextStyle}>Team: {user.teamName || "No team"}</div>
        </div>
      </div>

      <div style={badgeRowStyle}>
        {(user.roles || []).map((role) => (
          <span key={role} style={badgeStyle}>
            {role}
          </span>
        ))}
      </div>
    </label>
  );
}

function EmptyState({ title, text }) {
  return (
    <div style={emptyStateStyle}>
      <div style={emptyTitleStyle}>{title}</div>
      <div style={emptyTextStyle}>{text}</div>
    </div>
  );
}

function Toast({ message, type }) {
  return (
    <div
      style={{
        marginBottom: "18px",
        padding: "14px 16px",
        borderRadius: "12px",
        fontWeight: "800",
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
  maxWidth: "1320px",
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

const topGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginBottom: "20px",
};

const bulkGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginBottom: "20px",
};

const bottomGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  alignItems: "start",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "22px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
};

const cardHeaderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
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
  lineHeight: 1.4,
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
  cursor: "pointer",
};

const mutedTextStyle = {
  color: "#6b7280",
  margin: 0,
};

const miniStatsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const miniStatCardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "18px",
  backgroundColor: "#f9fafb",
};

const miniStatLabelStyle = {
  color: "#6b7280",
  fontSize: "14px",
  marginBottom: "8px",
  fontWeight: "700",
};

const miniStatValueStyle = {
  color: "#111827",
  fontSize: "30px",
  fontWeight: "800",
};

const countPillStyle = {
  backgroundColor: "#eff6ff",
  color: "#1d4ed8",
  border: "1px solid #bfdbfe",
  padding: "7px 11px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "800",
  whiteSpace: "nowrap",
};

const smallScrollableListStyle = {
  height: "260px",
  overflowY: "auto",
  paddingRight: "8px",
  display: "grid",
  alignContent: "start",
  gap: "10px",
  marginBottom: "14px",
};

const largeScrollableListStyle = {
  height: "420px",
  overflowY: "auto",
  paddingRight: "8px",
  display: "grid",
  alignContent: "start",
  gap: "12px",
};

const selectableRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  padding: "13px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
  cursor: "pointer",
};

const selectableLeftStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
};

const checkboxStyle = {
  marginTop: "4px",
  width: "16px",
  height: "16px",
};

const teamRowStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "14px",
  backgroundColor: "#f9fafb",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  minHeight: "76px",
};

const teamLinkStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  color: "inherit",
  textDecoration: "none",
  flex: 1,
};

const teamTitleStyle = {
  fontWeight: "800",
  color: "#111827",
  marginBottom: "4px",
};

const openTextStyle = {
  color: "#2563eb",
  fontWeight: "800",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const userRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
};

const userLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  color: "inherit",
  textDecoration: "none",
  flex: 1,
};

const avatarStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  backgroundColor: "#dbeafe",
  color: "#1d4ed8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
  flexShrink: 0,
};

const userNameStyle = {
  color: "#111827",
  fontWeight: "800",
  marginBottom: "4px",
};

const userEmailStyle = {
  color: "#4b5563",
  fontSize: "14px",
  marginBottom: "4px",
};

const metaTextStyle = {
  color: "#6b7280",
  fontSize: "13px",
  marginBottom: "6px",
};

const badgeRowStyle = {
  display: "flex",
  gap: "7px",
  flexWrap: "wrap",
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
  marginTop: "7px",
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
  whiteSpace: "nowrap",
};

const emptyStateStyle = {
  padding: "28px 16px",
  textAlign: "center",
  border: "1px dashed #d1d5db",
  borderRadius: "12px",
  backgroundColor: "#fafafa",
};

const emptyTitleStyle = {
  color: "#111827",
  fontWeight: "800",
  marginBottom: "6px",
};

const emptyTextStyle = {
  color: "#6b7280",
  fontSize: "14px",
};

const roleBadgeWrapperStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "5px 8px",
  fontSize: "11px",
  fontWeight: "800",
  borderRadius: "999px",
  backgroundColor: "#e0e7ff",
  color: "#3730a3",
};

const removeRoleButtonStyle = {
  border: "none",
  backgroundColor: "transparent",
  color: "#4338ca",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "900",
  lineHeight: 1,
};

export default AdminTeamsPage;