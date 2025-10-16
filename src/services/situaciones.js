import axios from "axios"
const API_URL = "http://localhost:8080/v1/prestadores/situaciones"

export const getSituacionesByAfiliado = async (idAfiliado) => {
  const { data } = await axios.get(`${API_URL}/afiliado/${idAfiliado}`)
  return data
}

export const crearSituacion = async (idAfiliado) => {
  const { data } = await axios.post(API_URL, { afiliadoId: idAfiliado })
  return data
}

export const modificarSituacion = async (idSituacion) => {
  const { data } = await axios.put(`${API_URL}/${idSituacion}`, {
    fechaFin: new Date().toISOString(),
  })
  return data
}

export const eliminarSituacion = async (idSituacion) => {
  await axios.delete(`${API_URL}/${idSituacion}`)
}
