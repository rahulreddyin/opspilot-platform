import client from "./client";

export const createTask = async (payload) => {
  const response = await client.post("/api/v1/tasks", payload);
  return response.data;
};

export const getMyTasks = async () => {
  const response = await client.get("/api/v1/tasks/my");
  return response.data;
};