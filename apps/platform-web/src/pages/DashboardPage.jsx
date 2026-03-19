import { useEffect, useState } from "react";
import { createTask, getMyTasks } from "../api/taskApi";
import { logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedToEmail: "",
  });
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      const data = await getMyTasks();
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks.");
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createTask(form);
      setForm({
        title: "",
        description: "",
        assignedToEmail: "",
      });
      loadTasks();
    } catch (err) {
      setError("Failed to create task.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>OpsPilot Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="card">
        <h2>Create Task</h2>

        <form onSubmit={handleCreate}>
          <input
            name="title"
            type="text"
            placeholder="Task title"
            value={form.title}
            onChange={handleChange}
          />

          <input
            name="description"
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <input
            name="assignedToEmail"
            type="email"
            placeholder="Assign to email"
            value={form.assignedToEmail}
            onChange={handleChange}
          />

          <button type="submit">Create Task</button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h2>My Tasks</h2>

        {tasks.length === 0 ? (
          <p>No tasks assigned yet.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <strong>{task.title}</strong>
                <p>{task.description}</p>
                <span>Status: {task.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}