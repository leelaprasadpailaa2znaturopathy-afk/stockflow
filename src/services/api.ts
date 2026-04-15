import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);

interface Product {
  _id?: string;
  name: string;
  category: string;
  quantity: number;
  status: 'In Stock' | 'Out of Stock' | 'Newly Added' | 'Back in Stock';
  size?: string;
  price?: number;
  imageUrl?: string;
  websiteUrl?: string;
  launchDate?: string | null;
  tags?: string[];
  ribbon?: string | null;
  releasedBatch?: string | null;
  updatedAt?: Date;
  updatedBy?: string;
}

interface ActivityLog {
  _id?: string;
  action: 'create' | 'update' | 'delete';
  productId: string;
  productName: string;
  timestamp: Date;
  userEmail: string;
  details?: string;
}

interface LoginResponse {
  token: string;
  email: string;
}

class APIService {
  private token: string | null = localStorage.getItem('token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }

  getToken() {
    return this.token;
  }

  // ============ AUTHENTICATION ============

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      if (!this.token) return false;
      await axios.post(`${API_URL}/api/auth/verify`, {}, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return true;
    } catch (error) {
      this.clearToken();
      return false;
    }
  }

  logout() {
    this.clearToken();
  }

  // ============ PRODUCTS ============

  async getProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createProduct(product: Product): Promise<Product> {
    try {
      if (!this.token) throw new Error('Not authenticated');
      const response = await axios.post(`${API_URL}/api/products`, product, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      if (!this.token) throw new Error('Not authenticated');
      const response = await axios.patch(`${API_URL}/api/products/${id}`, updates, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      if (!this.token) throw new Error('Not authenticated');
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ ACTIVITY LOGS ============

  async getLogs(): Promise<ActivityLog[]> {
    try {
      if (!this.token) throw new Error('Not authenticated');
      const response = await axios.get(`${API_URL}/api/logs`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAllLogs(): Promise<void> {
    try {
      if (!this.token) throw new Error('Not authenticated');
      await axios.delete(`${API_URL}/api/logs`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ HEALTH CHECK ============

  async healthCheck(): Promise<boolean> {
    try {
      await axios.get(`${API_URL}/api/health`);
      return true;
    } catch (error) {
      return false;
    }
  }

  // ============ LOGO MANAGEMENT ============

  async getLogo(): Promise<string> {
    try {
      const response = await axios.get(`${API_URL}/api/logo`);
      return response.data.logo;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async setLogoFromUrl(imageUrl: string): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/api/logo`,
        { imageUrl },
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ ERROR HANDLING ============

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const message = axiosError.response?.data?.error || axiosError.message;
      return new Error(message);
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}

export const apiService = new APIService();
export type { Product, ActivityLog, LoginResponse };
