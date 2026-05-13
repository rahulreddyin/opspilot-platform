import apiClient from "./apiClient";

export const getMyTasks = async () => {
  const response = await apiClient.get("/tasks/my");
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await apiClient.post("/tasks", taskData);
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await apiClient.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await apiClient.patch(`/tasks/${taskId}/status`, { status });
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
};