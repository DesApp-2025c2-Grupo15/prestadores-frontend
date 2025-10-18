import axios from "axios"

const API_BASE = "http://localhost:8080/v1/prestadores/"
const API_AFILIADOS = `${API_BASE}afiliados`

export const getAfiliados = async (params = {}) => {
  const { data } = await axios.get(API_AFILIADOS, { params })
  return data
}

export const getAfiliadoById = async (id) => {
  try {
    const { data } = await axios.get(`${API_AFILIADOS}/${id}`)
    return data
  } catch (err) {
    // devolver null si no existe para que el componente lo maneje
    if (err?.response?.status === 404) return null
    throw err
  }
}

export const getHistoriaClinica = async (id) => {
  try {
    const { data } = await axios.get(`${API_AFILIADOS}/${id}/historia-clinica`)
    return data
  } catch (err) {
    // intento fallback a /situaciones si /historia-clinica no existe
    if (err?.response?.status === 404) {
      try {
        const { data: s } = await axios.get(`${API_AFILIADOS}/${id}/situaciones`)
        return s
      } catch (err2) {
        return null
      }
    }
    throw err
  }
}

export const getAfiliadoByDni = async (dni) => {
  try {
    const { data } = await axios.get(API_AFILIADOS, { params: { q: dni } })
    const afiliados = data.items ?? data
    return (Array.isArray(afiliados) ? afiliados : []).find((a) => String(a.dni) === String(dni)) ?? null
  } catch (err) {
    // fallback: traer todo y buscar
    const res = await axios.get(API_AFILIADOS)
    const afiliados = res.data.items ?? res.data
    return (Array.isArray(afiliados) ? afiliados : []).find((a) => String(a.dni) === String(dni)) ?? null
  }
}