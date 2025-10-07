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

interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  groupIds?: number[];
  isActive?: boolean;
  lastLogin?: Date;
  groups?: any[];
}

const userService = {
  async getAll() {
    const response = await axios.get(`${API_URL}/users`, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async create(user: User) {
    const response = await axios.post(`${API_URL}/users`, user, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async update(id: number, user: User) {
    const response = await axios.put(`${API_URL}/users/${id}`, user, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async delete(id: number) {
    const response = await axios.delete(`${API_URL}/users/${id}`, {
      headers: createAuthHeader()
    });
    return response.data;
  }
};

export default userService;