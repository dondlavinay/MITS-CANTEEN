// Proactive cleanup: remove common bad token values left by older code or caching
try {
  let t = localStorage.getItem('token');
  if (typeof t === 'string') t = t.trim();
  if (!t || t === 'null' || t === 'undefined' || t === '') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.debug('api.js: cleaned up invalid token from localStorage');
  }
} catch (e) {
  // ignore
}

const API_BASE_URL = 'http://localhost:3005/api';

class API {
  static getToken() {
    return localStorage.getItem('token');
  }

  static setToken(token) {
    localStorage.setItem('token', token);
  }

  static removeToken() {
    localStorage.removeItem('token');
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  static async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  static async sendOTP(data) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Admin endpoints
  static async adminRegister(adminData) {
    return this.request('/admin/register', {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
  }

  static async adminLogin(credentials) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  // Menu endpoints
  static async getMenuItems(category = '') {
    try {
      const query = category ? `?category=${category}` : '';
      return await this.request(`/menu${query}`);
    } catch (error) {
      console.error('Failed to load menu items:', error.message);
      // Return empty array if database is unavailable
      return [];
    }
  }

  static async getMenuItem(id) {
    return this.request(`/menu/${id}`);
  }

  static async addMenuItem(itemData) {
    return this.request('/menu', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  static async deleteMenuItem(id) {
    return this.request(`/menu/${id}`, {
      method: 'DELETE'
    });
  }

  static async calculateTotal(items) {
    return this.request('/menu/calculate-total', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  }

  // Order endpoints
  static async createOrder(orderData) {
    if (!this.getToken()) {
      throw new Error('Authentication required');
    }
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  static async getMyOrders() {
    return this.request('/orders/my-orders');
  }

  static async getAllOrders() {
    return this.request('/orders');
  }

  static async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  static async cancelOrder(orderId) {
    return this.request(`/orders/${orderId}`, {
      method: 'DELETE'
    });
  }

  // Upload endpoint
  static async uploadImage(formData) {
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  }
}