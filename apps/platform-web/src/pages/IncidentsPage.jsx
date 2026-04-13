import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createIncident,
  getMyIncidents,
  updateIncidentStatus,
} from "../api/IncidentAPI";
import { logout } from "../utils/auth";

function IncidentsPage() {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [incidentError, setIncidentError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "HIGH",
    impactedService: "",
    ownerEmail: "",
  });

  const [creatingIncident, setCreatingIncident] = useState(false);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 2500);
  };

  const loadIncidents = async () => {
    try {
      setLoadingIncidents(true);
      setIncidentError("");
      const data = await getMyIncidents();
      setIncidents(data);
    } catch (error) {
      console.log("LOAD INCIDENTS ERROR:", error);
      setIncidentError("Failed to load incidents.");
    } finally {
      setLoadingIncidents(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.impactedService.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : incident.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [incidents, searchTerm, statusFilter]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    setIncidentError("");
    setCreatingIncident(true);

    try {
      await createIncident(formData);
      showSuccess("Incident created successfully.");
      setFormData({
        title: "",
        description: "",
        severity: "HIGH",
        impactedService: "",
        ownerEmail: "",
      });
      await loadIncidents();
    } catch (error) {
      console.log("CREATE INCIDENT ERROR:", error);
      setIncidentError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create incident."
      );
    } finally {
      setCreatingIncident(false);
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      setIncidentError("");
      await updateIncidentStatus(incidentId, newStatus);
      showSuccess("Incident status updated.");
      await loadIncidents();
    } catch (error) {
      console.log("UPDATE INCIDENT STATUS ERROR:", error);
      setIncidentError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update incident status."
      );
    }
  };

  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter((i) => i.status === "OPEN").length;
  const investigatingIncidents = incidents.filter(
    (i) => i.status === "INVESTIGATING"
  ).length;
  const resolvedIncidents = incidents.filter((i) => i.status === "RESOLVED").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "32px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "700",
                margin: 0,
                color: "#111827",
              }}
            >
              Incident Management
            </h1>
            <p
              style={{
                marginTop: "8px",
                color: "#4b5563",
                fontSize: "15px",
              }}
            >
              Track outages, service degradation, and operational issues.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Link to="/dashboard" style={navButtonStyle}>
              Back to Dashboard
            </Link>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              Logout
            </button>
          </div>
        </div>

        {successMessage && <Toast message={successMessage} type="success" />}
        {incidentError && <Toast message={incidentError} type="error" />}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <StatCard label="Total Incidents" value={totalIncidents} />
          <StatCard label="Open" value={openIncidents} />
          <StatCard label="Investigating" value={investigatingIncidents} />
          <StatCard label="Resolved" value={resolvedIncidents} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#111827",
              }}
            >
              Create Incident
            </h2>

            <form onSubmit={handleCreateIncident}>
              <input
                type="text"
                name="title"
                placeholder="Incident title"
                value={formData.title}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <textarea
                name="description"
                placeholder="Incident description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />

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
                placeholder="Impacted service (e.g. payment-service)"
                value={formData.impactedService}
                onChange={handleChange}
                required
                style={inputStyle}
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

              <button
                type="submit"
                disabled={creatingIncident}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: creatingIncident ? "#93c5fd" : "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: creatingIncident ? "not-allowed" : "pointer",
                }}
              >
                {creatingIncident ? "Creating Incident..." : "Create Incident"}
              </button>
            </form>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                My Incidents
              </h2>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    minWidth: "220px",
                  }}
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">OPEN</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>
            </div>

            {loadingIncidents ? (
              <p style={{ color: "#4b5563" }}>Loading incidents...</p>
            ) : filteredIncidents.length === 0 ? (
              <p style={{ color: "#4b5563" }}>No matching incidents found.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >
                {filteredIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "18px",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            color: "#111827",
                          }}
                        >
                          {incident.title}
                        </h3>
                        <p
                          style={{
                            marginTop: "8px",
                            marginBottom: "12px",
                            color: "#4b5563",
                          }}
                        >
                          {incident.description}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Badge label={incident.status} />
                        <Badge label={incident.severity} />
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "14px",
                        color: "#374151",
                        display: "grid",
                        gap: "6px",
                        marginBottom: "14px",
                      }}
                    >
                      <span>
                        <strong>Impacted Service:</strong> {incident.impactedService}
                      </span>
                      <span>
                        <strong>Owner:</strong> {incident.ownerEmail}
                      </span>
                      <span>
                        <strong>Created At:</strong> {incident.createdAt}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => handleStatusChange(incident.id, "OPEN")}
                        style={secondaryButtonStyle}
                      >
                        OPEN
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(incident.id, "INVESTIGATING")
                        }
                        style={secondaryButtonStyle}
                      >
                        INVESTIGATING
                      </button>

                      <button
                        onClick={() => handleStatusChange(incident.id, "RESOLVED")}
                        style={secondaryButtonStyle}
                      >
                        RESOLVED
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        {label}
      </p>
      <h3
        style={{
          marginTop: "10px",
          marginBottom: 0,
          fontSize: "28px",
          color: "#111827",
        }}
      >
        {value}
      </h3>
    </div>
  );
}

function Badge({ label }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        fontSize: "12px",
        fontWeight: "700",
        borderRadius: "999px",
        backgroundColor: "#e0e7ff",
        color: "#3730a3",
      }}
    >
      {label}
    </span>
  );
}

function Toast({ message, type }) {
  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "14px 16px",
        borderRadius: "10px",
        fontWeight: "600",
        backgroundColor: type === "success" ? "#dcfce7" : "#fee2e2",
        color: type === "success" ? "#166534" : "#991b1b",
        border: type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
      }}
    >
      {message}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "16px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  boxSizing: "border-box",
};

const secondaryButtonStyle = {
  backgroundColor: "#eef2ff",
  color: "#1d4ed8",
  border: "1px solid #c7d2fe",
  padding: "10px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};

const navButtonStyle = {
  backgroundColor: "#2563eb",
  color: "#ffffff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
};

const logoutButtonStyle = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
};

export default IncidentsPage;