import api from "./api"

// Obtener situaciones (incluye grupo familiar)
export const getSituacionesByAfiliado = async (idAfiliado, scope = "") => {
  const qs = scope ? `?scope=${encodeURIComponent(scope)}` : ""
  const url = `afiliados/${idAfiliado}/situaciones${qs}`
  try {
    const { data } = await api.get(url)
    return data
  } catch (err) {
    console.error("[API] GET", url, "error:", err?.response?.data ?? err.message)
    throw err
  }
}

// Crear nueva situación para el afiliado
export const crearSituacion = async (idAfiliado, body) => {
  const { data } = await api.post(`afiliados/${idAfiliado}/situaciones`, body)
  return data
}

// Modificar campos de una situación (PATCH)
export const modificarSituacion = async (idAfiliado, idSituacion, body) => {
  const { data } = await api.patch(`afiliados/${idAfiliado}/situaciones/${idSituacion}`, body)
  return data
}

// Cambiar estado de la situación (PATCH a .../estado)
export const cambiarEstadoSituacion = async (idAfiliado, idSituacion, body) => {
  const { data } = await api.patch(`afiliados/${idAfiliado}/situaciones/${idSituacion}/estado`, body)
  return data
}

// Eliminar situación (si el backend lo permite)
export const eliminarSituacion = async (idAfiliado, idSituacion) => {
  await api.delete(`afiliados/${idAfiliado}/situaciones/${idSituacion}`)
}
