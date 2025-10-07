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

interface MenuItem {
  id?: number;
  name: string;
  resource: string;
  icon?: string;
  path: string;
  parentId?: number | null;
  order?: number;
  isActive?: boolean;
  children?: MenuItem[];
}

const menuService = {
  async getAll() {
    const response = await axios.get(`${API_URL}/menus`, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async create(menu: MenuItem) {
    const response = await axios.post(`${API_URL}/menus`, menu, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async update(id: number, menu: MenuItem) {
    const response = await axios.put(`${API_URL}/menus/${id}`, menu, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async delete(id: number) {
    const response = await axios.delete(`${API_URL}/menus/${id}`, {
      headers: createAuthHeader()
    });
    return response.data;
  },

  async reorder(items: Array<{ id: number; order: number; parentId?: number | null }>) {
    const response = await axios.post(
      `${API_URL}/menus/reorder`,
      { items },
      { headers: createAuthHeader() }
    );
    return response.data;
  }
};

export default menuService;