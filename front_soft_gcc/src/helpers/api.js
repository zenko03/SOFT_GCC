import axios from "axios";

const api = axios.create({
  //baseURL: "https://localhost:7082/api",
  baseURL: "http://151.80.218.41:5003/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;