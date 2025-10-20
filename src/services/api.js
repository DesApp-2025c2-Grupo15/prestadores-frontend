import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080/v1/prestadores/"

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
})

// opcional: interceptor de errores (ajustá según tu manejo)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // podés loggear o mapear errores aquí
    return Promise.reject(err)
  }
)

export default api