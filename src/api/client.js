import axios from "axios";

export const API_HOST = (
  import.meta.env.VITE_API_HOST || "https://fastapitweetbackend.vercel.app"
).replace(/\/$/, "");

const API_KEY = import.meta.env.VITE_API_KEY || "";
const API_KEY_HEADER = import.meta.env.VITE_API_KEY_HEADER || "x-api-key";

const client = axios.create({ baseURL: API_HOST });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("wire_token");
  if (token) config.headers.Authorization = `Bearer ${token}`; // user JWT// app API key
  return config;
});
const getclient = axios.create({ baseURL: API_HOST });
getclient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${API_KEY}`; 
  return config;
});
export function extractErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || "Something went wrong. Please try again.";
  const d = data.detail ?? data.message ?? data.Message;
  if (Array.isArray(d)) return d.map((x) => x.msg).join(", ");
  return d || "Something went wrong. Please try again.";
}

export default client ;
export {getclient};
