import { getToken, authHeader } from './auth.js';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

async function request(path, options = {}) {
  try {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const url = `${API_BASE}${path}`;
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    const res = await fetch(url, { ...options, headers });
    const contentType = res.headers.get('content-type') || '';
    
    if (!res.ok) {
      let errorData;
      try {
        errorData = contentType.includes('application/json') 
          ? await res.json() 
          : { error: await res.text() };
        
        console.error('❌ API Error Response:', {
          status: res.status,
          statusText: res.statusText,
          url: res.url,
          errorData
        });
        
      } catch (e) {
        console.error('Error parsing error response:', e);
        errorData = { error: `HTTP ${res.status}: ${res.statusText}` };
      }
      
      const error = new Error(errorData.message || errorData.error || `HTTP ${res.status}`);
      error.status = res.status;
      error.errors = errorData.errors || errorData.details || [];
      error.field = errorData.field;
      error.response = errorData;
      
      // Add more details from validation errors if available
      if (errorData.errors && errorData.errors.length > 0) {
        error.message = errorData.errors[0].msg || error.message;
      }
      
      throw error;
    }
    
    if (contentType.includes('application/json')) {
      const data = await res.json();
      console.log(`✅ API Success: ${options.method || 'GET'} ${url}`);
      return data.data !== undefined ? data.data : data;
    }
    return res.text();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🔌 Network Error: Backend server might be down');
      throw new Error('Backend server bilan bog\'lanishda xatolik. Server ishga tushganini tekshiring.');
    }
    throw error;
  }
}

// Authenticated request function for reports
async function authenticatedRequest(path, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required for reports');
  }
  
  const headers = { 
    'Content-Type': 'application/json', 
    ...authHeader(),
    ...(options.headers || {}) 
  };
  
  return request(path, { ...options, headers });
}

export const api = {
  // auth (no authentication required)
  login: () => request('/auth/login', { method: 'POST', body: JSON.stringify({}) }),
  reportLogin: () => request('/auth/report-login', { method: 'POST', body: JSON.stringify({}) }),

  // products (no authentication required)
  listProducts: () => request('/products'),
  createProduct: (p) => request('/products', { method: 'POST', body: JSON.stringify(p) }),
  updateProduct: (id, p) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // rentals (no authentication required)
  listRentals: () => request('/rentals'),
  createRental: (payload) => request('/rentals', { method: 'POST', body: JSON.stringify(payload) }),
  returnRental: (id, returnDate) => request(`/rentals/${id}/return`, { method: 'PUT', body: JSON.stringify({ returnDate }) }),

  // reports (authentication required)
  reportRentals: () => authenticatedRequest('/reports/rentals'),
  totalIncome: () => authenticatedRequest('/reports/income/total'),
  monthlyIncome: (ym) => authenticatedRequest(`/reports/income/monthly/${ym}`),
};