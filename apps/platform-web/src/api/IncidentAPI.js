import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE_URL = "http://localhost:8080/api/v1/incidents";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const getMyIncidents = async () => {
  const response = await axios.get(`${API_BASE_URL}/my`, {
    headers: authHeaders(),
  });
  return response.data;
};

export const createIncident = async (incidentData) => {
  const response = await axios.post(API_BASE_URL, incidentData, {
    headers: authHeaders(),
  });
  return response.data;
};

export const updateIncidentStatus = async (incidentId, status) => {
  const response = await axios.patch(
    `${API_BASE_URL}/${incidentId}/status`,
    { status },
    {
      headers: authHeaders(),
    }
  );
  return response.data;
};