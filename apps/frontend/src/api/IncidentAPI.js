import apiClient from "./apiClient";

export const getMyIncidents = async () => {
  const response = await apiClient.get("/incidents/my");
  return response.data;
};

export const createIncident = async (incidentData) => {
  const response = await apiClient.post("/incidents", incidentData);
  return response.data;
};

export const updateIncidentStatus = async (incidentId, status) => {
  const response = await apiClient.patch(`/incidents/${incidentId}/status`, {
    status,
  });
  return response.data;
};