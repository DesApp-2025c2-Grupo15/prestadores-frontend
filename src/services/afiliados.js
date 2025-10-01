import axios from "axios"

const API_URL = "http://localhost:8080/v1/prestadores/afiliados"

export const getAfiliados = async () => {
  const res = await axios.get(`${API_URL}`)
  return res.data.filter(a => a.id === 1 || a.id === 2)
  //return res.data
}

export const getAfiliadoById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`)
  return res.data
}

export const getHistoriaClinica = async (id) => {
  const res = await axios.get(`${API_URL}/${id}/historia-clinica`)
  return res.data
}