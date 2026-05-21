import axios from "axios";
import { getToken } from "../utils/auth";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const getIncidentTimeline = async (incidentId) => {
  const response = await axios.get(
    `http://98.94.8.79:8080/api/v1/incidents/${incidentId}/timeline`,
    {
      headers: authHeaders(),
    }
  );
  return response.data;
};

export const getTaskTimeline = async (taskId) => {
  const response = await axios.get(
    `http://98.94.8.79:8080/api/v1/tasks/${taskId}/timeline`,
    {
      headers: authHeaders(),
    }
  );
  return response.data;
};