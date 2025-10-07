import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const authService = {
  async login(username: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('user');
  },

  async resetPassword(email: string) {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { email });
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await axios.post(
      `${API_URL}/auth/change-password`,
      { oldPassword, newPassword },
      {
        headers: { Authorization: `Bearer ${this.getCurrentUser()?.token}` }
      }
    );
    return response.data;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
};

export default authService;