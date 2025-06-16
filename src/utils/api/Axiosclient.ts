import axios from "axios";
import { getLocalStorage, removeLocalStorage } from "../helpers/localStorageHelper";
import { LOCAL_STORAGE } from "../../Constants/STORAGE";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_URI,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getLocalStorage(LOCAL_STORAGE.TOKEN);
    const refreshToken = getLocalStorage("refreshToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (refreshToken && config.headers) {
      config.headers.Authorization = `Bearer ${refreshToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error?.response && error.response?.status === 401) ||
      error?.response?.status === 403
    ) {
      removeLocalStorage(LOCAL_STORAGE.TOKEN);
      removeLocalStorage(LOCAL_STORAGE.USER_ID);
      alert("Session expired. Please log in again.");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 