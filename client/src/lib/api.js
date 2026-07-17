import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : ''),
  timeout: 15000,
})

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
  if (!error?.response) return 'Unable to reach Symponify. Check your connection and try again.'
  return fallback
}

export default api
