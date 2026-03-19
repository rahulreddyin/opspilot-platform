import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1/auth";

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/login`, credentials);
  return response.data;
};