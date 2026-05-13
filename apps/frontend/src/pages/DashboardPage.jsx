import { useEffect, useMemo, useState } from "react";
import NotificationBell from "../components/NotificationBell";
import useLiveOpsUpdates from "../hooks/useLiveOpsUpdates";
import { getRecentActivity } from "../api/activityApi";
import {
  createTask,
  deleteTask,
  getMyTasks,
  updateTask,
  updateTaskStatus,
} from "../api/taskApi";
import { getMyIncidents } from "../api/IncidentAPI";

function normalizeDateForInput(value) {
  if (!value) return "";

  if (Array.isArray(value)) {
    const [year, month, day] = value;
    if (!year || !month || !day) return "";
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }

    return "";
  }

  return "";
}

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingOriginalAssignedToEmail, setEditingOriginalAssignedToEmail] =
    useState("");
  const [creatingOrUpdatingTask, setCreatingOrUpdatingTask] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedToEmail: "",
    priority: "MEDIUM",
    dueDate: "",
    incidentId: "",
  });

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const clearForm = () => {
    setEditingTaskId(null);
    setEditingOriginalAssignedToEmail("");
    setFormData({
      title: "",
      description: "",
      assignedToEmail: "",
      priority: "MEDIUM",
      dueDate: "",
      incidentId: "",
    });
  };

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      setError("");
      const data = await getMyTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("LOAD TASKS ERROR:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadIncidents = async () => {
    try {
      setLoadingIncidents(true);
      const data = await getMyIncidents();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("LOAD INCIDENTS ERROR:", err);
    } finally {
      setLoadingIncidents(false);
    }
  };

  const loadActivity = async () => {
    try {
      setLoadingActivity(true);
      const data = await getRecentActivity();
      setActivityFeed(Array.isArray(data) ? data.slice(0, 20) : []);
    } catch (err) {
      console.log("LOAD ACTIVITY ERROR:", err);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    loadTasks();
    loadIncidents();
    loadActivity();
  }, []);

  useLiveOpsUpdates({
    onIncidentCreated: (newIncident) => {
      setIncidents((prev) => {
        const incomingId = newIncident.incidentId ?? newIncident.id;
        if (prev.some((incident) => incident.id === incomingId)) return prev;

        return [
          {
            id: incomingId,
            title: newIncident.title,
            description: newIncident.description,
            severity: newIncident.severity,
            status: newIncident.status,
            ownerEmail: newIncident.ownerEmail,
            impactedService: newIncident.impactedService,
            createdAt: newIncident.createdAt,
          },
          ...prev,
        ];
      });
    },

    onIncidentStatusUpdated: (updatedIncident) => {
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.id === updatedIncident.incidentId
            ? { ...incident, status: updatedIncident.status }
            : incident
        )
      );
    },

    onTaskCreated: (newTask) => {
      setTasks((prev) => {
        const incomingId = newTask.taskId ?? newTask.id;
        if (prev.some((task) => task.id === incomingId)) return prev;

        return [
          {
            id: incomingId,
            title: newTask.title,
            description: newTask.description,
            status: newTask.status,
            priority: newTask.priority,
            assignedToEmail: newTask.assignedToEmail,
            incidentId: newTask.incidentId,
            incidentTitle: newTask.incidentTitle ?? null,
            dueDate: newTask.dueDate ?? null,
            createdAt: newTask.createdAt,
          },
          ...prev,
        ];
      });
    },

    onTaskStatusUpdated: (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === updatedTask.taskId
            ? { ...task, status: updatedTask.status }
            : task
        )
      );
    },

onActivityEvent: (event) => {
  setActivityFeed((prev) => {
    const normalizedEvent = {
      type: event.type,
      message: event.message,
      actorEmail: event.actorEmail,
      entityType: event.entityType,
      entityId: event.entityId,
      timestamp: event.timestamp || event.createdAt || new Date().toISOString(),
    };

    const duplicate = prev.some(
      (item) =>
        item.type === normalizedEvent.type &&
        item.message === normalizedEvent.message &&
        item.entityType === normalizedEvent.entityType &&
        item.entityId === normalizedEvent.entityId &&
        item.timestamp === normalizedEvent.timestamp
    );

    if (duplicate) return prev;
    return [normalizedEvent, ...prev].slice(0, 20);
  });

  const eventType = String(event.type || "").toUpperCase();

  if (eventType.includes("TASK")) {
    loadTasks();
  }

  if (eventType.includes("INCIDENT")) {
    loadIncidents();
  }
},
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = `${task.title || ""} ${task.description || ""} ${
        task.assignedToEmail || ""
      } ${task.incidentTitle || ""}`.toLowerCase();

      const matchesSearch = searchText.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ? true : task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const hasIncidents = incidents.length > 0;
  const canSaveTask =
    formData.title.trim() &&
    formData.description.trim() &&
    formData.assignedToEmail.trim() &&
    formData.incidentId;

  const totalTasks = tasks.length;
  const openTasks = tasks.filter((task) => task.status === "OPEN").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;
  const doneTasks = tasks.filter((task) => task.status === "DONE").length;
  const linkedTasks = tasks.filter((task) => task.incidentId).length;
  const activeIncidents = incidents.filter(
    (incident) => incident.status !== "RESOLVED"
  ).length;

  const completionRate =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const activeWorkload =
    totalTasks === 0
      ? 0
      : Math.round(((openTasks + inProgressTasks) / totalTasks) * 100);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const buildTaskPayload = () => ({
  title: formData.title.trim(),
  description: formData.description.trim(),
  assignedToEmail: formData.assignedToEmail.trim(),
  priority: formData.priority,
  dueDate: formData.dueDate || null,
  incidentId: formData.incidentId ? Number(formData.incidentId) : null,
});

  const handleCreateOrUpdateTask = async (e) => {
    e.preventDefault();

    try {
      setCreatingOrUpdatingTask(true);
      setError("");

      const payload = buildTaskPayload();
      console.log("TASK PAYLOAD:", payload);

      if (editingTaskId) {
        await updateTask(editingTaskId, payload);

        if (
          editingOriginalAssignedToEmail &&
          editingOriginalAssignedToEmail !== payload.assignedToEmail
        ) {
          showSuccess(
            `Task updated and reassigned to ${payload.assignedToEmail}.`
          );
        } else {
          showSuccess("Task updated successfully.");
        }
      } else {
        await createTask(payload);
        showSuccess("Task created successfully.");
      }

      clearForm();
      await loadTasks();
    } catch (err) {
      console.log("CREATE/UPDATE TASK ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save task."
      );
    } finally {
      setCreatingOrUpdatingTask(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingOriginalAssignedToEmail(task.assignedToEmail || "");

    setFormData({
      title: task.title || "",
      description: task.description || "",
      assignedToEmail: task.assignedToEmail || "",
      priority: task.priority || "MEDIUM",
      dueDate: normalizeDateForInput(task.dueDate),
      incidentId: task.incidentId ? String(task.incidentId) : "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setError("");
      await updateTaskStatus(taskId, newStatus);
      showSuccess("Task status updated.");
      await loadTasks();
    } catch (err) {
      console.log("UPDATE STATUS ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update task status."
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setError("");
      await deleteTask(taskId);
      showSuccess("Task deleted successfully.");
      await loadTasks();

      if (editingTaskId === taskId) clearForm();
    } catch (err) {
      console.log("DELETE TASK ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete task."
      );
    }
  };

  return (
    <div style={pageStyle}>
      <div style={pageHeaderStyle}>
        <div>
          <p style={eyebrowStyle}>Command Center</p>
          <h1 style={pageTitleStyle}>OpsPilot Dashboard</h1>
          <p style={pageSubtitleStyle}>
            Monitor live operations, assigned tasks, incident activity, and
            team execution from one workspace.
          </p>
        </div>

        <div style={headerRightStyle}>
          <div style={healthPillStyle}>
            <span style={pulseDotStyle}></span>
            Live Ops Active
          </div>
          <NotificationBell />
        </div>
      </div>

      {successMessage && <Toast message={successMessage} type="success" />}
      {error && <Toast message={error} type="error" />}

      <div style={heroGridStyle}>
        <div style={heroCardStyle}>
          <p style={cardLabelStyle}>Operational Health</p>
          <h2 style={heroNumberStyle}>{completionRate}%</h2>
          <p style={mutedTextStyle}>
            Task completion rate across your current workload.
          </p>

          <div style={progressTrackStyle}>
            <div
              style={{
                ...progressFillStyle,
                width: `${completionRate}%`,
                background: "#16a34a",
              }}
            />
          </div>
        </div>

        <div style={heroCardStyle}>
          <p style={cardLabelStyle}>Active Workload</p>
          <h2 style={heroNumberStyle}>{activeWorkload}%</h2>
          <p style={mutedTextStyle}>
            Open and in-progress work compared to total assigned tasks.
          </p>

          <div style={progressTrackStyle}>
            <div
              style={{
                ...progressFillStyle,
                width: `${activeWorkload}%`,
                background: "#2563eb",
              }}
            />
          </div>
        </div>

        <div style={insightCardStyle}>
          <p style={cardLabelStyle}>Workspace Insight</p>
          <h2 style={insightTitleStyle}>
            {getDashboardInsightTitle(activeIncidents, openTasks)}
          </h2>
          <p style={mutedTextStyle}>
            {getDashboardInsightText(activeIncidents, openTasks, doneTasks)}
          </p>
        </div>
      </div>

      <div style={statsGridStyle}>
        <StatCard label="Total Tasks" value={totalTasks} tone="default" />
        <StatCard label="Open" value={openTasks} tone="warning" />
        <StatCard label="In Progress" value={inProgressTasks} tone="info" />
        <StatCard label="Done" value={doneTasks} tone="success" />
        <StatCard
          label="Linked to Incidents"
          value={linkedTasks}
          tone="purple"
        />
        <StatCard
          label="Active Incidents"
          value={activeIncidents}
          tone="danger"
        />
      </div>

      <div style={activityCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <p style={cardLabelStyle}>Live Stream</p>
            <h2 style={sectionTitleStyle}>Activity Feed</h2>
            <p style={sectionSubtitleStyle}>
              Latest operational changes across your workspace.
            </p>
          </div>
        </div>

        {loadingActivity ? (
          <p style={mutedTextStyle}>Loading activity...</p>
        ) : activityFeed.length === 0 ? (
          <EmptyState
            title="No activity yet"
            text="Live updates will appear here."
          />
        ) : (
          <div style={activityListStyle}>
{activityFeed.map((event, index) => (
  <div
    key={`${event.timestamp || event.createdAt || "event"}-${event.entityType}-${event.entityId}-${index}`}
    style={activityItemStyle}
  >
    <div style={activityIconStyle}>
      {getActivityIcon(event.type)}
    </div>


                <div style={{ flex: 1 }}>
                  <div style={activityMessageStyle}>
                    {event.message || event.type || "Activity"}
                  </div>

                  <div style={activityMetaStyle}>
                    {event.type || "EVENT"} • {formatTimestamp(event.timestamp || event.createdAt)}
                    {event.actorEmail ? ` • ${event.actorEmail}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={mainGridStyle}>
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <p style={cardLabelStyle}>Work Creation</p>
            <h2 style={sectionTitleStyle}>
              {editingTaskId ? "Edit Task" : "Create Task"}
            </h2>
            <p style={sectionSubtitleStyle}>
              Create work items and link them to active incidents.
            </p>
          </div>

          {!loadingIncidents && incidents.length === 0 && (
            <div style={warningStyle}>
              No incidents are available. Create an incident before creating a
              task.
            </div>
          )}

          <form onSubmit={handleCreateOrUpdateTask}>
            <input
              type="text"
              name="title"
              placeholder="Task title"
              value={formData.title}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <textarea
              name="description"
              placeholder="Task description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <input
              type="email"
              name="assignedToEmail"
              placeholder="Assign to email"
              value={formData.assignedToEmail}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <div style={formTwoColumnStyle}>
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
              disabled={loadingIncidents || incidents.length === 0}
              required
              style={inputStyle}
            >
              <option value="">
                {loadingIncidents
                  ? "Loading incidents..."
                  : incidents.length > 0
                  ? "Select linked incident"
                  : "No incidents available"}
              </option>

              {incidents.map((incident) => (
                <option key={incident.id} value={incident.id}>
                  #{incident.id} - {incident.title}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={
                creatingOrUpdatingTask || !canSaveTask || !hasIncidents
              }
              style={{
                ...primaryButtonStyle,
                opacity:
                  creatingOrUpdatingTask || !canSaveTask || !hasIncidents
                    ? 0.65
                    : 1,
                cursor:
                  creatingOrUpdatingTask || !canSaveTask || !hasIncidents
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {creatingOrUpdatingTask
                ? "Saving..."
                : editingTaskId
                ? "Update Task"
                : "Create Task"}
            </button>

            {editingTaskId && (
              <button
                type="button"
                onClick={clearForm}
                style={secondaryFullButtonStyle}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div style={cardStyle}>
          <div style={tasksHeaderStyle}>
            <div>
              <p style={cardLabelStyle}>Execution Queue</p>
              <h2 style={sectionTitleStyle}>My Tasks</h2>
              <p style={sectionSubtitleStyle}>
                Manage assigned and incident-linked work.
              </p>
            </div>

            <div style={filterRowStyle}>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={smallInputStyle}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={smallInputStyle}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
          </div>

          {loadingTasks ? (
            <p style={mutedTextStyle}>Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              title="No matching tasks"
              text="Try changing the search or status filter."
            />
          ) : (
            <div style={taskListStyle}>
              {filteredTasks.map((task) => (
                <div key={task.id} style={taskCardStyle}>
                  <div style={taskTopStyle}>
                    <div>
                      <h3 style={taskTitleStyle}>{task.title}</h3>
                      <p style={taskDescriptionStyle}>{task.description}</p>
                    </div>

                    <div style={badgeRowStyle}>
                      <Badge label={task.status} tone={task.status} />
                      <Badge label={task.priority} tone={task.priority} />
                    </div>
                  </div>

                  <div style={taskMetaGridStyle}>
                    <MetaItem label="Assigned To" value={task.assignedToEmail} />
                    <MetaItem
                      label="Due Date"
                      value={
                        task.dueDate ? formatTimestamp(task.dueDate) : "Not set"
                      }
                    />
                    <MetaItem
                      label="Linked Incident"
                      value={
                        task.incidentTitle
                          ? `#${task.incidentId} - ${task.incidentTitle}`
                          : "None"
                      }
                    />
                    <MetaItem
                      label="Created"
                      value={formatTimestamp(task.createdAt)}
                    />
                  </div>

                  <div style={actionRowStyle}>
                    <button
                      onClick={() => handleEditTask(task)}
                      style={secondaryButtonStyle}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleStatusChange(task.id, "OPEN")}
                      style={secondaryButtonStyle}
                    >
                      Open
                    </button>

                    <button
                      onClick={() =>
                        handleStatusChange(task.id, "IN_PROGRESS")
                      }
                      style={secondaryButtonStyle}
                    >
                      In Progress
                    </button>

                    <button
                      onClick={() => handleStatusChange(task.id, "DONE")}
                      style={secondaryButtonStyle}
                    >
                      Done
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={dangerButtonStyle}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div style={statCardStyle}>
      <div style={statAccentStyle(tone)} />
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
    </div>
  );
}

function Badge({ label, tone }) {
  return <span style={badgeStyle(tone)}>{label}</span>;
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
        ...toastStyle,
        backgroundColor: type === "success" ? "#dcfce7" : "#fee2e2",
        color: type === "success" ? "#166534" : "#991b1b",
        border:
          type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
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

function formatTimestamp(value) {
  if (!value) return "N/A";

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    return new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    ).toLocaleString();
  }

  if (typeof value === "number") {
    const milliseconds = value < 1000000000000 ? value * 1000 : value;
    return new Date(milliseconds).toLocaleString();
  }

  if (typeof value === "string") {
    const numericValue = Number(value);

    if (!Number.isNaN(numericValue) && value.trim() !== "") {
      const milliseconds =
        numericValue < 1000000000000 ? numericValue * 1000 : numericValue;
      return new Date(milliseconds).toLocaleString();
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString();
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }

  return String(value);
}

function getActivityIcon(type) {
  const value = String(type || "").toUpperCase();

  if (value.includes("TASK")) return "✓";
  if (value.includes("INCIDENT")) return "!";
  if (value.includes("COMMENT")) return "💬";
  return "•";
}

function getDashboardInsightTitle(activeIncidents, openTasks) {
  if (activeIncidents > 3) return "Incident Load Elevated";
  if (openTasks > 5) return "Task Queue Growing";
  return "Workspace Stable";
}

function getDashboardInsightText(activeIncidents, openTasks, doneTasks) {
  if (activeIncidents > 3) {
    return "There are multiple active incidents. Prioritize ownership, resolution, and communication.";
  }

  if (openTasks > 5) {
    return "Open tasks are increasing. Review assignment balance and due dates.";
  }

  if (doneTasks > 0) {
    return "Execution is moving. Continue monitoring live activity and pending tasks.";
  }

  return "No major operational pressure detected right now.";
}

function getToneColor(tone) {
  if (tone === "success" || tone === "DONE") return "#16a34a";
  if (tone === "warning" || tone === "OPEN" || tone === "HIGH") return "#d97706";
  if (tone === "danger" || tone === "CRITICAL") return "#dc2626";
  if (tone === "purple") return "#7c3aed";
  if (tone === "info" || tone === "IN_PROGRESS") return "#2563eb";
  return "#111827";
}

function getToneBackground(tone) {
  if (tone === "success" || tone === "DONE") return "#dcfce7";
  if (tone === "warning" || tone === "OPEN" || tone === "HIGH") return "#fef3c7";
  if (tone === "danger" || tone === "CRITICAL") return "#fee2e2";
  if (tone === "purple") return "#ede9fe";
  if (tone === "info" || tone === "IN_PROGRESS") return "#dbeafe";
  return "#f3f4f6";
}

const pageStyle = {
  maxWidth: "1320px",
  margin: "0 auto",
  paddingBottom: "40px",
};

const pageHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "24px",
};

const headerRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const healthPillStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 14px",
  borderRadius: "999px",
  backgroundColor: "#ecfdf5",
  color: "#166534",
  fontWeight: "900",
  border: "1px solid #bbf7d0",
  fontSize: "13px",
};

const pulseDotStyle = {
  width: "9px",
  height: "9px",
  borderRadius: "999px",
  backgroundColor: "#22c55e",
};

const eyebrowStyle = {
  margin: 0,
  color: "#2563eb",
  fontSize: "13px",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const pageTitleStyle = {
  margin: "6px 0 0",
  fontSize: "40px",
  lineHeight: 1.1,
  fontWeight: "900",
  color: "#111827",
};

const pageSubtitleStyle = {
  marginTop: "10px",
  marginBottom: 0,
  color: "#6b7280",
  fontSize: "15px",
  maxWidth: "760px",
};

const cardLabelStyle = {
  margin: 0,
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const heroGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1.15fr",
  gap: "18px",
  marginBottom: "18px",
};

const heroCardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "18px",
  padding: "22px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 22px rgba(15,23,42,0.05)",
};

const insightCardStyle = {
  backgroundColor: "#ffffff",
  color: "#111827",
  borderRadius: "18px",
  padding: "22px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 22px rgba(15,23,42,0.05)",
};

const heroNumberStyle = {
  margin: "10px 0 0",
  color: "#111827",
  fontSize: "34px",
  fontWeight: "800",
};

const insightTitleStyle = {
  margin: "10px 0 0",
  color: "#111827",
  fontSize: "24px",
  fontWeight: "800",
};

const progressTrackStyle = {
  height: "8px",
  backgroundColor: "#eef2f7",
  borderRadius: "999px",
  overflow: "hidden",
  marginTop: "18px",
};

const progressFillStyle = {
  height: "100%",
  borderRadius: "999px",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "14px",
  marginBottom: "20px",
};

const statCardStyle = {
  position: "relative",
  backgroundColor: "#ffffff",
  borderRadius: "18px",
  padding: "20px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
  overflow: "hidden",
};

const statAccentStyle = (tone) => ({
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: "5px",
  backgroundColor: getToneColor(tone),
});

const statLabelStyle = {
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: "900",
};

const statValueStyle = {
  marginTop: "10px",
  color: "#111827",
  fontSize: "32px",
  fontWeight: "900",
};

const activityCardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "22px",
  padding: "24px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
  marginBottom: "20px",
};

const sectionHeaderStyle = {
  marginBottom: "16px",
};

const sectionTitleStyle = {
  margin: "4px 0 0",
  color: "#111827",
  fontSize: "24px",
  fontWeight: "900",
};

const sectionSubtitleStyle = {
  marginTop: "7px",
  marginBottom: 0,
  color: "#6b7280",
  fontSize: "14px",
};

const activityListStyle = {
  display: "grid",
  gap: "10px",
  maxHeight: "250px",
  overflowY: "auto",
  paddingRight: "6px",
};

const activityItemStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  padding: "14px",
  borderRadius: "14px",
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
};

const activityIconStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "10px",
  backgroundColor: "#dbeafe",
  color: "#1d4ed8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
  flexShrink: 0,
};

const activityMessageStyle = {
  color: "#111827",
  fontWeight: "900",
  marginBottom: "4px",
};

const activityMetaStyle = {
  color: "#6b7280",
  fontSize: "12px",
};

const mainGridStyle = {
  display: "grid",
  gridTemplateColumns: "410px minmax(0, 1fr)",
  gap: "20px",
  alignItems: "start",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "22px",
  padding: "24px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  marginBottom: "14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
};

const formTwoColumnStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const smallInputStyle = {
  padding: "11px 12px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  minWidth: "175px",
  backgroundColor: "#ffffff",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontWeight: "900",
  fontSize: "15px",
  boxShadow: "0 10px 22px rgba(37,99,235,0.24)",
};

const secondaryFullButtonStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#111827",
  fontWeight: "900",
  marginTop: "10px",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  backgroundColor: "#eef2ff",
  color: "#1d4ed8",
  border: "1px solid #c7d2fe",
  padding: "10px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "900",
};

const dangerButtonStyle = {
  ...secondaryButtonStyle,
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
};

const warningStyle = {
  padding: "13px 14px",
  borderRadius: "12px",
  backgroundColor: "#fef3c7",
  border: "1px solid #fde68a",
  color: "#92400e",
  fontWeight: "800",
  marginBottom: "14px",
};

const tasksHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
  flexWrap: "wrap",
  marginBottom: "16px",
};

const filterRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const taskListStyle = {
  display: "grid",
  gap: "14px",
  maxHeight: "650px",
  overflowY: "auto",
  paddingRight: "6px",
};

const taskCardStyle = {
  padding: "18px",
  borderRadius: "18px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
};

const taskTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const taskTitleStyle = {
  margin: 0,
  color: "#111827",
  fontSize: "18px",
  fontWeight: "900",
};

const taskDescriptionStyle = {
  color: "#4b5563",
  marginTop: "7px",
  marginBottom: "14px",
  lineHeight: 1.5,
};

const badgeRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const badgeStyle = (tone) => ({
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  backgroundColor: getToneBackground(tone),
  color: getToneColor(tone),
  fontSize: "12px",
  fontWeight: "900",
});

const taskMetaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "12px",
  marginBottom: "16px",
  padding: "14px",
  backgroundColor: "#f9fafb",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
};

const metaLabelStyle = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "900",
  marginBottom: "4px",
};

const metaValueStyle = {
  color: "#111827",
  fontSize: "13px",
  fontWeight: "800",
};

const actionRowStyle = {
  display: "flex",
  gap: "9px",
  flexWrap: "wrap",
};

const mutedTextStyle = {
  color: "#6b7280",
  lineHeight: 1.55,
};

const toastStyle = {
  marginBottom: "20px",
  padding: "14px 16px",
  borderRadius: "12px",
  fontWeight: "900",
};

const emptyStateStyle = {
  padding: "34px 18px",
  textAlign: "center",
  border: "1px dashed #d1d5db",
  borderRadius: "16px",
  backgroundColor: "#fafafa",
};

const emptyTitleStyle = {
  color: "#111827",
  fontWeight: "900",
  marginBottom: "6px",
};

const emptyTextStyle = {
  color: "#6b7280",
  fontSize: "14px",
};

export default DashboardPage;