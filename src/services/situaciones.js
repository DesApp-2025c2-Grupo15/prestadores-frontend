import axios from "axios"
const API_URL = "http://localhost:8080/v1/prestadores/"

// Obtener situaciones (incluye grupo familiar)
export const getSituacionesByAfiliado = async (idAfiliado) => {
  const { data } = await axios.get(`${API_URL}afiliados/${idAfiliado}/situaciones`)
  return data
}

// Crear nueva situación para el afiliado
export const crearSituacion = async (idAfiliado, body) => {
  const { data } = await axios.post(`${API_URL}afiliados/${idAfiliado}/situaciones`, body)
  return data
}

// Modificar campos de una situación (PATCH)
export const modificarSituacion = async (idAfiliado, idSituacion, body) => {
  const { data } = await axios.patch(`${API_URL}afiliados/${idAfiliado}/situaciones/${idSituacion}`, body)
  return data
}

// Cambiar estado de la situación (PATCH a .../estado)
export const cambiarEstadoSituacion = async (idAfiliado, idSituacion, body) => {
  const { data } = await axios.patch(`${API_URL}afiliados/${idAfiliado}/situaciones/${idSituacion}/estado`, body)
  return data
}

// Eliminar situación (si el backend lo permite)
export const eliminarSituacion = async (idAfiliado, idSituacion) => {
  await axios.delete(`${API_URL}afiliados/${idAfiliado}/situaciones/${idSituacion}`)
}
