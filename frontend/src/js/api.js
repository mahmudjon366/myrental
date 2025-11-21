/**
 * RENTACLOUD - API CLIENT
 * Modern API client with authentication and error handling
 */

class ApiClient {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.token = this.getToken();
  }
  
  // Get authentication token
  getToken() {
    return window.utils.storage.get('authToken');
  }
  
  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      window.utils.storage.set('authToken', token);
    } else {
      window.utils.storage.remove('authToken');
    }
  }
  
  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    // Add authentication header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }
    
    // Convert body to JSON if it's an object
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
    
    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Handle error responses
      if (!response.ok) {
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.data = data;
        
        // Handle authentication errors
        if (response.status === 401) {
          this.setToken(null);
          window.notifications.error('Sessiya tugagan. Iltimos, qayta kiring.');
          window.router.navigateTo('/login');
        }
        
        throw error;
      }
      
      return data;
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Tarmoq xatosi. Internet aloqangizni tekshiring.');
        networkError.isNetworkError = true;
        throw networkError;
      }
      
      throw error;
    }
  }
  
  // GET request
  async get(endpoint, params = {}) {
    const url = new URL(endpoint, this.baseURL);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    return this.request(url.pathname + url.search);
  }
  
  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    });
  }
  
  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    });
  }
  
  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
  
  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data
    });
  }
}

// API service class
class ApiService extends ApiClient {
  constructor() {
    super();
  }
  
  // Authentication
  async login(username, password) {
    try {
      const response = await this.post('/auth/login', { username, password });
      if (response.token) {
        this.setToken(response.token);
      }
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }
  
  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      // Even if logout request fails, clear local token
      console.warn('Logout request failed:', error.message);
    } finally {
      this.setToken(null);
    }
  }
  
  // Products
  async listProducts() {
    try {
      return await this.get('/products');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch products');
    }
  }
  
  async createProduct(productData) {
    try {
      return await this.post('/products', productData);
    } catch (error) {
      throw new Error(error.message || 'Failed to create product');
    }
  }
  
  async updateProduct(id, productData) {
    try {
      return await this.put(`/products/${id}`, productData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update product');
    }
  }
  
  async deleteProduct(id) {
    try {
      return await this.delete(`/products/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete product');
    }
  }
  
  async getProduct(id) {
    try {
      return await this.get(`/products/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch product');
    }
  }
  
  // Rentals
  async listRentals() {
    try {
      return await this.get('/rentals');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch rentals');
    }
  }
  
  async createRental(rentalData) {
    try {
      return await this.post('/rentals', rentalData);
    } catch (error) {
      throw new Error(error.message || 'Failed to create rental');
    }
  }
  
  async updateRental(id, rentalData) {
    try {
      return await this.put(`/rentals/${id}`, rentalData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update rental');
    }
  }
  
  async returnRental(id, returnDate) {
    try {
      return await this.patch(`/rentals/${id}/return`, { returnDate });
    } catch (error) {
      throw new Error(error.message || 'Failed to return rental');
    }
  }
  
  async deleteRental(id) {
    try {
      return await this.delete(`/rentals/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete rental');
    }
  }
  
  async getRental(id) {
    try {
      return await this.get(`/rentals/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch rental');
    }
  }
  
  // Reports
  async getReports(params = {}) {
    try {
      return await this.get('/reports', params);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch reports');
    }
  }
  
  async getDashboardStats() {
    try {
      return await this.get('/reports/dashboard');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch dashboard stats');
    }
  }
  
  async getMonthlyReport(year, month) {
    try {
      return await this.get('/reports/monthly', { year, month });
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch monthly report');
    }
  }
  
  // History
  async getHistory(params = {}) {
    try {
      return await this.get('/history', params);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch history');
    }
  }
}

// Request interceptor for automatic error handling
class ApiInterceptor {
  constructor(apiService) {
    this.apiService = apiService;
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // Wrap the original request method
    const originalRequest = this.apiService.request.bind(this.apiService);
    
    this.apiService.request = async (endpoint, options = {}) => {
      try {
        // Show loading indicator for non-GET requests
        if (options.method && options.method !== 'GET') {
          const loader = window.loading.show(document.getElementById('page-container'));
          
          try {
            const result = await originalRequest(endpoint, options);
            loader.hide();
            return result;
          } catch (error) {
            loader.hide();
            throw error;
          }
        }
        
        return await originalRequest(endpoint, options);
      } catch (error) {
        this.handleError(error, endpoint, options);
        throw error;
      }
    };
  }
  
  handleError(error, endpoint, options) {
    // Don't show notifications for certain endpoints
    const silentEndpoints = ['/auth/login', '/reports'];
    const shouldShowNotification = !silentEndpoints.some(ep => endpoint.includes(ep));
    
    if (shouldShowNotification) {
      if (error.isNetworkError) {
        window.notifications.error('Tarmoq xatosi. Internet aloqangizni tekshiring.');
      } else if (error.status >= 500) {
        window.notifications.error('Server xatosi. Iltimos, keyinroq qayta urinib ko\'ring.');
      } else if (error.status === 404) {
        window.notifications.warning('So\'ralgan ma\'lumot topilmadi.');
      } else if (error.status === 403) {
        window.notifications.error('Sizda bu amalni bajarish uchun ruxsat yo\'q.');
      } else {
        // Don't show the default error notification here as it may be handled by the calling code
      }
    }
    
    // Log error for debugging
    console.error('API Error:', {
      endpoint,
      method: options.method || 'GET',
      error: error.message,
      status: error.status,
      data: error.data
    });
  }
}

// Create global API instance
const apiService = new ApiService();
const apiInterceptor = new ApiInterceptor(apiService);

// Auth utilities
const auth = {
  isAuthenticated: () => !!apiService.getToken(),
  getToken: () => apiService.getToken(),
  setToken: (token) => apiService.setToken(token),
  logout: () => apiService.logout()
};

// Export API service and auth utilities
window.api = apiService;
window.auth = auth;