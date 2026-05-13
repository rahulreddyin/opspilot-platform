import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1/auth";

export const loginUser = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/login`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export const startRegistration = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/register`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export const verifyRegistrationOtp = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/register/verify-otp`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export const resendRegistrationOtp = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/register/resend-otp`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
};