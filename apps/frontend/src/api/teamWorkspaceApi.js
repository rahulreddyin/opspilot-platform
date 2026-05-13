import apiClient from "./apiClient";

export const getMyTeamWorkspace = async () => {
  const response = await apiClient.get("/team-workspace");
  return response.data;
};

export const createTeamWorkspaceTask = async (taskData) => {
  const response = await apiClient.post("/team-workspace/tasks", taskData);
  return response.data;
};