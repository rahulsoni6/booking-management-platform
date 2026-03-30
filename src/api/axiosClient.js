import axios from "axios";
import logger from "../services/loggerService";

const BASE_URL =
  "https://dev.natureland.hipster-virtual.com/api/v1";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
Request Interceptor
Used for:
- attaching auth token
- logging outgoing requests
- handling Content-Type for FormData
*/

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData - let axios set it automatically
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    logger.info("API Request", {
      url: config.url,
      method: config.method,
      data: config.data,
    });

    return config;
  },
  (error) => {
    logger.error("Request Error", error);
    return Promise.reject(error);
  }
);

/*
Response Interceptor
Used for:
- logging responses
- handling errors globally
*/

axiosClient.interceptors.response.use(
  (response) => {
    logger.info("API Response", response.data);
    return response;
  },
  (error) => {
    logger.error("API Error", error);

    if (error.code === "ECONNABORTED") {
      alert("Request timeout. Please try again.");
    }

    if (error.response?.status === 401) {
      logger.warn("Unauthorized: token missing/expired. Redirecting to login.");
      localStorage.removeItem("token");
      alert("Session expired or missing authentication. Please login again.");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      alert("Access denied. Please contact administrator.");
    }

    if (error.response?.status === 500) {
      alert("Server error occurred.");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;