import axios from "axios"
const API_URL = "http://localhost:8080/v1/prestadores/solicitudes/autorizaciones"

export const getAutorizaciones = async () => {
  const { data } = await axios.get(API_URL)
  return data.items || []
}

export const getAutorizacionById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`)
  return {
    ...data,
    historialCambios: data.historial, // alias
  }
}
