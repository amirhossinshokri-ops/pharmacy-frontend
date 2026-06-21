import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto refresh on 401
let refreshing = false
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && !refreshing) {
      original._retry = true
      refreshing = true
      try {
        const refresh = localStorage.getItem('refreshToken')
        if (!refresh) throw new Error('no refresh')
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken: refresh })
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      } finally { refreshing = false }
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────
export const authAPI = {
  register: (d: any) => api.post('/auth/register', d),
  login: (d: any) => api.post('/auth/login', d),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  profile: () => api.get('/auth/profile'),
  updateProfile: (d: any) => api.patch('/auth/profile', d),
  changePassword: (d: any) => api.patch('/auth/change-password', d),
  uploadAvatar: (file: File) => {
    const form = new FormData(); form.append('avatar', file)
    return api.post('/auth/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

// ─── Products ─────────────────────────────────────────
export const productAPI = {
  list: (params?: any) => api.get('/products', { params }),
  featured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  bestsellers: (limit = 8) => api.get('/products/bestsellers', { params: { limit } }),
  byId: (id: number) => api.get(`/products/${id}`),
  bySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  related: (id: number) => api.get(`/products/${id}/related`),
  create: (form: FormData) => api.post('/products', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, form: FormData) => api.patch(`/products/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: number) => api.delete(`/products/${id}`),
}

// ─── Categories ───────────────────────────────────────
export const categoryAPI = {
  list: () => api.get('/categories'),
  bySlug: (slug: string) => api.get(`/categories/${slug}`),
  create: (form: FormData) => api.post('/categories', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, d: any) => api.patch(`/categories/${id}`, d),
  delete: (id: number) => api.delete(`/categories/${id}`),
}

// ─── Cart ─────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId: number, quantity = 1) => api.post('/cart/add', { productId, quantity }),
  update: (itemId: number, quantity: number) => api.patch(`/cart/${itemId}`, { quantity }),
  remove: (itemId: number) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
}

// ─── Wishlist ─────────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId: number) => api.post(`/wishlist/${productId}`),
  remove: (productId: number) => api.delete(`/wishlist/${productId}`),
}

// ─── Orders ───────────────────────────────────────────
export const orderAPI = {
  list: (page = 1) => api.get('/orders', { params: { page } }),
  byId: (id: number) => api.get(`/orders/${id}`),
  create: (d: any) => api.post('/orders', d),
  applyDiscount: (code: string, orderTotal: number) => api.post('/orders/discount/apply', { code, orderTotal }),
}

// ─── Admin ────────────────────────────────────────────
export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  users: (params?: any) => api.get('/admin/users', { params }),
  toggleUser: (id: string) => api.patch(`/admin/users/${id}/toggle`),
  orders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id: number, status: string) => api.patch(`/admin/orders/${id}/status`, { status }),
  discounts: () => api.get('/admin/discounts'),
  createDiscount: (d: any) => api.post('/admin/discounts', d),
  toggleDiscount: (id: number) => api.patch(`/admin/discounts/${id}/toggle`),
}
