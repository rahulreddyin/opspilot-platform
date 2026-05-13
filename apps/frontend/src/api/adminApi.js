import apiClient from "./apiClient";

export const getAllTeams = async () => {
  const response = await apiClient.get("/admin/teams");
  return response.data;
};

export const createTeam = async (teamData) => {
  const response = await apiClient.post("/admin/teams", teamData);
  return response.data;
};

export const deleteTeam = async (teamId) => {
  const response = await apiClient.delete(`/admin/teams/${teamId}`);
  return response.data;
};

export const getTeamDetails = async (teamId) => {
  const response = await apiClient.get(`/admin/teams/${teamId}`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await apiClient.get("/admin/users");
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/admin/users/${userId}`);
  return response.data;
};

export const assignUserToTeam = async (payload) => {
  const response = await apiClient.patch("/admin/teams/users", payload);
  return response.data;
};

export const bulkAssignUsersToTeam = async (payload) => {
  const response = await apiClient.patch("/admin/teams/users/bulk", {
    teamId: Number(payload.teamId),
    userIds: payload.userIds.map(Number),
  });
  return response.data;
};

export const removeUserFromTeam = async (userId) => {
  const response = await apiClient.patch(`/admin/teams/users/${userId}/remove`);
  return response.data;
};

export const addRoleToUser = async (payload) => {
  const response = await apiClient.patch("/admin/users/roles", payload);
  return response.data;
};

export const bulkAddRoleToUsers = async (payload) => {
  const response = await apiClient.patch("/admin/users/roles/bulk", {
    role: payload.role,
    userIds: payload.userIds.map(Number),
  });
  return response.data;
};

export const getUserPerformance = async (userId) => {
  const response = await apiClient.get(`/admin/users/${userId}/performance`);
  return response.data;
};

export const removeRoleFromUser = async (payload) => {
  const response = await apiClient.patch("/admin/users/roles/remove", payload);
  return response.data;
};