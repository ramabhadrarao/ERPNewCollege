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

interface Group {
  id?: number;
  name: string;
  description?: string;
  permissionIds?: number[];
  isActive?: boolean;
  permissions?: any[];
}

const groupService = {
  async getAll() {
    const response = await axios.get(`${API_URL}/groups`, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async create(group: Group) {
    const response = await axios.post(`${API_URL}/groups`, group, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async update(id: number, group: Group) {
    const response = await axios.put(`${API_URL}/groups/${id}`, group, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async delete(id: number) {
    const response = await axios.delete(`${API_URL}/groups/${id}`, {
      headers: createAuthHeader()
    });
    return response.data;
  }
};

export default groupService;