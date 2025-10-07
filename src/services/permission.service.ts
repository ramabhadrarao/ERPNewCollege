import axios from 'axios';
import authService from './auth.service';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const createAuthHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

interface Permission {
  id?: number;
  resource: string;
  action: string;
  description?: string;
}

const permissionService = {
  async getAll() {
    const response = await axios.get(`${API_URL}/permissions`, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async create(permission: Permission) {
    const response = await axios.post(`${API_URL}/permissions`, permission, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async update(id: number, permission: Permission) {
    const response = await axios.put(`${API_URL}/permissions/${id}`, permission, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async delete(id: number) {
    const response = await axios.delete(`${API_URL}/permissions/${id}`, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async bulkCreate(permissions: Permission[]) {
    const response = await axios.post(
      `${API_URL}/permissions/bulk`,
      { permissions },
      { headers: createAuthHeader() }
    );
    return response.data;
  }
};

export default permissionService;