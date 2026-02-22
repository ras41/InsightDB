import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// ─── Connections ─────────────────────────────────────────
export const connectionAPI = {
  getAll: () => api.get("/connections"),
  getById: (id) => api.get(`/connections/${id}`),
  create: (data) => api.post("/connections", data),
  update: (id, data) => api.put(`/connections/${id}`, data),
  delete: (id) => api.delete(`/connections/${id}`),
  test: (data) => api.post("/connections/test", data),
};

// ─── Explorer ────────────────────────────────────────────
export const explorerAPI = {
  getSchemas: (connId) => api.get(`/explorer/${connId}/schemas`),
  getTables: (connId) => api.get(`/explorer/${connId}/tables`),
  getViews: (connId) => api.get(`/explorer/${connId}/views`),
  getFunctions: (connId) => api.get(`/explorer/${connId}/functions`),
  getColumns: (connId, table) =>
    api.get(`/explorer/${connId}/tables/${table}/columns`),
  getStats: (connId, table) =>
    api.get(`/explorer/${connId}/tables/${table}/stats`),
  getData: (connId, table, params) =>
    api.get(`/explorer/${connId}/tables/${table}/data`, { params }),
};

// ─── Queries ─────────────────────────────────────────────
export const queryAPI = {
  execute: (data) => api.post("/queries/execute", data),
  getHistory: (params) => api.get("/queries/history", { params }),
  toggleSave: (id) => api.put(`/queries/${id}/toggle-save`),
};

// ─── Insights ────────────────────────────────────────────
export const insightsAPI = {
  getOverview: (connId) => api.get(`/insights/${connId}/overview`),
  getAutoInsights: (connId) => api.get(`/insights/${connId}/auto`),
  getTableInsights: (connId, table) =>
    api.get(`/insights/${connId}/tables/${table}`),
};

// ─── AI Chat ─────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (data) => api.post("/chat/message", data),
  getSessions: () => api.get("/chat/sessions"),
  getHistory: (sessionId) => api.get(`/chat/sessions/${sessionId}`),
  deleteSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}`),
};

// ─── Security ────────────────────────────────────────────
export const securityAPI = {
  getApiKeys: () => api.get("/security/api-keys"),
  createApiKey: (data) => api.post("/security/api-keys", data),
  revokeApiKey: (id) => api.delete(`/security/api-keys/${id}`),
  toggle2FA: () => api.put("/security/2fa/toggle"),
  getAuditLogs: (params) => api.get("/security/audit-logs", { params }),
  getSessions: () => api.get("/security/sessions"),
  requestDataErasure: () => api.post("/security/data-erasure"),
};

// ─── Profile ─────────────────────────────────────────────
export const profileAPI = {
  get: () => api.get("/profile"),
  update: (data) => api.put("/profile", data),
  updateEmail: (data) => api.put("/profile/email", data),
  deactivate: () => api.put("/profile/deactivate"),
};

// ─── Settings ────────────────────────────────────────────
export const settingsAPI = {
  getAll: () => api.get("/settings"),
  update: (key, value) => api.put("/settings", { key, value }),
  bulkUpdate: (data) => api.put("/settings/bulk", data),
  reset: () => api.post("/settings/reset"),
};

export default api;
