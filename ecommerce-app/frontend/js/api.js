// Centralized fetch wrapper so every page talks to the backend the same way.
const API_BASE = '/api';

async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = Auth.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

const Api = {
  // Auth
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload }),
  me: () => apiRequest('/auth/me', { auth: true }),

  // Products
  listProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => apiRequest(`/products/${id}`),
  getCategories: () => apiRequest('/products/categories'),

  // Cart
  getCart: () => apiRequest('/cart', { auth: true }),
  addToCart: (productId, quantity = 1) =>
    apiRequest('/cart', { method: 'POST', body: { productId, quantity }, auth: true }),
  updateCartItem: (productId, quantity) =>
    apiRequest(`/cart/${productId}`, { method: 'PUT', body: { quantity }, auth: true }),
  removeCartItem: (productId) =>
    apiRequest(`/cart/${productId}`, { method: 'DELETE', auth: true }),

  // Orders
  createOrder: (shippingAddress) =>
    apiRequest('/orders', { method: 'POST', body: { shippingAddress }, auth: true }),
  myOrders: () => apiRequest('/orders', { auth: true }),
  getOrder: (id) => apiRequest(`/orders/${id}`, { auth: true }),
};
