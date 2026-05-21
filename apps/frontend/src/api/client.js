import axios from "axios";

const client = axios.create({
  baseURL: "http://98.94.8.79:8080",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default client;