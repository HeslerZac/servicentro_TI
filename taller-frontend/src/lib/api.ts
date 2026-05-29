import axios from 'axios'

// Usa env si está definido; si no, ruta relativa que Vite proxya en dev
const baseURL = (import.meta as any)?.env?.VITE_API_BASE_URL || '/api/v1'

export const api = axios.create({ baseURL })

let authToken: string | null = null

export function setToken(token: string | null) {
  authToken = token
}

api.interceptors.request.use((cfg) => {
  if (authToken) {
    cfg.headers = cfg.headers || {}
    cfg.headers['Authorization'] = `Bearer ${authToken}`
  }
  return cfg
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status
    if (status === 401 || status === 403) {
      try { if (!location.pathname.includes('/login')) location.assign('/login') } catch {}
    }
    // 409/422: el caller mostrará el mensaje devuelto por backend
    return Promise.reject(err)
  },
)
