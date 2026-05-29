import { api as axiosInstance, setToken } from '../lib/api'

// Reexporta una forma compatible con el código existente:
// - api.client -> instancia de axios
// - api.setToken -> función para configurar el token
export const api = {
  client: axiosInstance,
  setToken,
}

