// Mock de datos para turnos
const turnosMock = [
  {
    id: 1,
    fecha: "2025-10-15",
    hora: "09:00",
    especialidad: "Cardiología",
    medico: "Dr. García",
    paciente: "María Candia",
    estado: "confirmado",
    notas: ""
  },
  {
    id: 2, 
    fecha: "2025-10-15",
    hora: "10:30",
    especialidad: "Traumatología", 
    medico: "Dr. López",
    paciente: "Nicolas Martin",
    estado: "pendiente",
    notas: ""
  },
  {
    id: 3,
    fecha: "2025-10-22",
    hora: "14:00",
    especialidad: "Cardiología",
    medico: "Dr. García", 
    paciente: "Stella Rodriguez",
    estado: "confirmado",
    notas: "Paciente con antecedentes"
  }
]

export const getTurnos = async (especialidad = "") => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let turnos = turnosMock
      if (especialidad) {
        turnos = turnosMock.filter(t => 
          t.especialidad.toLowerCase().includes(especialidad.toLowerCase())
        )
      }
      resolve(turnos)
    }, 500)
  })
}

export const getEspecialidades = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const especialidades = [...new Set(turnosMock.map(t => t.especialidad))]
      resolve(especialidades)
    }, 300)
  })
}

export const agregarNota = async (turnoId, nota) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const turno = turnosMock.find(t => t.id === turnoId)
      if (turno) {
        turno.notas = nota
      }
      resolve(turno)
    }, 300)
  })
}