import React, { useState, useEffect } from "react"
import {
  Table,
  Tag,
  Button,
  Card,
  Select,
  message,
  Grid,
  Typography,
} from "antd"
import { EyeOutlined } from "@ant-design/icons"
import { getTurnos, getEspecialidades } from "../services/turnos_pendientes"
import Lista from "./Lista"

const { Option } = Select
const { useBreakpoint } = Grid
const { Title } = Typography

const TurnosPendientes = () => {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(false)
  const [especialidades, setEspecialidades] = useState([])
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null)

  const screens = useBreakpoint()

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
      const turnosPendientes = data.filter((t) => t.estado === "pendiente")
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
        <Button
          icon={<EyeOutlined />}
          onClick={() => verDetalle(record)}
          size="small"
        >
          Ver
        </Button>
      )
    }
  ]

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
    <div style={{
      padding: screens.sm ? 24 : 12,
      width: "100%",
    }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Title level={4} style={{ marginBottom: 16 }}>
          Turnos Pendientes
        </Title>

        <div style={{ marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }}>
          <span>Especialidad:</span>
          <Select
            style={{ width: 200 }}
            placeholder="Selecciona especialidad"
            value={especialidadSeleccionada}
            onChange={setEspecialidadSeleccionada}
            allowClear
          >
            <Option value="">Todas</Option>
            {especialidades.map(esp => (
              <Option key={esp} value={esp}>{esp}</Option>
            ))}
          </Select>
          <Button onClick={cargarTurnos}>Actualizar</Button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <Table
            columns={columns}
            dataSource={turnos}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            bordered
            scroll={{ x: "max-content" }}
            style={{ width: "100%" }}
            locale={{
              emptyText: "No hay turnos pendientes"
            }}
          />
        </div>
      </Card>

      <Lista
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={false}
        detalle={turnoSeleccionado}
        fields={fieldsDetalle}
        title="Detalle del Turno"
      />
    </div>
  )
}

export default TurnosPendientes