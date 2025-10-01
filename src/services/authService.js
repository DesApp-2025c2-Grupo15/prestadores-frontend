import axios from "axios"

const API_URL = "http://localhost:8080/v1/prestadores" 

export const login = async (username) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username: username, 
    })
    return response.data
  } catch (error) {
    console.error("Error en login:", error.response?.data || error.message)
    throw error;
  }
}
