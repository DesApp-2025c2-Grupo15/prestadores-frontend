import axios from "axios"

const API_BASE = "http://localhost:8080/v1/prestadores/solicitudes/"
const API_RESOURCE = `${API_BASE}autorizaciones`

export const getAutorizaciones = async (params = {}) => {
  const { data } = await axios.get(API_RESOURCE, { params })
  return data
}

export const getAutorizacionById = async (id) => {
  try {
    const { data } = await axios.get(`${API_RESOURCE}/${id}`)
    return data
  } catch (err) {
    if (err?.response?.status === 404) return null
    throw err
  }
}

export const crearAutorizacion = async (body) => {
  const { data } = await axios.post(API_RESOURCE, body)
  return data
}

export const actualizarAutorizacion = async (id, body) => {
  // PATCH /:id para editar campos (según tu backend)
  const { data } = await axios.patch(`${API_RESOURCE}/${id}`, body)
  return data
}

export const cambiarEstadoAutorizacion = async (id, body) => {
  const { data } = await axios.patch(`${API_RESOURCE}/${id}/estado`, body)
  return data
}