import { useState } from "react";

export default function UpdateModal({ incidentId, onClose, onSubmit }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;

    onSubmit({
      incidentId,
      text,
    });

    setText("");
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Add Incident Update</h3>

        <textarea
          placeholder="Describe what you observed, actions taken, or updates..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.textarea}
        />

        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancel}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={styles.submit}>
            Submit Update
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
  },
  textarea: {
    width: "100%",
    height: "120px",
    marginTop: "10px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "15px",
  },
  cancel: {
    marginRight: "10px",
  },
  submit: {
    background: "#2563eb",
    color: "#fff",
  },
};