// Base API URL.
// - Local development: falls back to http://localhost:5011
// - Production (Netlify): set VITE_API_BASE_URL to the deployed backend URL
//   (e.g. https://job-portal-deploy.onrender.com) in the Netlify env settings.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5011";

export const USER_API_ENDPOINT = `${API_BASE_URL}/api/user`;
export const JOB_API_ENDPOINT = `${API_BASE_URL}/api/job`;
export const APPLICATION_API_ENDPOINT = `${API_BASE_URL}/api/application`;
export const COMPANY_API_ENDPOINT = `${API_BASE_URL}/api/company`;
