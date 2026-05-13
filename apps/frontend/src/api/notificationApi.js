import apiClient from "./apiClient";

export const getUnreadNotificationCount = async () => {
  const response = await apiClient.get("/notifications/unread-count");
  return response.data;
};

export const getRecentNotifications = async () => {
  const response = await apiClient.get("/notifications/recent");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.patch("/notifications/read-all");
  return response.data;
};