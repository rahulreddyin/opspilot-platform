import apiClient from "./apiClient";

export const getRecentActivity = async () => {
  const response = await apiClient.get("/activity/recent");
  return response.data;
};