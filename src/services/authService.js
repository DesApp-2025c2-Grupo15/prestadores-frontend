import axios from "axios"

const API_URL = "http://localhost:8080/v1/prestadores" 

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials)
    return response.data 
  } catch (error) {
    throw error.response?.data || { message: "Error en la conexión con el servidor" }
  }
}

