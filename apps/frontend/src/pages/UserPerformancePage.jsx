import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserPerformance } from "../api/adminApi";
import { getApiErrorMessage } from "../utils/apiError";

function UserPerformancePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPerformance = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getUserPerformance(userId);
      setData(response);
    } catch (err) {
      console.error("LOAD USER PERFORMANCE ERROR:", err);
      setError(getApiErrorMessage(err, "Failed to load user performance."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, [userId]);

  const score = useMemo(() => {
    if (!data) return 0;

    const completion = data.completionRate || 0;
    const overduePenalty = (data.overdueTasks || 0) > 0 ? 20 : 0;
    const workloadPenalty = (data.activeWorkloadRate || 0) > 75 ? 10 : 0;

    return Math.max(
      0,
      Math.min(100, completion - overduePenalty - workloadPenalty)
    );
  }, [data]);

  const assessment = useMemo(() => {
    if (!data) {
      return {
        label: "No Data",
        tone: "neutral",
        message: "No performance information is available yet.",
      };
    }

    if ((data.overdueTasks || 0) > 0) {
      return {
        label: "Needs Attention",
        tone: "danger",
        message:
          "This user has overdue work. Review task deadlines before assigning additional workload.",
      };
    }

    if (
      (data.completionRate || 0) >= 75 &&
      (data.activeWorkloadRate || 0) <= 60
    ) {
      return {
        label: "Strong Performer",
        tone: "success",
        message:
          "This user is completing work consistently while maintaining a healthy active workload.",
      };
    }

    if ((data.activeWorkloadRate || 0) >= 75) {
      return {
        label: "High Workload",
        tone: "warning",
        message:
          "This user has a high active workload. Consider redistributing new tasks if needed.",
      };
    }

    return {
      label: "Balanced Workload",
      tone: "info",
      message:
        "This user’s workload is currently stable based on assigned tasks and incident ownership.",
    };
  }, [data]);

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingCardStyle}>Loading user performance...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <button onClick={() => navigate(-1)} style={backButtonStyle}>
          ← Back
        </button>
        <div style={errorStyle}>{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={pageStyle}>
        <button onClick={() => navigate(-1)} style={backButtonStyle}>
          ← Back
        </button>
        <div style={emptyStyle}>No performance data found.</div>
      </div>
    );
  }

  const userName = data.userName || data.name || "User";
  const email = data.email || "No email";
  const teamName = data.teamName || "No team assigned";
  const roles = data.roles || [];

  const totalTasks = data.totalTasks || 0;
  const openTasks = data.openTasks || 0;
  const inProgressTasks = data.inProgressTasks || 0;
  const completedTasks = data.completedTasks || data.doneTasks || 0;
  const overdueTasks = data.overdueTasks || 0;
  const ownedIncidents = data.ownedIncidents || data.totalIncidents || 0;
  const activeIncidents = data.activeIncidents || 0;
  const completionRate = data.completionRate || 0;
  const activeWorkloadRate = data.activeWorkloadRate || 0;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>User Performance</p>
          <h1 style={titleStyle}>{userName}</h1>
          <p style={subtitleStyle}>
            {email} • {teamName}
          </p>

          <div style={roleRowStyle}>
            {roles.length === 0 ? (
              <span style={roleBadgeStyle}>USER</span>
            ) : (
              roles.map((role) => (
                <span key={role} style={roleBadgeStyle}>
                  {role}
                </span>
              ))
            )}
          </div>
        </div>

        <button onClick={() => navigate(-1)} style={backButtonStyle}>
          ← Back
        </button>
      </div>

      <div style={heroGridStyle}>
        <div style={profileCardStyle}>
          <div style={avatarStyle}>{userName.charAt(0).toUpperCase()}</div>

          <div style={{ flex: 1 }}>
            <p style={cardLabelStyle}>Performance Score</p>
            <h2 style={scoreTextStyle}>{score}/100</h2>
            <p style={mutedStyle}>
              Calculated from completion rate, active workload, overdue tasks,
              and incident ownership.
            </p>

            <div style={progressTrackStyle}>
              <div style={{ ...progressFillStyle, width: `${score}%` }} />
            </div>
          </div>
        </div>

        <div style={assessmentCardStyle(assessment.tone)}>
          <p style={assessmentSmallStyle}>Assessment</p>
          <h2 style={assessmentTitleStyle}>{assessment.label}</h2>
          <p style={assessmentMessageStyle}>{assessment.message}</p>
        </div>
      </div>

      <div style={kpiGridStyle}>
        <KpiCard label="Total Tasks" value={totalTasks} />
        <KpiCard label="Open" value={openTasks} tone="warning" />
        <KpiCard label="In Progress" value={inProgressTasks} tone="info" />
        <KpiCard label="Completed" value={completedTasks} tone="success" />
        <KpiCard label="Overdue" value={overdueTasks} tone="danger" />
        <KpiCard label="Owned Incidents" value={ownedIncidents} />
      </div>

      <div style={analyticsGridStyle}>
        <MetricPanel
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Completed tasks compared to total assigned tasks."
          progress={completionRate}
          tone="success"
        />

        <MetricPanel
          title="Active Workload"
          value={`${activeWorkloadRate}%`}
          description="Open and in-progress work compared to total tasks."
          progress={activeWorkloadRate}
          tone="info"
        />

        <MetricPanel
          title="Incident Load"
          value={activeIncidents}
          description="Active incidents currently owned by this user."
          progress={
            ownedIncidents === 0 ? 0 : (activeIncidents / ownedIncidents) * 100
          }
          tone="warning"
        />
      </div>

      <div style={bottomGridStyle}>
        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Operational Summary</h2>
          <p style={panelSubtitleStyle}>
            A quick management view of the user’s current contribution and
            workload condition.
          </p>

          <div style={summaryListStyle}>
            <SummaryRow label="Assigned work items" value={totalTasks} />
            <SummaryRow label="Completed work items" value={completedTasks} />
            <SummaryRow
              label="Currently active tasks"
              value={openTasks + inProgressTasks}
            />
            <SummaryRow
              label="Overdue tasks"
              value={overdueTasks}
              danger={overdueTasks > 0}
            />
            <SummaryRow label="Owned incidents" value={ownedIncidents} />
            <SummaryRow label="Active incidents" value={activeIncidents} />
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Management Recommendation</h2>
          <p style={panelSubtitleStyle}>
            Suggested action based on task completion, incident load, and active
            workload.
          </p>

          <div style={recommendationBoxStyle(assessment.tone)}>
            <h3 style={recommendationTitleStyle}>{assessment.label}</h3>
            <p style={recommendationTextStyle}>{assessment.message}</p>
          </div>

          <div style={checklistStyle}>
            <ChecklistItem good={overdueTasks === 0} text="No overdue tasks" />
            <ChecklistItem
              good={completionRate >= 50}
              text="Healthy completion rate"
            />
            <ChecklistItem
              good={activeWorkloadRate <= 70}
              text="Manageable workload"
            />
            <ChecklistItem
              good={activeIncidents <= 3}
              text="Incident ownership under control"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, tone }) {
  return (
    <div style={kpiCardStyle}>
      <p style={kpiLabelStyle}>{label}</p>
      <h3 style={{ ...kpiValueStyle, color: getToneColor(tone) }}>{value}</h3>
    </div>
  );
}

function MetricPanel({ title, value, description, progress, tone }) {
  const safeProgress = Math.max(0, Math.min(Number(progress) || 0, 100));

  return (
    <div style={panelStyle}>
      <p style={cardLabelStyle}>{title}</p>
      <h2 style={metricValueStyle}>{value}</h2>
      <p style={mutedStyle}>{description}</p>

      <div style={progressTrackStyle}>
        <div
          style={{
            ...progressFillStyle,
            width: `${safeProgress}%`,
            background: getToneGradient(tone),
          }}
        />
      </div>
    </div>
  );
}

function SummaryRow({ label, value, danger }) {
  return (
    <div style={summaryRowStyle}>
      <span>{label}</span>
      <strong style={{ color: danger ? "#b91c1c" : "#111827" }}>{value}</strong>
    </div>
  );
}

function ChecklistItem({ good, text }) {
  return (
    <div style={checkItemStyle}>
      <span style={good ? checkGoodStyle : checkBadStyle}>
        {good ? "✓" : "!"}
      </span>
      <span>{text}</span>
    </div>
  );
}

function getToneColor(tone) {
  if (tone === "success") return "#15803d";
  if (tone === "warning") return "#b45309";
  if (tone === "danger") return "#b91c1c";
  if (tone === "info") return "#1d4ed8";
  return "#111827";
}

function getToneGradient(tone) {
  if (tone === "success") return "linear-gradient(90deg, #16a34a, #22c55e)";
  if (tone === "warning") return "linear-gradient(90deg, #d97706, #f59e0b)";
  if (tone === "danger") return "linear-gradient(90deg, #dc2626, #ef4444)";
  return "linear-gradient(90deg, #2563eb, #7c3aed)";
}

const pageStyle = {
  maxWidth: "1280px",
  margin: "0 auto",
  paddingBottom: "40px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  alignItems: "flex-start",
  marginBottom: "26px",
};

const eyebrowStyle = {
  margin: 0,
  color: "#2563eb",
  fontSize: "13px",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const titleStyle = {
  margin: "6px 0 0",
  fontSize: "42px",
  fontWeight: "900",
  color: "#111827",
};

const subtitleStyle = {
  marginTop: "8px",
  color: "#6b7280",
  fontSize: "15px",
};

const roleRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginTop: "14px",
};

const roleBadgeStyle = {
  padding: "7px 11px",
  borderRadius: "999px",
  backgroundColor: "#eef2ff",
  color: "#3730a3",
  fontSize: "12px",
  fontWeight: "900",
};

const backButtonStyle = {
  padding: "12px 18px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#111827",
  fontWeight: "900",
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
};

const heroGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr",
  gap: "20px",
  marginBottom: "20px",
};

const profileCardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "24px",
  padding: "28px",
  display: "flex",
  alignItems: "center",
  gap: "22px",
  boxShadow: "0 20px 50px rgba(15,23,42,0.09)",
};

const avatarStyle = {
  width: "90px",
  height: "90px",
  borderRadius: "26px",
  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "38px",
  fontWeight: "900",
  flexShrink: 0,
};

const cardLabelStyle = {
  margin: 0,
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: "900",
};

const scoreTextStyle = {
  margin: "8px 0 0",
  fontSize: "42px",
  color: "#111827",
  fontWeight: "900",
};

const mutedStyle = {
  marginTop: "8px",
  color: "#6b7280",
  lineHeight: 1.55,
  fontSize: "14px",
};

const assessmentCardStyle = (tone) => {
  const map = {
    success: ["#ecfdf5", "#166534", "#bbf7d0"],
    warning: ["#fffbeb", "#92400e", "#fde68a"],
    danger: ["#fef2f2", "#991b1b", "#fecaca"],
    info: ["#eff6ff", "#1d4ed8", "#bfdbfe"],
    neutral: ["#f9fafb", "#374151", "#e5e7eb"],
  };

  const [background, color, border] = map[tone] || map.info;

  return {
    backgroundColor: background,
    color,
    border: `1px solid ${border}`,
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 20px 50px rgba(15,23,42,0.07)",
  };
};

const assessmentSmallStyle = {
  margin: 0,
  fontSize: "13px",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const assessmentTitleStyle = {
  margin: "10px 0 0",
  fontSize: "28px",
  fontWeight: "900",
};

const assessmentMessageStyle = {
  marginTop: "10px",
  lineHeight: 1.6,
  fontWeight: "600",
};

const kpiGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "14px",
  marginBottom: "20px",
};

const kpiCardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 14px 32px rgba(15,23,42,0.06)",
};

const kpiLabelStyle = {
  margin: 0,
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: "900",
};

const kpiValueStyle = {
  margin: "10px 0 0",
  fontSize: "32px",
  fontWeight: "900",
};

const analyticsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
  marginBottom: "20px",
};

const panelStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "22px",
  padding: "24px",
  boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
};

const metricValueStyle = {
  margin: "8px 0 0",
  fontSize: "36px",
  fontWeight: "900",
  color: "#111827",
};

const progressTrackStyle = {
  height: "10px",
  backgroundColor: "#e5e7eb",
  borderRadius: "999px",
  overflow: "hidden",
  marginTop: "18px",
};

const progressFillStyle = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(90deg, #2563eb, #7c3aed)",
};

const bottomGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.15fr 1fr",
  gap: "20px",
};

const panelTitleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: "900",
  color: "#111827",
};

const panelSubtitleStyle = {
  marginTop: "8px",
  color: "#6b7280",
  lineHeight: 1.55,
  fontSize: "14px",
};

const summaryListStyle = {
  marginTop: "18px",
  display: "grid",
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "14px 0",
  borderBottom: "1px solid #e5e7eb",
  color: "#374151",
};

const recommendationBoxStyle = (tone) => assessmentCardStyle(tone);

const recommendationTitleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "900",
};

const recommendationTextStyle = {
  marginTop: "8px",
  lineHeight: 1.6,
  fontWeight: "600",
};

const checklistStyle = {
  display: "grid",
  gap: "12px",
  marginTop: "18px",
};

const checkItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#374151",
  fontWeight: "800",
};

const checkGoodStyle = {
  width: "24px",
  height: "24px",
  borderRadius: "999px",
  backgroundColor: "#dcfce7",
  color: "#166534",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
};

const checkBadStyle = {
  width: "24px",
  height: "24px",
  borderRadius: "999px",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
};

const loadingCardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "20px",
  padding: "28px",
  fontWeight: "900",
  color: "#111827",
};

const errorStyle = {
  marginTop: "16px",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  borderRadius: "14px",
  padding: "16px",
  fontWeight: "900",
};

const emptyStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "24px",
  color: "#6b7280",
  fontWeight: "900",
};

export default UserPerformancePage;