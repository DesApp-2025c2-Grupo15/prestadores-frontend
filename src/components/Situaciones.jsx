import React, { useEffect, useState } from "react"
import { Table, Button, Modal, Spin, message, Tag, Input } from "antd"
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { getAfiliados } from "../services/afiliados"
import {
  getSituacionesByAfiliado,
  crearSituacion,
  modificarSituacion,
  eliminarSituacion,
  cambiarEstadoSituacion,
} from "../services/situaciones"

const Situaciones = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [loadingSituaciones, setLoadingSituaciones] = useState(false)
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [modalAltaVisible, setModalAltaVisible] = useState(false)
  const [descripcion, setDescripcion] = useState("")
  const [detalleAfiliado, setDetalleAfiliado] = useState(null)

  // Colores de estado
  const estadoColor = {
    ACTIVA: "green",
    BAJA: "red",
    ALTA: "blue",
  }

  // Cargar afiliados
  const fetchAfiliados = async () => {
    try {
      setLoading(true)
      const res = await getAfiliados()
      setData(res)
    } catch (err) {
      console.error("Error al cargar afiliados:", err)
      message.error("No se pudieron cargar los afiliados")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAfiliados()
  }, [])

  // Abrir modal y cargar situaciones
const verSituaciones = async (afiliado) => {
  setSelected(afiliado)
  setOpen(true)
  setDetalleAfiliado(null)
  try {
    setLoadingSituaciones(true)
    const res = await getSituacionesByAfiliado(afiliado.id)
    console.log("Datos recibidos del backend:", res) // 🔹 Verifica la estructura
    setDetalleAfiliado(res)
  } catch (err) {
    console.error("Error al cargar situaciones:", err)
    message.error("Error al traer situaciones terapéuticas")
  } finally {
    setLoadingSituaciones(false)
  }
}

// Crear nueva situación y recargar lista completa
const handleAlta = async () => {
  if (!descripcion.trim()) return message.warning("Ingrese una descripción")
  const body = {
    descripcion,
    fechaInicio: new Date().toISOString().split("T")[0],
  }
  try {
    await crearSituacion(selected.id, body)
    message.success("Situación creada correctamente")
    setModalAltaVisible(false)
    setDescripcion("")
    // 🔹 Recarga las situaciones para asegurarse de tener IDs y datos correctos
    await verSituaciones(selected)
  } catch {
    message.error("Error al crear situación")
  }
}


  const handleModificar = async (idSituacion) => {
    const body = { fechaFin: new Date().toISOString().split("T")[0] }
    try {
      await modificarSituacion(selected.id, idSituacion, body)
      message.success("Situación modificada")
      verSituaciones(selected)
    } catch {
      message.error("Error al modificar situación")
    }
  }

  const handleEliminar = async (idSituacion) => {
    Modal.confirm({
      title: "¿Desea eliminar esta situación?",
      onOk: async () => {
        try {
          await eliminarSituacion(selected.id, idSituacion)
          message.success("Situación eliminada")
          verSituaciones(selected)
        } catch {
          message.error("Error al eliminar situación")
        }
      },
    })
  }

  const cambiarEstado = async (idSituacion, nuevoEstado) => {
    try {
      await cambiarEstadoSituacion(selected.id, idSituacion, { estado: nuevoEstado })
      message.success(`Situación ${nuevoEstado === "BAJA" ? "dada de baja" : "reactivada"}`)
      verSituaciones(selected)
    } catch {
      message.error("Error al cambiar estado")
    }
  }

  const toggleExpand = (id) => {
    setExpandedRowKeys((prev) =>
      prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]
    )
  }

  const columns = [
    { title: "DNI", dataIndex: "dni", key: "dni" },
    { title: "Nombre", render: (_, r) => `${r.nombre} ${r.apellido}` },
    { title: "Plan Médico", dataIndex: "planMedico", key: "planMedico" },
    { title: "Titular", render: (_, r) => (r.titular ? "Sí" : "No") },
    {
      title: "Ver grupo familiar",
      key: "ver",
      render: (_, record) => (
        <Button type="default" onClick={() => toggleExpand(record.id)}>
          Ver
        </Button>
      ),
    },
    {
      title: "Acción",
      render: (_, r) => (
        <Button type="primary" icon={<EyeOutlined />} onClick={() => verSituaciones(r)}>
          Gestionar
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 16 }}>Situaciones Terapéuticas</h3>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
        expandable={{
          expandedRowRender: (afiliado) =>
            afiliado.grupoFamiliar && afiliado.grupoFamiliar.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {afiliado.grupoFamiliar.map((miembro) => (
                  <li key={miembro.afiliadoId ?? miembro.id}>
                    {miembro.nombre} {miembro.apellido} – {miembro.parentesco ?? miembro.relacion}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0 }}>No tiene grupo familiar registrado.</p>
            ),
          expandedRowKeys,
          onExpand: (expanded, record) => toggleExpand(record.id),
          showExpandColumn: false,
        }}
      />

      <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={700}
      title={selected ? `Gestión: ${selected.nombre} ${selected.apellido}` : "Situaciones Terapéuticas"}
    >
      {loadingSituaciones ? (
        <Spin />
      ) : (
        <>
          {/* Situaciones del afiliado */}
          {(!detalleAfiliado?.items || detalleAfiliado.items.length === 0) ? (
            <p>No hay situaciones registradas para este afiliado.</p>
          ) : (
            detalleAfiliado.items.map((s) => (
              <div
                key={s.id}
                style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10, marginBottom: 8 }}
              >
                <b>{s.fechaInicio ? new Date(s.fechaInicio).toLocaleDateString() : "-"}</b> – {s.descripcion || "Sin descripción"}{" "}
                {s.fechaFin ? <Tag color="default">Finalizada</Tag> : <Tag color="green">Activa</Tag>}
                <div style={{ marginTop: 8 }}>
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleModificar(s.id)}
                    style={{ marginRight: 8 }}
                  >
                    Modificar
                  </Button>
                  <Button
                    size="small"
                    onClick={() => cambiarEstado(s.id, s.estado === "ACTIVA" ? "BAJA" : "ACTIVA")}
                    style={{ marginRight: 8 }}
                  >
                    {s.estado === "ACTIVA" ? "Dar de baja" : "Reactivar"}
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    size="small"
                    onClick={() => handleEliminar(s.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          )}

          {/* Situaciones del grupo familiar */}
          {detalleAfiliado?.grupoFamiliar && detalleAfiliado.grupoFamiliar.length > 0 && (
            <>
              <h4 style={{ marginTop: 16 }}>Grupo Familiar</h4>
              {detalleAfiliado.grupoFamiliar.map((miembro) => (
                <div key={miembro.afiliadoId} style={{ borderTop: "1px solid #eee", paddingTop: 8, marginTop: 8 }}>
                  <b>{miembro.nombre} ({miembro.parentesco})</b>
                  {miembro.items?.length > 0 ? (
                    miembro.items.map((sit) => (
                      <p key={sit.id} style={{ marginLeft: 12 }}>
                        • {sit.descripcion} — <Tag color={estadoColor[sit.estado]}>{sit.estado}</Tag>
                      </p>
                    ))
                  ) : (
                    <p style={{ marginLeft: 12 }}>Sin situaciones registradas</p>
                  )}
                </div>
              ))}
            </>
          )}

          <div style={{ textAlign: "right", marginTop: 12 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalAltaVisible(true)}
            >
              Añadir situación
            </Button>
          </div>
        </>
      )}
    </Modal>


      {/* Modal para alta */}
      <Modal
        title="Nueva Situación"
        open={modalAltaVisible}
        onCancel={() => setModalAltaVisible(false)}
        onOk={handleAlta}
        okText="Crear"
      >
        <Input
          placeholder="Descripción de la situación"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </Modal>
    </div>
  )
}

export default Situaciones
