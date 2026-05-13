import { useEffect, useMemo, useState } from "react";
import {
  addIncidentComment,
  addTaskComment,
  getIncidentComments,
  getTaskComments,
} from "../api/commentApi";

export default function EntityCommentsPanel({ entityType, entityId, title }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const isIncident = useMemo(() => entityType === "INCIDENT", [entityType]);

  const loadComments = async () => {
    if (!entityId || !entityType) return;

    try {
      setLoading(true);
      setError("");

      const data = isIncident
        ? await getIncidentComments(entityId)
        : await getTaskComments(entityId);

      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("LOAD COMMENTS ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load comments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [entityId, entityType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    try {
      setPosting(true);
      setError("");

      const payload = {
        content: text.trim(),
      };

      const saved = isIncident
        ? await addIncidentComment(entityId, payload)
        : await addTaskComment(entityId, payload);

      setComments((prev) => [saved, ...prev]);
      setText("");
    } catch (err) {
      console.error("ADD COMMENT ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to post comment."
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "14px",
          color: "#111827",
        }}
      >
        {title || "Comments"}
      </h3>

      {error && (
        <div
          style={{
            marginBottom: "12px",
            padding: "10px 12px",
            borderRadius: "8px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: "16px" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Add a ${entityType?.toLowerCase()} comment...`}
          rows={4}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            resize: "vertical",
            boxSizing: "border-box",
            marginBottom: "12px",
          }}
        />

        <button
          type="submit"
          disabled={posting || !text.trim()}
          style={{
            backgroundColor: posting || !text.trim() ? "#93c5fd" : "#2563eb",
            color: "#ffffff",
            border: "none",
            padding: "10px 14px",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: posting || !text.trim() ? "not-allowed" : "pointer",
          }}
        >
          {posting ? "Posting..." : "Post Comment"}
        </button>
      </form>

      {loading ? (
        <p style={{ color: "#6b7280", margin: 0 }}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p style={{ color: "#6b7280", margin: 0 }}>No comments yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "12px",
            maxHeight: "360px",
            overflowY: "auto",
          }}
        >
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "12px",
                backgroundColor: "#f9fafb",
              }}
            >
              <div
                style={{
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: "6px",
                  fontSize: "14px",
                }}
              >
                {comment.authorEmail || "Unknown user"}
              </div>

              <div
                style={{
                  color: "#374151",
                  lineHeight: 1.5,
                  marginBottom: "8px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {comment.content}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                {formatTimestamp(comment.createdAt)}
              </div>
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