import React, { useEffect, useState } from "react"
import { Table, Button, Tag, message, Card, Space, Grid, Typography } from "antd"
import { EyeOutlined, PlusOutlined } from "@ant-design/icons"
import {
  getAutorizaciones,
  getAutorizacionById,
  crearAutorizacion,
  actualizarAutorizacion,
  cambiarEstadoAutorizacion,
} from "../services/autorizaciones"
import Lista from "./Lista"
import EditorModal from "./EditorModal"
import StateChangeModal from "./StateChangeModal"

const { useBreakpoint } = Grid
const { Title } = Typography

const Autorizaciones = () => {
  const screens = useBreakpoint()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [open, setOpen] = useState(false)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState("create")
  const [editorItem, setEditorItem] = useState(null)
  const [stateModalOpen, setStateModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedCurrentState, setSelectedCurrentState] = useState(null)

  const color = {
    RECIBIDO: "blue",
    EN_ANALISIS: "orange",
    OBSERVADO: "purple",
    APROBADO: "green",
    RECHAZADO: "red",
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getAutorizaciones().catch(() => null)
      const items = res?.items ?? res ?? []
      setData(items)
    } catch {
      message.error("No se pudieron cargar autorizaciones")
    } finally {
      setLoading(false)
    }
  }

  const showDetalle = async (id) => {
    setDetalle(null)
    try {
      setLoadingDetalle(true)
      const detail = await getAutorizacionById(id).catch(() => null)
      const local = detail || data.find((r) => String(r.id) === String(id))
      if (!local) return message.error("Detalle no disponible")
      setDetalle({
        ...local,
        historialCambios: local.historial || local.historialCambios || [],
        afiliado: local.afiliado || {},
      })
      setOpen(true)
    } catch {
      message.error("No se pudo cargar el detalle")
    } finally {
      setLoadingDetalle(false)
    }
  }

  const handleOpenCreate = () => {
    setEditorMode("create")
    setEditorItem({
      tipo: "AUTORIZACION",
      estado: "RECIBIDO",
      afiliadoId: "",
      procedimiento: "",
      especialidad: "",
    })
    setEditorOpen(true)
  }

  const handleOpenEdit = async (id) => {
    const detail =
      (await getAutorizacionById(id).catch(() => null)) ||
      data.find((r) => String(r.id) === String(id))
    if (!detail) return message.error("No se encontró la autorización para editar")

    setEditorMode("edit")
    setEditorItem({
      ...detail,
      afiliadoId: detail?.afiliado?.id ?? detail?.afiliadoId ?? "",
      fechaSolicitada: detail?.fechaSolicitada ?? null,
      observacion: detail?.observacion ?? "",
    })
    setEditorOpen(true)
  }

  const handleDeleteLocal = (item) => {
    setData((d) => d.filter((it) => String(it.id) !== String(item.id)))
    message.success("Autorización eliminada (mock)")
    if (open && detalle?.id === item.id) setOpen(false)
    setEditorOpen(false)
  }

  const openChangeState = (id, currentState) => {
    setSelectedId(id)
    setSelectedCurrentState(currentState)
    setStateModalOpen(true)
  }

  const handleConfirmChangeState = async ({ newState, motivo = null }) => {
    if (!selectedId) return
    try {
      await cambiarEstadoAutorizacion(selectedId, {
        nuevoEstado: newState,
        motivo,
        usuario: "usuario.app",
      })
      message.success("Estado actualizado (API)")
      await loadData()
      if (open && detalle?.id === selectedId) showDetalle(selectedId)
    } catch {
      setData((d) =>
        d.map((it) =>
          String(it.id) === String(selectedId)
            ? {
                ...it,
                estado: newState,
                historialCambios: motivo
                  ? [
                      {
                        fecha: new Date().toISOString(),
                        usuario: "mock",
                        accion: newState,
                        motivo,
                      },
                      ...(it.historialCambios || []),
                    ]
                  : it.historialCambios,
              }
            : it
        )
      )
      message.info("API no disponible: Estado actualizado (mock)")
    } finally {
      setStateModalOpen(false)
      setSelectedId(null)
    }
  }

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", align: "center", width: 80 },
    {
      title: "Afiliado",
      render: (_, r) =>
        `${r.afiliado?.nombre ?? "-"} ${r.afiliado?.apellido ?? ""}`,
      align: "center",
    },
    {
      title: "Procedimiento",
      dataIndex: "procedimiento",
      key: "procedimiento",
      align: "center",
    },
    {
      title: "Especialidad",
      dataIndex: "especialidad",
      key: "especialidad",
      align: "center",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      render: (e) => <Tag color={color[e]}>{e}</Tag>,
      align: "center",
    },
    {
      title: "Fecha",
      dataIndex: "fechaSolicitada",
      key: "fechaSolicitada",
      align: "center",
    },
    {
      title: "Detalle",
      key: "detalle",
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => showDetalle(record.id)}
          size={screens.xs ? "small" : "middle"}
        />
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "center",
      render: (_, record) => (
        <Space size="small" direction={screens.xs ? "vertical" : "horizontal"}>
          <Button size="small" onClick={() => handleOpenEdit(record.id)}>
            Editar
          </Button>
          <Button
            size="small"
            onClick={() => openChangeState(record.id, record.estado)}
          >
            Cambiar estado
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: screens.xs ? 8 : 24 }}>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>Autorizaciones</Title>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ width: screens.xs ? "100%" : "auto" }}
          >
            Crear autorización
          </Button>
        }
        bordered={false}
        style={{
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {/* Tabla responsive con scroll horizontal conservado */}
        <div style={{ overflowX: "auto" }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{ pageSize: 10, position: ["bottomCenter"] }}
            bordered
            scroll={{ x: "max-content" }}
            style={{
              minWidth: screens.xs ? 700 : "100%",
              fontSize: screens.xs ? 12 : 14,
            }}
          />
        </div>

        <Lista
          open={open}
          onClose={() => setOpen(false)}
          loading={loadingDetalle}
          detalle={detalle}
          title="Detalle Autorización"
          fields={[
            { key: "id", label: "ID" },
            { key: "tipo", label: "Tipo" },
            { key: "estado", label: "Estado" },
            { key: "procedimiento", label: "Procedimiento" },
            { key: "especialidad", label: "Especialidad" },
            { key: "fechaSolicitada", label: "Fecha solicitada" },
            {
              key: "afiliado",
              label: "Afiliado",
              subFields: [
                { key: "nombre", label: "Nombre" },
                { key: "apellido", label: "Apellido" },
                { key: "dni", label: "DNI" },
              ],
            },
            { key: "historialCambios", label: "Historial de cambios" },
          ]}
        />

        <EditorModal
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          mode={editorMode}
          initialValues={editorItem}
          title={
            editorMode === "create"
              ? "Crear Autorización"
              : "Editar Autorización"
          }
          onSave={() => loadData()}
          onDelete={editorMode === "edit" ? handleDeleteLocal : undefined}
        />

        <StateChangeModal
          open={stateModalOpen}
          onClose={() => setStateModalOpen(false)}
          currentState={selectedCurrentState}
          allowedStates={["EN_ANALISIS", "APROBADO", "OBSERVADO", "RECHAZADO"]}
          onConfirm={handleConfirmChangeState}
        />
      </Card>
    </div>
  )
}

export default Autorizaciones
