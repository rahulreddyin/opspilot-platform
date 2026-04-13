import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE_URL = "http://localhost:8080/api/v1/tasks";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const getMyTasks = async () => {
  const response = await axios.get(`${API_BASE_URL}/my`, {
    headers: authHeaders(),
  });
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axios.post(API_BASE_URL, taskData, {
    headers: authHeaders(),
  });
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await axios.put(`${API_BASE_URL}/${taskId}`, taskData, {
    headers: authHeaders(),
  });
  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await axios.patch(
    `${API_BASE_URL}/${taskId}/status`,
    { status },
    {
      headers: authHeaders(),
    }
  );
  return response.data;
};

export const deleteTask = async (taskId) => {
  await axios.delete(`${API_BASE_URL}/${taskId}`, {
    headers: authHeaders(),
  });
};