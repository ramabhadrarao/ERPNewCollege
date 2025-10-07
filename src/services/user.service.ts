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

export interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  lastLogin?: Date;
  groups: any[];
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  isActive?: boolean;
  groupIds?: number[];
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  groupIds?: number[];
}

const userService = {
  async getAll(): Promise<User[]> {
    const response = await axios.get(`${API_URL}/users`, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async create(userData: CreateUserData): Promise<User> {
    const response = await axios.post(`${API_URL}/users`, userData, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async update(id: number, userData: UpdateUserData): Promise<User> {
    const response = await axios.put(`${API_URL}/users/${id}`, userData, {
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