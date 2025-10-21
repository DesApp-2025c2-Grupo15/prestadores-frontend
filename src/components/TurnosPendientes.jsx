import React, { useState, useEffect } from "react"
import { Table, Tag, Button, Card, Select, Space, message } from "antd"
import { EyeOutlined, EditOutlined } from "@ant-design/icons"
import { getTurnos, getEspecialidades } from "../services/turnos_pendientes"
import Lista from "./Lista"

const { Option } = Select

const TurnosPendientes = () => {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(false)
  const [especialidades, setEspecialidades] = useState([])
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("")
  
  // Modal de detalle
  const [modalOpen, setModalOpen] = useState(false)
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    cargarTurnos()
  }, [especialidadSeleccionada])

  const cargarDatos = async () => {
    try {
      const especialidadesData = await getEspecialidades()
      setEspecialidades(especialidadesData)
      cargarTurnos()
    } catch (err) {
      message.error("Error al cargar datos")
    }
  }

  const cargarTurnos = async () => {
    try {
      setLoading(true)
      const data = await getTurnos(especialidadSeleccionada)
      // Solo mostrar turnos pendientes
      const turnosPendientes = data.filter(t => t.estado === "pendiente")
      setTurnos(turnosPendientes)
    } catch (err) {
      message.error("Error al cargar turnos")
    } finally {
      setLoading(false)
    }
  }

  const verDetalle = (turno) => {
    setTurnoSeleccionado(turno)
    setModalOpen(true)
  }

  const columns = [
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      render: (fecha) => new Date(fecha).toLocaleDateString()
    },
    {
      title: "Hora",
      dataIndex: "hora",
      key: "hora"
    },
    {
      title: "Especialidad",
      dataIndex: "especialidad",
      key: "especialidad"
    },
    {
      title: "Médico",
      dataIndex: "medico",
      key: "medico"
    },
    {
      title: "Paciente",
      dataIndex: "paciente",
      key: "paciente"
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => (
        <Tag color={estado === "pendiente" ? "orange" : "green"}>
          {estado.toUpperCase()}
        </Tag>
      )
    },
    {
      title: "Detalles",
      key: "detalles",
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => verDetalle(record)}
            size="small"
          >
            Ver
          </Button>
        </Space>
      )
    }
  ]

  // Configuración de campos para el modal de detalle
  const fieldsDetalle = [
    { key: "id", label: "ID" },
    { key: "fecha", label: "Fecha" },
    { key: "hora", label: "Hora" },
    { key: "especialidad", label: "Especialidad" },
    { key: "medico", label: "Médico" },
    { key: "paciente", label: "Paciente" },
    { key: "estado", label: "Estado" },
    { key: "notas", label: "Notas" }
  ]

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 8 }}>Turnos Pendientes</h3>
      
        <Table
          columns={columns}
          dataSource={turnos}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
          locale={{
            emptyText: "No hay turnos pendientes"
          }}
        />

        {/* Modal de detalle usando tu componente Lista */}
      <Lista
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={loadingDetalle}
        detalle={turnoSeleccionado}
        fields={fieldsDetalle}
        title="Detalle del Turno"
      />
    </div>
      
  )
}

export default TurnosPendientes