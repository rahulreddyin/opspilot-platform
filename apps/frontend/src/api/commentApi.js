import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE_URL = "http://98.94.8.79:8080/api/v1";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const getIncidentComments = async (incidentId) => {
  const response = await axios.get(
    `${API_BASE_URL}/incidents/${incidentId}/comments`,
    {
      headers: authHeaders(),
    }
  );
  return response.data;
};

export const addIncidentComment = async (incidentId, payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/incidents/${incidentId}/comments`,
    payload,
    {
      headers: authHeaders(),
    }
  );
  return response.data;
};

export const getTaskComments = async (taskId) => {
  const response = await axios.get(
    `${API_BASE_URL}/tasks/${taskId}/comments`,
    {
      headers: authHeaders(),
    }
  );
  return response.data;
};

export const addTaskComment = async (taskId, payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/tasks/${taskId}/comments`,
    payload,
    {
      headers: authHeaders(),
    }
  );
  return response.data;
};