import axios from "axios";

// We keep the JWT in localStorage and send it as an Authorization header.
// This makes auth work even across different domains (Netlify <-> Render),
// where third-party cookies are often blocked. The cookie still works locally.

export const setAuthToken = (token) => {
  if (!token) return;
  localStorage.setItem("token", token);
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  localStorage.removeItem("token");
  delete axios.defaults.headers.common["Authorization"];
};

// Call once on app startup so a logged-in user stays authenticated after refresh.
export const initAuthToken = () => {
  axios.defaults.withCredentials = true;
  const token = localStorage.getItem("token");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};
