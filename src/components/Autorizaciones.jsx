import React, { useEffect, useState } from "react"
import { Table, Button, Tag, message, Card, Space } from "antd"
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

const Autorizaciones = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [open, setOpen] = useState(false)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  // editor
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState("create")
  const [editorItem, setEditorItem] = useState(null)

  // state change
  const [stateModalOpen, setStateModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedCurrentState, setSelectedCurrentState] = useState(null)

  const autorizacionFields = [
    { name: "tipo", label: "Tipo", type: "text", props: { disabled: true } },
    { name: "afiliadoId", label: "Afiliado ID", type: "number", rules: [{ required: true }] },
    { name: "procedimiento", label: "Procedimiento", type: "text", rules: [{ required: true }] },
    { name: "especialidad", label: "Especialidad", type: "text" },
    { name: "cobertura", label: "Cobertura", type: "text" },
    { name: "estado", label: "Estado", type: "select", options: [
      { value: "RECIBIDO", label: "RECIBIDO" },
      { value: "EN_ANALISIS", label: "EN_ANALISIS" },
      { value: "APROBADO", label: "APROBADO" },
      { value: "OBSERVADO", label: "OBSERVADO" },
      { value: "RECHAZADO", label: "RECHAZADO" },
    ], rules: [{ required: true }] },
    { name: "fechaSolicitada", label: "Fecha solicitada", type: "date" },
    { name: "observacion", label: "Observación", type: "textarea" },
  ]

  const transitionMap = {
    RECIBIDO: ["EN_ANALISIS"],
    EN_ANALISIS: ["APROBADO"],
    APROBADO: [],
    OBSERVADO: [],
    RECHAZADO: [],
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getAutorizaciones().catch(() => null)
      const items = res?.items ?? res ?? []
      setData(items)
    } catch (err) {
      console.error("Error cargar autorizaciones:", err)
      message.error("No se pudieron cargar autorizaciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const showDetalle = async (id) => {
    setDetalle(null)
    try {
      setLoadingDetalle(true)
      const detail = await getAutorizacionById(id).catch(() => null)
      if (!detail) {
        const local = data.find((r) => String(r.id) === String(id))
        if (local) {
          setDetalle({ ...local, historialCambios: local.historial || local.historialCambios || [], afiliado: local.afiliado || {} })
          setOpen(true)
          return
        }
        message.error(`Detalle no disponible para la autorización ${id}`)
        return
      }
      setDetalle({ ...detail, historialCambios: detail.historial || detail.historialCambios || [], afiliado: detail.afiliado || {} })
      setOpen(true)
    } catch (err) {
      console.error("Error detalle autorizacion:", err)
      message.error("No se pudo cargar detalle")
    } finally {
      setLoadingDetalle(false)
    }
  }

  const handleOpenCreate = () => {
    setEditorMode("create")
    setEditorItem({ tipo: "AUTORIZACION", estado: "RECIBIDO", afiliadoId: "", procedimiento: "", especialidad: "" })
    setEditorOpen(true)
  }

  const handleOpenEdit = async (id) => {
    const detail = (await getAutorizacionById(id).catch(() => null)) || data.find((r) => String(r.id) === String(id))
    if (!detail) { message.error("No se encontró la autorización para editar"); return }
    setEditorMode("edit")
    setEditorItem({
      ...detail,
      afiliadoId: detail?.afiliado?.id ?? detail?.afiliadoId ?? "",
      fechaSolicitada: detail?.fechaSolicitada ?? null,
      observacion: detail?.observacion ?? "",
    })
    setEditorOpen(true)
  }

  const handleSave = async (values) => {
    if (editorMode === "create") {
      try {
        await crearAutorizacion(values)
        message.success("Autorización creada (API)")
        await loadData()
      } catch (err) {
        // fallback mock
        const newId = (data.reduce((m, it) => Math.max(m, Number(it.id || 0)), 0) || 0) + 1
        const newItem = { id: newId, tipo: values.tipo || "AUTORIZACION", procedimiento: values.procedimiento, especialidad: values.especialidad, estado: values.estado || "RECIBIDO", fechaSolicitada: values.fechaSolicitada || new Date().toISOString(), afiliado: { id: values.afiliadoId }, observacion: values.observacion || "", historialCambios: [] }
        setData((d) => [newItem, ...d])
        message.info("API no disponible: Autorización creada (mock)")
      } finally { setEditorOpen(false) }
    } else {
      try {
        const id = editorItem?.id
        if (!id) throw new Error("ID faltante")
        await actualizarAutorizacion(id, values)
        message.success("Autorización actualizada (API)")
        await loadData()
        if (open && detalle?.id === id) showDetalle(id)
      } catch (err) {
        const updated = { ...editorItem, ...values, afiliado: { id: values.afiliadoId ?? editorItem?.afiliado?.id }, fechaSolicitada: values.fechaSolicitada ?? editorItem?.fechaSolicitada ?? new Date().toISOString() }
        setData((d) => d.map((it) => (String(it.id) === String(updated.id) ? updated : it)))
        if (open && detalle?.id === updated.id) setDetalle(updated)
        message.info("API no disponible: Autorización actualizada (mock)")
        setEditorOpen(false)
      }
    }
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
      await cambiarEstadoAutorizacion(selectedId, { nuevoEstado: newState, motivo, usuario: "usuario.app" })
      message.success("Estado actualizado (API)")
      await loadData()
      if (open && detalle?.id === selectedId) showDetalle(selectedId)
    } catch (err) {
      setData((d) => d.map((it) => String(it.id) === String(selectedId) ? { ...it, estado: newState, historialCambios: motivo ? [{ fecha: new Date().toISOString(), usuario: "mock", accion: newState, motivo }, ...(it.historialCambios || [])] : it.historialCambios } : it))
      if (open && detalle?.id === selectedId) setDetalle((prev) => ({ ...prev, estado: newState, historialCambios: motivo ? [{ fecha: new Date().toISOString(), usuario: "mock", accion: newState, motivo }, ...(prev.historialCambios || [])] : prev.historialCambios }))
      message.info("API no disponible: Estado actualizado (mock)")
    } finally {
      setStateModalOpen(false)
      setSelectedId(null)
    }
  }

  const color = { RECIBIDO: "blue", EN_ANALISIS: "orange", OBSERVADO: "purple", APROBADO: "green", RECHAZADO: "red" }

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Afiliado", render: (_, r) => `${r.afiliado?.nombre ?? "-"} ${r.afiliado?.apellido ?? ""}` },
    { title: "Procedimiento", dataIndex: "procedimiento", key: "procedimiento" },
    { title: "Especialidad", dataIndex: "especialidad", key: "especialidad" },
    { title: "Estado", dataIndex: "estado", render: e => <Tag color={color[e]}>{e}</Tag> },
    { title: "Fecha", dataIndex: "fechaSolicitada", key: "fechaSolicitada" },
    { title: "Detalle", key: "detalle", render: (_, record) => <Button type="text" icon={<EyeOutlined />} onClick={() => showDetalle(record.id)} /> },
    { title: "Acciones", key: "acciones", render: (_, record) => (<Space><Button size="small" onClick={() => handleOpenEdit(record.id)}>Editar</Button><Button size="small" onClick={() => openChangeState(record.id, record.estado)}>Cambiar estado</Button></Space>) },
  ]

  return (
    <Card title="Autorizaciones" extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>Crear autorización</Button></Space>} style={{ margin: 16 }}>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 10 }} bordered />
      <Lista open={open} onClose={() => setOpen(false)} loading={loadingDetalle} detalle={detalle} title="Detalle Autorización" fields={[
        { key: "id", label: "ID" }, { key: "tipo", label: "Tipo" }, { key: "estado", label: "Estado" }, { key: "procedimiento", label: "Procedimiento" }, { key: "especialidad", label: "Especialidad" }, { key: "fechaSolicitada", label: "Fecha solicitada" }, { key: "afiliado", label: "Afiliado", subFields: [{ key: "nombre", label: "Nombre" }, { key: "apellido", label: "Apellido" }, { key: "dni", label: "DNI" }] }, { key: "historialCambios", label: "Historial de cambios" }]} />
      <EditorModal open={editorOpen} onClose={() => setEditorOpen(false)} mode={editorMode} initialValues={editorItem} fields={autorizacionFields} title={editorMode === "create" ? "Crear Autorización" : "Editar Autorización"} onSave={handleSave} onDelete={editorMode === "edit" ? handleDeleteLocal : undefined} />
      <StateChangeModal open={stateModalOpen} onClose={() => setStateModalOpen(false)} currentState={selectedCurrentState} allowedStates={["EN_ANALISIS", "APROBADO", "OBSERVADO", "RECHAZADO"]} onConfirm={handleConfirmChangeState} />
    </Card>
  )
}

export default Autorizaciones