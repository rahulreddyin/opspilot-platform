import axios from "axios";
import { getToken } from "../utils/auth";

const BASE = "http://localhost:8080/api/v1/comments";

const headers = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const addUpdate = async (data) => {
  const res = await axios.post(BASE, data, { headers: headers() });
  return res.data;
};