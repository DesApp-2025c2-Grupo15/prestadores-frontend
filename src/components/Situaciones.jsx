import React, { useEffect, useState } from "react"
import { Table, Button, Modal, Spin, message, Tag } from "antd"
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { getAfiliados } from "../services/afiliados"
import {
  getSituacionesByAfiliado,
  crearSituacion,
  modificarSituacion,
  eliminarSituacion,
} from "../services/situaciones"

const Situaciones = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [situaciones, setSituaciones] = useState([])
  const [loadingSituaciones, setLoadingSituaciones] = useState(false)

  // --- cargar afiliados ---
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

  // --- abrir modal ---
  const verSituaciones = async (afiliado) => {
    setSelected(afiliado)
    setOpen(true)
    setSituaciones([])
    try {
      setLoadingSituaciones(true)
      const res = await getSituacionesByAfiliado(afiliado.id)
      setSituaciones(res)
    } catch (err) {
      console.error("Error al cargar situaciones:", err)
      message.error("Error al traer situaciones terapéuticas")
    } finally {
      setLoadingSituaciones(false)
    }
  }

  // --- acciones ---
  const handleAlta = async (idPersona) => {
    try {
      await crearSituacion(idPersona)
      message.success("Situación creada correctamente")
      verSituaciones(selected)
    } catch {
      message.error("Error al crear situación")
    }
  }

  const handleModificar = async (idSituacion) => {
    try {
      await modificarSituacion(idSituacion)
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
          await eliminarSituacion(idSituacion)
          message.success("Situación eliminada")
          verSituaciones(selected)
        } catch {
          message.error("Error al eliminar situación")
        }
      },
    })
  }

  const columns = [
    { title: "DNI", dataIndex: "dni", key: "dni" },
    { title: "Nombre", render: (_, r) => `${r.nombre} ${r.apellido}` },
    { title: "Plan Médico", dataIndex: "planMedico", key: "planMedico" },
    { title: "Titular", render: (_, r) => (r.titular ? "Sí" : "No") },
    {
      title: "Acción",
      render: (_, r) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => verSituaciones(r)}
        >
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
      />

      {/* Modal de gestión */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        title={
          selected
            ? `Gestión: ${selected.nombre} ${selected.apellido}`
            : "Situaciones Terapéuticas"
        }
      >
        {loadingSituaciones ? (
          <Spin />
        ) : (
          <>
            {situaciones.length === 0 ? (
              <p>No hay situaciones registradas.</p>
            ) : (
              situaciones.map((s) => (
                <div
                  key={s.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 8,
                  }}
                >
                  <b>{new Date(s.fechaInicio).toLocaleDateString()}</b> –{" "}
                  {s.descripcion || "Sin descripción"}{" "}
                  {s.fechaFin ? (
                    <Tag color="default">Finalizada</Tag>
                  ) : (
                    <Tag color="green">Activa</Tag>
                  )}
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
                      icon={<DeleteOutlined />}
                      danger
                      size="small"
                      onClick={() => handleEliminar(s.id)}
                      style={{ marginRight: 8 }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))
            )}
            <div style={{ textAlign: "right", marginTop: 12 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleAlta(selected?.id)}
              >
                Añadir situación
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default Situaciones
