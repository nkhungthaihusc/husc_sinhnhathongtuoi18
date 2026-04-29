import { apiClient } from './apiClient.js';

const unwrap = (response) => response?.data?.data ?? null;
const unwrapResponse = (response) => response?.data ?? null;
const withQuery = (url, query) => `${url}?query=${encodeURIComponent(query)}`;
const withParams = (url, params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

export const authApi = {
  login(payload) {
    return apiClient.post('/auth/login', payload).then(unwrap);
  },
  logout(refreshToken) {
    return apiClient.post('/auth/logout', { refreshToken }).then(unwrap);
  }
};

export const usersApi = {
  getAll() {
    return apiClient.get('/users').then(unwrap);
  },
  create(payload) {
    return apiClient.post('/users', payload).then(unwrap);
  },
  change(id, payload) {
    return apiClient.patch(`/users/${id}/change`, payload).then(unwrap);
  },
  leave(id) {
    return apiClient.patch(`/users/${id}/leave`, {}).then(unwrap);
  }
};

export const studentsApi = {
  getAll() {
    return apiClient.get('/students').then(unwrap);
  },
  search(query) {
    return apiClient.get(withQuery('/students/search', query)).then(unwrap);
  },
  updateInfo(id, payload) {
    return apiClient.patch(`/students/${id}/info`, payload).then(unwrap);
  }
};

export const programsApi = {
  getAll() {
    return apiClient.get('/blood-programs').then(unwrap);
  },
  getAllPaginated({ page = 1, limit = 9 } = {}) {
    return apiClient.get(withParams('/blood-programs', { page, limit })).then(unwrapResponse);
  },
  search(query) {
    return apiClient.get(withQuery('/blood-programs/search', query)).then(unwrap);
  },
  searchPaginated(query, { page = 1, limit = 9 } = {}) {
    return apiClient
      .get(withParams('/blood-programs/search', { query, page, limit }))
      .then(unwrapResponse);
  },
  statistic(id) {
    return apiClient.get(`/blood-programs/${id}/statistic`).then(unwrap);
  },
  create(payload) {
    return apiClient.post('/blood-programs', payload).then(unwrap);
  },
  update(id, payload) {
    return apiClient.patch(`/blood-programs/${id}`, payload).then(unwrap);
  },
  remove(id) {
    return apiClient.delete(`/blood-programs/${id}`).then(unwrap);
  }
};

export const registersApi = {
  getAll() {
    return apiClient.get('/blood-registers').then(unwrap);
  },
  search(query) {
    return apiClient.get(withQuery('/blood-registers/search', query)).then(unwrap);
  },
  searchPaginated(query, { page = 1, limit = 10 } = {}) {
    return apiClient
      .get(withParams('/blood-registers/search', { query, page, limit }))
      .then(unwrapResponse);
  },
  searchByProgramId(programId) {
    return apiClient.get(`/blood-registers/${programId}`).then(unwrap);
  },
  create(payload) {
    return apiClient.post('/blood-registers', payload).then(unwrap);
  },
  update(id, payload) {
    return apiClient.patch(`/blood-registers/${id}`, payload).then(unwrap);
  },
  cancel(id, payload = {}) {
    return apiClient.patch(`/blood-registers/${id}/cancel`, payload).then(unwrap);
  },
  remove(id) {
    return apiClient.delete(`/blood-registers/${id}`).then(unwrap);
  }
};

export const notificationsApi = {
  getAll() {
    return apiClient.get('/notifications').then(unwrap);
  },
  create(payload) {
    return apiClient.post('/notifications', payload).then(unwrap);
  },
  update(id, payload) {
    return apiClient.patch(`/notifications/${id}`, payload).then(unwrap);
  },
  remove(id) {
    return apiClient.delete(`/notifications/${id}`).then(unwrap);
  }
};

