import React, { useState, useEffect } from "react"
import { Calendar, Select, Card, Badge, Modal, Form, Input, Button, message, Spin } from "antd"
import { PlusOutlined, EditOutlined } from "@ant-design/icons"
import { getTurnos, getEspecialidades, agregarNota } from "../services/turnos_pendientes"
import dayjs from "dayjs"

const { Option } = Select
const { TextArea } = Input

const Calendario = () => {
  const [turnos, setTurnos] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null)
  const [form] = Form.useForm()

  // Cargar datos iniciales
  useEffect(() => {
    cargarEspecialidades()
    cargarTurnos()
  }, [])

  // Recargar turnos cuando cambia especialidad
  useEffect(() => {
    cargarTurnos()
  }, [especialidadSeleccionada])

  const cargarEspecialidades = async () => {
    try {
      const data = await getEspecialidades()
      setEspecialidades(data)
    } catch (err) {
      message.error("Error al cargar especialidades")
    }
  }

  const cargarTurnos = async () => {
    try {
      setLoading(true)
      const data = await getTurnos(especialidadSeleccionada)
      setTurnos(data)
    } catch (err) {
      message.error("Error al cargar turnos")
    } finally {
      setLoading(false)
    }
  }

  // Obtener turnos de una fecha específica
  const getTurnosByFecha = (fecha) => {
    const fechaStr = fecha.format("YYYY-MM-DD")
    return turnos.filter(turno => turno.fecha === fechaStr)
  }

  // Renderizar contenido de cada día del calendario
  const dateCellRender = (value) => {
    const turnosDelDia = getTurnosByFecha(value)
    return (
      <div>
        {turnosDelDia.map(turno => (
          <Badge
            key={turno.id}
            status={turno.estado === "confirmado" ? "success" : "warning"}
            text={`${turno.hora} - ${turno.paciente}`}
            style={{ 
              display: "block", 
              fontSize: "11px", 
              marginBottom: "2px",
              cursor: "pointer"
            }}
            onClick={(e) => {
              e.stopPropagation()
              abrirModal(turno)
            }}
          />
        ))}
      </div>
    )
  }

  const abrirModal = (turno) => {
    setTurnoSeleccionado(turno)
    form.setFieldsValue({ notas: turno.notas })
    setModalVisible(true)
  }

  const guardarNota = async () => {
    try {
      const valores = await form.validateFields()
      await agregarNota(turnoSeleccionado.id, valores.notas)
      
      // Actualizar estado local
      setTurnos(prev => prev.map(t => 
        t.id === turnoSeleccionado.id 
          ? { ...t, notas: valores.notas }
          : t
      ))
      
      message.success("Nota guardada correctamente")
      setModalVisible(false)
      form.resetFields()
    } catch (err) {
      message.error("Error al guardar nota")
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <Card title="Calendario de Turnos" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }}>
          <span>Especialidad:</span>
          <Select
            style={{ width: 200 }}
            placeholder="Selecciona especialidad"
            value={especialidadSeleccionada}
            onChange={setEspecialidadSeleccionada}
          >
            <Option value="">Todos</Option>
            {especialidades.map(esp => (
              <Option key={esp} value={esp}>{esp}</Option>
            ))}
          </Select>
          <Button onClick={cargarTurnos}>Actualizar</Button>
        </div>
        
        {loading ? (
          <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
        ) : (
          <Calendar
            dateCellRender={dateCellRender}
            mode="month"
          />
        )}
      </Card>

      {/* Modal para agregar/editar notas */}
      <Modal
        title={`Turno - ${turnoSeleccionado?.paciente}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="save" type="primary" onClick={guardarNota} icon={<EditOutlined />}>
            Guardar Nota
          </Button>
        ]}
        width={600}
      >
        {turnoSeleccionado && (
          <div>
            <p><strong>Fecha:</strong> {turnoSeleccionado.fecha}</p>
            <p><strong>Hora:</strong> {turnoSeleccionado.hora}</p>
            <p><strong>Especialidad:</strong> {turnoSeleccionado.especialidad}</p>
            <p><strong>Médico:</strong> {turnoSeleccionado.medico}</p>
            <p><strong>Estado:</strong> 
              <Badge 
                status={turnoSeleccionado.estado === "confirmado" ? "success" : "warning"}
                text={turnoSeleccionado.estado}
                style={{ marginLeft: 8 }}
              />
            </p>
            
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item
                label="Notas del turno"
                name="notas"
                rules={[{ max: 500, message: "Máximo 500 caracteres" }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Agregar observaciones sobre el turno..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Calendario