import axios from "axios";

const axiosConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
};

export const fetcher = axios.create(axiosConfig);
