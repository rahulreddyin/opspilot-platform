import { useEffect, useMemo, useState } from "react";
import EntityCommentsPanel from "../components/EntityCommentsPanel";
import EntityTimelinePanel from "../components/EntityTimelinePanel";
import useLiveOpsUpdates from "../hooks/useLiveOpsUpdates";
import {
  createIncident,
  getMyIncidents,
  updateIncidentStatus,
} from "../api/IncidentAPI";

function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "HIGH",
    ownerEmail: "",
    impactedService: "",
  });

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyIncidents();
      const safeData = Array.isArray(data) ? data : [];

      setIncidents(safeData);

      if (safeData.length > 0) {
        setSelectedIncidentId((prev) => {
          const stillExists = safeData.some(
            (incident) => Number(incident.id) === Number(prev)
          );
          return stillExists ? prev : safeData[0].id;
        });
      } else {
        setSelectedIncidentId(null);
      }
    } catch (err) {
      console.error("LOAD INCIDENTS ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load incidents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  useLiveOpsUpdates({
    onIncidentCreated: (newIncident) => {
      setIncidents((prev) => {
        const incomingId = newIncident.incidentId ?? newIncident.id;

        const exists = prev.some(
          (incident) => Number(incident.id) === Number(incomingId)
        );

        if (exists) return prev;

        const nextIncident = {
          id: incomingId,
          title: newIncident.title,
          description: newIncident.description,
          severity: newIncident.severity,
          status: newIncident.status,
          ownerEmail: newIncident.ownerEmail,
          impactedService: newIncident.impactedService,
          createdAt: newIncident.createdAt,
        };

        setSelectedIncidentId((current) => current ?? incomingId);
        return [nextIncident, ...prev];
      });
    },

    onIncidentStatusUpdated: (updatedIncident) => {
      setIncidents((prev) =>
        prev.map((incident) =>
          Number(incident.id) === Number(updatedIncident.incidentId)
            ? { ...incident, status: updatedIncident.status }
            : incident
        )
      );
    },
  });

  const selectedIncident =
    incidents.find((incident) => Number(incident.id) === Number(selectedIncidentId)) ||
    null;

  const filteredIncidents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return incidents.filter((incident) => {
      const matchesSearch =
        !term ||
        (incident.title || "").toLowerCase().includes(term) ||
        (incident.description || "").toLowerCase().includes(term) ||
        (incident.ownerEmail || "").toLowerCase().includes(term) ||
        (incident.impactedService || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "ALL" ? true : incident.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [incidents, searchTerm, statusFilter]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();

    try {
      setLoadingCreate(true);
      setError("");

      const saved = await createIncident({
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        ownerEmail: formData.ownerEmail.trim(),
        impactedService: formData.impactedService.trim(),
      });

      setIncidents((prev) => {
        const exists = prev.some(
          (incident) => Number(incident.id) === Number(saved.id)
        );

        if (exists) return prev;

        return [saved, ...prev];
      });

      setSelectedIncidentId(saved.id);

      setFormData({
        title: "",
        description: "",
        severity: "HIGH",
        ownerEmail: "",
        impactedService: "",
      });

      showSuccess("Incident created successfully.");
    } catch (err) {
      console.error("CREATE INCIDENT ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create incident."
      );
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      setError("");

      const updated = await updateIncidentStatus(incidentId, newStatus);

      setIncidents((prev) =>
        prev.map((incident) =>
          Number(incident.id) === Number(incidentId) ? updated : incident
        )
      );

      showSuccess("Incident status updated.");
    } catch (err) {
      console.error("UPDATE INCIDENT STATUS ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update incident status."
      );
    }
  };

  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(
    (incident) => incident.status === "OPEN"
  ).length;
  const investigatingIncidents = incidents.filter(
    (incident) => incident.status === "INVESTIGATING"
  ).length;
  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "RESOLVED"
  ).length;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Incident Management</h1>
          <p style={subtitleStyle}>
            Track outages, assign ownership, monitor status, and collaborate on
            resolution.
          </p>
        </div>
      </div>

      {successMessage && <Toast message={successMessage} type="success" />}
      {error && <Toast message={error} type="error" />}

      <div style={statsGridStyle}>
        <StatCard label="Total Incidents" value={totalIncidents} />
        <StatCard label="Open" value={openIncidents} />
        <StatCard label="Investigating" value={investigatingIncidents} />
        <StatCard label="Resolved" value={resolvedIncidents} />
      </div>

      <div style={mainGridStyle}>
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Create Incident</h2>
          <p style={sectionSubtitleStyle}>
            Log a production issue and assign the responsible owner.
          </p>

          <form onSubmit={handleCreateIncident}>
            <input
              type="text"
              name="title"
              placeholder="Example: Payment service outage"
              value={formData.title}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <textarea
              name="description"
              placeholder="Describe what is impacted, who is affected, and what symptoms are visible."
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <input
              type="email"
              name="ownerEmail"
              placeholder="Owner email"
              value={formData.ownerEmail}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <div style={twoColStyle}>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>

              <input
                type="text"
                name="impactedService"
                placeholder="Impacted service"
                value={formData.impactedService}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loadingCreate}
              style={{
                ...primaryButtonStyle,
                opacity: loadingCreate ? 0.7 : 1,
                cursor: loadingCreate ? "not-allowed" : "pointer",
              }}
            >
              {loadingCreate ? "Creating Incident..." : "Create Incident"}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <div style={listHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Incidents</h2>
              <p style={sectionSubtitleStyle}>
                Search, filter, and select an incident.
              </p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          {loading ? (
            <p style={mutedTextStyle}>Loading incidents...</p>
          ) : filteredIncidents.length === 0 ? (
            <p style={mutedTextStyle}>No incidents found.</p>
          ) : (
            <div style={incidentListStyle}>
              {filteredIncidents.map((incident, index) => (
                <button
                  key={`${incident.id}-${index}`}
                  type="button"
                  onClick={() => setSelectedIncidentId(incident.id)}
                  style={{
                    ...incidentCardButtonStyle,
                    border:
                      Number(selectedIncidentId) === Number(incident.id)
                        ? "2px solid #2563eb"
                        : "1px solid #e5e7eb",
                    backgroundColor:
                      Number(selectedIncidentId) === Number(incident.id)
                        ? "#eff6ff"
                        : "#ffffff",
                  }}
                >
                  <div style={incidentCardTopStyle}>
                    <div>
                      <div style={incidentTitleStyle}>{incident.title}</div>
                      <div style={incidentDescriptionStyle}>
                        {incident.description}
                      </div>
                    </div>
                  </div>

                  <div style={badgeRowStyle}>
                    <Badge label={incident.status} />
                    <Badge label={incident.severity} />
                  </div>

                  <div style={incidentMetaStyle}>
                    Owner: {incident.ownerEmail || "N/A"}
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIncidentId(incident.id);
                      setCommentModalOpen(true);
                    }}
                    style={commentButtonStyle}
                  >
                    Comment
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={detailsColumnStyle}>
          {selectedIncident ? (
            <>
              <div style={cardStyle}>
                <div style={detailsHeaderStyle}>
                  <div>
                    <div style={badgeRowStyle}>
                      <Badge label={`#${selectedIncident.id}`} />
                      <Badge label={selectedIncident.status} />
                      <Badge label={selectedIncident.severity} />
                    </div>

                    <h2 style={detailsTitleStyle}>{selectedIncident.title}</h2>

                    <p style={detailsDescriptionStyle}>
                      {selectedIncident.description}
                    </p>
                  </div>
                </div>

                <div style={statusActionsStyle}>
                  <button
                    onClick={() =>
                      handleStatusChange(selectedIncident.id, "OPEN")
                    }
                    style={secondaryButtonStyle}
                  >
                    OPEN
                  </button>

                  <button
                    onClick={() =>
                      handleStatusChange(selectedIncident.id, "INVESTIGATING")
                    }
                    style={secondaryButtonStyle}
                  >
                    INVESTIGATING
                  </button>

                  <button
                    onClick={() =>
                      handleStatusChange(selectedIncident.id, "RESOLVED")
                    }
                    style={secondaryButtonStyle}
                  >
                    RESOLVED
                  </button>

                  <button
                    onClick={() => setCommentModalOpen(true)}
                    style={commentOutlineButtonStyle}
                  >
                    Comment
                  </button>
                </div>

                <div style={infoGridStyle}>
                  <InfoCard label="Owner" value={selectedIncident.ownerEmail} />
                  <InfoCard
                    label="Impacted Service"
                    value={selectedIncident.impactedService}
                  />
                  <InfoCard
                    label="Created At"
                    value={formatTimestamp(selectedIncident.createdAt)}
                  />
                </div>
              </div>

              <div style={timelineWrapperStyle}>
                <EntityTimelinePanel
                  entityType="INCIDENT"
                  entityId={selectedIncident.id}
                  title={`Incident Timeline • #${selectedIncident.id}`}
                />
              </div>
            </>
          ) : (
            <div style={cardStyle}>
              <p style={mutedTextStyle}>
                Select an incident to view details and timeline.
              </p>
            </div>
          )}
        </div>
      </div>

      {commentModalOpen && selectedIncident && (
        <div
          style={modalOverlayStyle}
          onClick={() => setCommentModalOpen(false)}
        >
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <h2 style={modalTitleStyle}>Comment on Incident</h2>
                <p style={modalSubtitleStyle}>
                  #{selectedIncident.id} • {selectedIncident.title}
                </p>
              </div>

              <button
                onClick={() => setCommentModalOpen(false)}
                style={closeButtonStyle}
              >
                ✕
              </button>
            </div>

            <EntityCommentsPanel
              entityType="INCIDENT"
              entityId={selectedIncident.id}
              title={`Incident Comments • #${selectedIncident.id}`}
            />
          </div>
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

function StatCard({ label, value }) {
  return (
    <div style={statCardStyle}>
      <p style={statLabelStyle}>{label}</p>
      <h3 style={statValueStyle}>{value}</h3>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div style={infoCardStyle}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={infoValueStyle}>{value || "N/A"}</div>
    </div>
  );
}

function Badge({ label }) {
  return <span style={badgeStyle}>{label || "N/A"}</span>;
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
  maxWidth: "1500px",
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
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
  fontSize: "30px",
  color: "#111827",
  fontWeight: "800",
};

const mainGridStyle = {
  display: "grid",
  gridTemplateColumns: "340px 420px minmax(0, 1fr)",
  gap: "24px",
  alignItems: "start",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "14px",
  padding: "22px",
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

const twoColStyle = {
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
  fontWeight: "800",
};

const listHeaderStyle = {
  marginBottom: "12px",
};

const mutedTextStyle = {
  color: "#6b7280",
  margin: 0,
};

const incidentListStyle = {
  display: "grid",
  gap: "12px",
  maxHeight: "620px",
  overflowY: "auto",
  paddingRight: "6px",
};

const incidentCardButtonStyle = {
  width: "100%",
  textAlign: "left",
  borderRadius: "14px",
  padding: "16px",
  cursor: "pointer",
};

const incidentCardTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
};

const incidentTitleStyle = {
  fontWeight: "800",
  color: "#111827",
  fontSize: "15px",
  marginBottom: "6px",
};

const incidentDescriptionStyle = {
  color: "#4b5563",
  fontSize: "13px",
  lineHeight: 1.45,
  marginBottom: "12px",
};

const badgeRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginBottom: "10px",
};

const badgeStyle = {
  display: "inline-block",
  padding: "6px 10px",
  fontSize: "12px",
  fontWeight: "800",
  borderRadius: "999px",
  backgroundColor: "#e0e7ff",
  color: "#3730a3",
};

const incidentMetaStyle = {
  color: "#6b7280",
  fontSize: "12px",
  marginBottom: "12px",
};

const commentButtonStyle = {
  display: "inline-block",
  backgroundColor: "#ecfeff",
  color: "#0f766e",
  border: "1px solid #a5f3fc",
  padding: "9px 12px",
  borderRadius: "8px",
  fontWeight: "800",
  fontSize: "13px",
};

const detailsColumnStyle = {
  display: "grid",
  gap: "24px",
};

const detailsHeaderStyle = {
  marginBottom: "14px",
};

const detailsTitleStyle = {
  margin: "6px 0 10px 0",
  fontSize: "28px",
  color: "#111827",
  fontWeight: "800",
};

const detailsDescriptionStyle = {
  margin: 0,
  color: "#4b5563",
  lineHeight: 1.6,
  fontSize: "15px",
};

const statusActionsStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const secondaryButtonStyle = {
  backgroundColor: "#eef2ff",
  color: "#1d4ed8",
  border: "1px solid #c7d2fe",
  padding: "10px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "800",
};

const commentOutlineButtonStyle = {
  backgroundColor: "#ecfeff",
  color: "#0f766e",
  border: "1px solid #a5f3fc",
  padding: "10px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "800",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "14px",
};

const infoCardStyle = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "14px",
};

const infoLabelStyle = {
  fontSize: "12px",
  color: "#6b7280",
  marginBottom: "6px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const infoValueStyle = {
  color: "#111827",
  fontWeight: "700",
  wordBreak: "break-word",
};

const timelineWrapperStyle = {
  maxHeight: "520px",
  overflowY: "auto",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  zIndex: 9999,
};

const modalContentStyle = {
  width: "100%",
  maxWidth: "900px",
  maxHeight: "90vh",
  overflowY: "auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "16px",
};

const modalTitleStyle = {
  margin: 0,
  color: "#111827",
  fontSize: "24px",
  fontWeight: "800",
};

const modalSubtitleStyle = {
  margin: "6px 0 0 0",
  color: "#6b7280",
};

const closeButtonStyle = {
  backgroundColor: "#f3f4f6",
  color: "#111827",
  border: "1px solid #d1d5db",
  width: "40px",
  height: "40px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "18px",
  fontWeight: "800",
};

export default IncidentsPage;