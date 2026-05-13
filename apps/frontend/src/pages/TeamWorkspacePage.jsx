import { useEffect, useMemo, useState } from "react";
import { createTeamWorkspaceTask, getMyTeamWorkspace } from "../api/teamWorkspaceApi";
import { getMyIncidents } from "../api/IncidentAPI";
import { getApiErrorMessage } from "../utils/apiError";

function TeamWorkspacePage() {
  const [workspace, setWorkspace] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedToEmail: "",
    priority: "MEDIUM",
    dueDate: "",
    incidentId: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [workspaceData, incidentsData] = await Promise.all([
        getMyTeamWorkspace(),
        getMyIncidents(),
      ]);

      setWorkspace(workspaceData);
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
    } catch (err) {
      console.error("TEAM WORKSPACE LOAD ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to load team workspace."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const members = workspace?.members || [];
  const tasks = workspace?.tasks || [];

  const activeIncidents = useMemo(
    () => incidents.filter((incident) => incident.status !== "RESOLVED"),
    [incidents]
  );

  const canSave =
    formData.title.trim() &&
    formData.description.trim() &&
    formData.assignedToEmail &&
    formData.incidentId;

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 2500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await createTeamWorkspaceTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedToEmail: formData.assignedToEmail,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        incidentId: Number(formData.incidentId),
      });

      setFormData({
        title: "",
        description: "",
        assignedToEmail: "",
        priority: "MEDIUM",
        dueDate: "",
        incidentId: "",
      });

      showSuccess("Task assigned to team member.");
      await loadData();
    } catch (err) {
      console.error("TEAM TASK CREATE ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to assign task."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>Loading team workspace...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Team Lead Workspace</p>
          <h1 style={titleStyle}>{workspace?.teamName || "My Team"}</h1>
          <p style={subtitleStyle}>
            Manage team workload, review members, and assign tasks within your team.
          </p>
        </div>
      </div>

      {error && <Toast message={error} type="error" />}
      {success && <Toast message={success} type="success" />}

      <div style={statsGridStyle}>
        <StatCard label="Members" value={members.length} />
        <StatCard label="Total Tasks" value={workspace?.totalTasks || 0} />
        <StatCard label="Open" value={workspace?.openTasks || 0} />
        <StatCard label="In Progress" value={workspace?.inProgressTasks || 0} />
        <StatCard label="Done" value={workspace?.doneTasks || 0} />
      </div>

      <div style={mainGridStyle}>
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Assign Team Task</h2>
          <p style={sectionSubtitleStyle}>
            Create a task only for users in your team.
          </p>

          <form onSubmit={handleCreateTask}>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title"
              required
              style={inputStyle}
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Task description"
              required
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <select
              name="assignedToEmail"
              value={formData.assignedToEmail}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Assign to team member</option>
              {members.map((member) => (
                <option key={member.id} value={member.email}>
                  {member.name || "Unnamed User"} ({member.email})
                </option>
              ))}
            </select>

            <div style={twoColumnStyle}>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>

              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <select
              name="incidentId"
              value={formData.incidentId}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Select linked incident</option>
              {activeIncidents.map((incident) => (
                <option key={incident.id} value={incident.id}>
                  #{incident.id} - {incident.title}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!canSave || saving}
              style={{
                ...primaryButtonStyle,
                opacity: !canSave || saving ? 0.65 : 1,
                cursor: !canSave || saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Assigning..." : "Assign Task"}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Team Members</h2>
          <p style={sectionSubtitleStyle}>
            Members currently assigned to your team.
          </p>

          <div style={listStyle}>
            {members.length === 0 ? (
              <EmptyState title="No members" text="No users are assigned to this team." />
            ) : (
              members.map((member) => (
                <div key={member.id} style={memberRowStyle}>
                  <div style={avatarStyle}>
                    {member.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <div style={memberNameStyle}>{member.name || "Unnamed User"}</div>
                    <div style={memberEmailStyle}>{member.email}</div>

                    <div style={badgeRowStyle}>
                      {(member.roles || []).map((role) => (
                        <span key={role} style={badgeStyle}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Team Tasks</h2>
        <p style={sectionSubtitleStyle}>
          Current task workload across your team members.
        </p>

        {tasks.length === 0 ? (
          <EmptyState title="No team tasks" text="Assigned team tasks will appear here." />
        ) : (
          <div style={taskListStyle}>
            {tasks.map((task, index) => (
              <div key={`${task.id}-${index}`} style={taskCardStyle}>
                <div>
                  <h3 style={taskTitleStyle}>{task.title}</h3>
                  <p style={taskDescriptionStyle}>{task.description}</p>
                </div>

                <div style={taskMetaGridStyle}>
                  <MetaItem label="Assigned To" value={task.assignedToEmail} />
                  <MetaItem label="Status" value={task.status} />
                  <MetaItem label="Priority" value={task.priority} />
                  <MetaItem
                    label="Incident"
                    value={
                      task.incidentTitle
                        ? `#${task.incidentId} - ${task.incidentTitle}`
                        : "None"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCardStyle}>
      <p style={statLabelStyle}>{label}</p>
      <h3 style={statValueStyle}>{value}</h3>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <div style={metaLabelStyle}>{label}</div>
      <div style={metaValueStyle}>{value || "N/A"}</div>
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

function EmptyState({ title, text }) {
  return (
    <div style={emptyStateStyle}>
      <div style={emptyTitleStyle}>{title}</div>
      <div style={emptyTextStyle}>{text}</div>
    </div>
  );
}

const pageStyle = { maxWidth: "1320px", margin: "0 auto", paddingBottom: "40px" };
const headerStyle = { marginBottom: "24px" };
const eyebrowStyle = {
  margin: 0,
  color: "#2563eb",
  fontSize: "13px",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};
const titleStyle = { margin: "6px 0 0", fontSize: "38px", fontWeight: "900", color: "#111827" };
const subtitleStyle = { marginTop: "8px", color: "#6b7280", fontSize: "15px" };

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "14px",
  marginBottom: "20px",
};

const statCardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
};

const statLabelStyle = { margin: 0, color: "#6b7280", fontSize: "13px", fontWeight: "900" };
const statValueStyle = { margin: "10px 0 0", color: "#111827", fontSize: "30px", fontWeight: "900" };

const mainGridStyle = {
  display: "grid",
  gridTemplateColumns: "420px minmax(0, 1fr)",
  gap: "20px",
  alignItems: "start",
  marginBottom: "20px",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "18px",
  padding: "22px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
};

const sectionTitleStyle = { marginTop: 0, marginBottom: "6px", color: "#111827", fontSize: "22px", fontWeight: "900" };
const sectionSubtitleStyle = { marginTop: 0, marginBottom: "16px", color: "#6b7280", fontSize: "14px" };

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

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "13px 14px",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: "900",
};

const listStyle = { display: "grid", gap: "12px", maxHeight: "440px", overflowY: "auto", paddingRight: "8px" };

const memberRowStyle = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
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
  fontWeight: "900",
  flexShrink: 0,
};

const memberNameStyle = { color: "#111827", fontWeight: "900", marginBottom: "4px" };
const memberEmailStyle = { color: "#4b5563", fontSize: "14px", marginBottom: "6px" };
const badgeRowStyle = { display: "flex", gap: "7px", flexWrap: "wrap" };

const badgeStyle = {
  display: "inline-block",
  padding: "5px 9px",
  fontSize: "11px",
  fontWeight: "900",
  borderRadius: "999px",
  backgroundColor: "#e0e7ff",
  color: "#3730a3",
};

const taskListStyle = { display: "grid", gap: "14px", maxHeight: "520px", overflowY: "auto", paddingRight: "8px" };
const taskCardStyle = {
  padding: "18px",
  borderRadius: "16px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
};
const taskTitleStyle = { margin: 0, color: "#111827", fontSize: "18px", fontWeight: "900" };
const taskDescriptionStyle = { color: "#4b5563", marginTop: "6px", marginBottom: "14px" };

const taskMetaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "12px",
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
  padding: "14px",
};

const metaLabelStyle = { color: "#6b7280", fontSize: "12px", fontWeight: "900", marginBottom: "4px" };
const metaValueStyle = { color: "#111827", fontSize: "13px", fontWeight: "800" };

const emptyStateStyle = {
  padding: "28px 16px",
  textAlign: "center",
  border: "1px dashed #d1d5db",
  borderRadius: "12px",
  backgroundColor: "#fafafa",
};
const emptyTitleStyle = { color: "#111827", fontWeight: "900", marginBottom: "6px" };
const emptyTextStyle = { color: "#6b7280", fontSize: "14px" };

export default TeamWorkspacePage;