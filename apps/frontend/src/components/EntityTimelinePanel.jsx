import { useEffect, useState } from "react";
import { getIncidentTimeline, getTaskTimeline } from "../api/timelineApi";

function EntityTimelinePanel({ entityType, entityId, title = "Timeline" }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTimeline = async () => {
    if (!entityId) return;

    try {
      setLoading(true);
      setError("");

      const data =
        entityType === "INCIDENT"
          ? await getIncidentTimeline(entityId)
          : await getTaskTimeline(entityId);

      setEntries(data);
    } catch (err) {
      console.error("LOAD TIMELINE ERROR:", err);
      setError("Failed to load timeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [entityType, entityId]);

  return (
    <div style={panelStyle}>
      <h3 style={headingStyle}>{title}</h3>

      {error && <div style={errorStyle}>{error}</div>}

      {loading ? (
        <p style={mutedTextStyle}>Loading timeline...</p>
      ) : entries.length === 0 ? (
        <p style={mutedTextStyle}>No timeline activity yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {entries.map((entry, index) => (
            <div key={`${entry.createdAt}-${index}`} style={entryCardStyle}>
              <div style={entryTopStyle}>
                <span
                  style={{
                    ...badgeStyle,
                    backgroundColor:
                      entry.type === "COMMENT" ? "#dcfce7" : "#e0e7ff",
                    color: entry.type === "COMMENT" ? "#166534" : "#3730a3",
                  }}
                >
                  {entry.type}
                </span>

                <span style={timestampStyle}>{formatTimestamp(entry.createdAt)}</span>
              </div>

              <div style={messageStyle}>{entry.message}</div>

              <div style={actorStyle}>{entry.actorEmail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

const panelStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
};

const headingStyle = {
  marginTop: 0,
  marginBottom: "16px",
  color: "#111827",
};

const mutedTextStyle = {
  color: "#6b7280",
  margin: 0,
};

const entryCardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "12px",
  backgroundColor: "#f9fafb",
};

const entryTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "8px",
};

const badgeStyle = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "700",
};

const timestampStyle = {
  fontSize: "12px",
  color: "#6b7280",
};

const messageStyle = {
  fontWeight: "600",
  color: "#111827",
  marginBottom: "6px",
};

const actorStyle = {
  fontSize: "13px",
  color: "#4b5563",
};

const errorStyle = {
  marginBottom: "12px",
  padding: "12px 14px",
  borderRadius: "8px",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  fontWeight: "600",
};

export default EntityTimelinePanel;