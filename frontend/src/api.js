import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API = axios.create({ baseURL: API_BASE_URL });

export const signup = (username, password) =>
  API.post("/signup", { username, password });

export const login = (username, password) =>
  API.post("/login", { username, password });

export const addPassword = (token, entry) =>
  API.post("/add", entry, { headers: { Authorization: `Bearer ${token}` } });

export const listPasswords = (token) =>
  API.get("/list", { headers: { Authorization: `Bearer ${token}` } });