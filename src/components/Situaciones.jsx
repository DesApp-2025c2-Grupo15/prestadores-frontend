import React, { useEffect, useMemo, useState } from "react"
import {
  Table,
  Button,
  Modal,
  Spin,
  message,
  Tag,
  Input,
  Card,
  Space,
  Tabs,
  DatePicker,
  Form,
  Radio,
} from "antd"
import { EyeOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
import dayjs from "dayjs"

import { getAfiliados } from "../services/afiliados"
import {
  getSituacionesByAfiliado,
  crearSituacion,
  modificarSituacion,
  cambiarEstadoSituacion,
} from "../services/situaciones"

const { TextArea } = Input
const { TabPane } = Tabs

const Situaciones = () => {
  const [afiliados, setAfiliados] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(false)

  const [expandedRowKeys, setExpandedRowKeys] = useState([])

  const [gestorOpen, setGestorOpen] = useState(false)
  const [selectedAfiliado, setSelectedAfiliado] = useState(null)
  const [situacionesData, setSituacionesData] = useState(null)
  const [loadingSituaciones, setLoadingSituaciones] = useState(false)

  // controla qué pestaña está activa en el modal (clave string)
  const [activeTabKey, setActiveTabKey] = useState(null)

  const [altaVisible, setAltaVisible] = useState(false)
  const [editarVisible, setEditarVisible] = useState(false)
  const [bajaVisible, setBajaVisible] = useState(false)

  const [activeFilter, setActiveFilter] = useState("ACTIVAS") // ACTIVAS | INACTIVAS | TODAS

  const [contextMember, setContextMember] = useState(null)
  const [contextSituacion, setContextSituacion] = useState(null)

  const [formAlta] = Form.useForm()
  const [formEditar] = Form.useForm()
  const [formBaja] = Form.useForm()

  const estadoColor = {
    ACTIVA: "green",
    BAJA: "red",
    ALTA: "blue",
  }

  useEffect(() => {
    loadAfiliados()
  }, [])

  const loadAfiliados = async () => {
    try {
    setLoading(true)
    const res = await getAfiliados()
    const list = Array.isArray(res) ? res : res?.items ?? []
    console.log("IDs de afiliados cargados:", list.map(a => ({ id: a.id, nombre: a.nombre, apellido: a.apellido })))
    setAfiliados(list)
    setFiltered(list)
  } catch (err) {
    console.error("Error al cargar afiliados:", err)
    message.error("No se pudieron cargar los afiliados")
  } finally {
    setLoading(false)
  }
}

  const normalizeResponse = (resp, afiliadoId) => {
    if (!resp) return { items: [], grupoFamiliar: [] }
    if (Array.isArray(resp)) return { items: resp, grupoFamiliar: [] }
    if (resp.items) return { items: resp.items || [], grupoFamiliar: [] }

    const integrantes = resp.integrantes || resp.titulares || resp.miembros || resp.grupoFamiliar || null
    if (Array.isArray(integrantes)) {
      const findId = (o) => String(o.miembroId ?? o.afiliadoId ?? o.afiliadoId ?? o.afiliadoId ?? o.id ?? "") === String(afiliadoId)
      const titular = integrantes.find(findId)
      const items = titular ? (titular.situaciones || titular.items || []) : []
      const grupoFamiliar = integrantes
        .filter((i) => !findId(i))
        .map((i) => ({
          afiliadoId: i.miembroId ?? i.afiliadoId ?? i.id,
          nombre: i.nombre ?? i.firstName ?? "",
          apellido: i.apellido ?? i.lastName ?? "",
          parentesco: i.parentesco ?? i.relacion ?? null,
          items: i.situaciones || i.items || [],
        }))
      return { items, grupoFamiliar }
    }

    return { items: resp.situaciones || resp.items || [], grupoFamiliar: resp.grupoFamiliar || [] }
  }

  // unified function to open gestor; focusKey optionally sets active tab (string)
  const openGestor = async (afiliado, focusKey = null) => {
    setSelectedAfiliado(afiliado)
    setGestorOpen(true)
    setSituacionesData(null)
    setActiveTabKey(null)
    try {
      setLoadingSituaciones(true)
      let res = await getSituacionesByAfiliado(afiliado.id).catch(() => null)
      if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === "object" && Object.keys(res).length === 0)) {
        res = await getSituacionesByAfiliado(afiliado.id, "grupo").catch(() => null)
      }
      const norm = normalizeResponse(res, afiliado.id)
      setSituacionesData(norm)

      // determine active tab: if focusKey provided use it, else default to titular
      if (focusKey) {
        setActiveTabKey(String(focusKey))
      } else {
        setActiveTabKey(String(afiliado.id))
      }
    } catch (err) {
      console.error("Error al cargar situaciones:", err)
      message.error("Error al traer situaciones terapéuticas")
    } finally {
      setLoadingSituaciones(false)
    }
  }

  // original gestionar (titular view)
  const handleGestionar = (afiliado) => openGestor(afiliado)

  const reloadSituaciones = async () => {
    if (!selectedAfiliado) return
    await openGestor(selectedAfiliado)
  }

  // CREATE (añadir)
  const openAlta = (member) => {
    setContextMember(member)
    formAlta.resetFields()
    setAltaVisible(true)
  }

  const submitAlta = async () => {
    try {
      const vals = await formAlta.validateFields()
      const payload = {
        descripcion: vals.descripcion,
        fechaInicio: vals.fechaInicio.format("YYYY-MM-DD"),
        notas: vals.notas || null,
      }
      const afiliadoId = contextMember?.afiliadoId ?? selectedAfiliado?.id
      await crearSituacion(afiliadoId, payload)
      message.success("Situación creada")
      setAltaVisible(false)
      await reloadSituaciones()
    } catch (err) {
      console.error("Error crear situación:", err)
      message.error("No se pudo crear la situación")
    }
  }

  // UPDATE fecha fin
  const openEditar = (member, situacion) => {
    setContextMember(member)
    setContextSituacion(situacion)
    formEditar.resetFields()
    formEditar.setFieldsValue({
      nuevaFechaFin: situacion.fechaFin ? dayjs(situacion.fechaFin) : null,
    })
    setEditarVisible(true)
  }

  const submitEditar = async () => {
    try {
      const vals = await formEditar.validateFields()
      const nueva = vals.nuevaFechaFin.format("YYYY-MM-DD")
      const inicio = contextSituacion?.fechaInicio
      if (inicio && dayjs(nueva).isBefore(dayjs(inicio), "day")) {
        return message.warning("La fecha de fin debe ser mayor o igual a la fecha de inicio")
      }
      const afiliadoId = contextMember?.afiliadoId ?? selectedAfiliado?.id
      await modificarSituacion(afiliadoId, contextSituacion.id, { fechaFin: nueva })
      message.success("Fecha de fin actualizada")
      setEditarVisible(false)
      await reloadSituaciones()
    } catch (err) {
      console.error("Error actualizar fecha fin:", err)
      message.error("No se pudo actualizar la fecha de fin")
    }
  }

  // DAR DE BAJA (soft)
  const openBaja = (member, situacion) => {
    setContextMember(member)
    setContextSituacion(situacion)
    formBaja.resetFields()
    setBajaVisible(true)
  }

  const submitBaja = async () => {
    try {
      const vals = await formBaja.validateFields()
      const motivo = vals.motivo?.trim() || null
      const afiliadoId = contextMember?.afiliadoId ?? selectedAfiliado?.id
      await cambiarEstadoSituacion(afiliadoId, contextSituacion.id, { estado: "BAJA", motivo, usuario: "usuario.app" })
      message.success("Situación dada de baja")
      setBajaVisible(false)
      await reloadSituaciones()
    } catch (err) {
      console.error("Error dar de baja:", err)
      message.error("No se pudo dar de baja la situación")
    }
  }

  // DAR DE ALTA (reactivar)
  const handleReactivar = async (member, situacion) => {
    try {
      const afiliadoId = member?.afiliadoId ?? selectedAfiliado?.id
      await cambiarEstadoSituacion(afiliadoId, situacion.id, { estado: "ACTIVA", usuario: "usuario.app" })
      message.success("Situación reactivada")
      await reloadSituaciones()
    } catch (err) {
      console.error("Error reactivar situación:", err)
      message.error("No se pudo reactivar la situación")
    }
  }
  
  const toggleExpand = async (id) => {
  if (expandedRowKeys.includes(id)) {
    // Contraer
    setExpandedRowKeys((prev) => prev.filter((key) => key !== id))
  } else {
    // Expandir - cargar grupo familiar
    try {
      const res = await getSituacionesByAfiliado(id, "grupo")
      const norm = normalizeResponse(res, id)
      
      // Actualizar el afiliado en la lista con los datos del grupo
      setFiltered(prev => prev.map(afiliado => 
        afiliado.id === id 
          ? { ...afiliado, grupoFamiliar: norm.grupoFamiliar }
          : afiliado
      ))
      
      setExpandedRowKeys((prev) => [...prev, id])
    } catch (err) {
      console.error("Error cargar grupo familiar:", err)
      message.error("Error al cargar grupo familiar")
    }
  }
}
  const tabs = useMemo(() => {
    if (!situacionesData) return []
    const titular = {
      afiliadoId: selectedAfiliado?.id,
      nombre: selectedAfiliado?.nombre,
      apellido: selectedAfiliado?.apellido,
      items: situacionesData.items || [],
    }
    const grupo = situacionesData.grupoFamiliar || []
    return [titular, ...grupo]
  }, [situacionesData, selectedAfiliado])

  const situCols = (member) => [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Diagnóstico / Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      render: (t) => t || "-",
    },
    {
      title: "Fecha inicio",
      dataIndex: "fechaInicio",
      key: "fechaInicio",
      render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Fecha fin",
      dataIndex: "fechaFin",
      key: "fechaFin",
      render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (e) => <Tag color={estadoColor[e] || "default"}>{e}</Tag>,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, row) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditar(member, row)}>
            Modif. fin
          </Button>

          {row.estado === "BAJA" ? (
            <Button size="small" type="primary" onClick={() => handleReactivar(member, row)}>
              Dar de alta
            </Button>
          ) : (
            <Button size="small" danger onClick={() => openBaja(member, row)}>
              Dar de baja
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const filterItems = (items = []) => {
    if (activeFilter === "TODAS") return items
    if (activeFilter === "ACTIVAS") return items.filter((i) => i.estado === "ACTIVA" || i.estado === "ALTA")
    if (activeFilter === "INACTIVAS") return items.filter((i) => i.estado === "BAJA" || i.fechaFin)
    return items
  }

  const afiliadosColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "DNI", dataIndex: "dni", key: "dni" },
    { title: "Nombre", render: (_, r) => `${r.nombre ?? ""} ${r.apellido ?? ""}` },
    { title: "Plan Médico", dataIndex: "planMedico", key: "planMedico" },
    { title: "Titular", render: (_, r) => (r.titular ? "Sí" : "No") },
    {
      title: "Grupo familiar",
      key: "grupo",
      render: (_, r) => (
        <Button size="small" onClick={() => toggleExpand(r.id)}>
          Ver
        </Button>
      ),
    },
    {
      title: "Acciones",
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleGestionar(record)} icon={<EyeOutlined />}>
            Gestionar
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 8 }}>Gestión de situaciones terapéuticas</h3>

     <Table
        rowKey="id"
        columns={afiliadosColumns}
        dataSource={filtered}
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
        open={gestorOpen}
        onCancel={() => {
          setGestorOpen(false)
          setActiveTabKey(null)
        }}
        title={selectedAfiliado ? `Gestión: ${selectedAfiliado.nombre} ${selectedAfiliado.apellido}` : "Gestor"}
        width={900}
        footer={null}
        destroyOnClose
      >
        {loadingSituaciones ? (
          <Spin />
        ) : !situacionesData ? (
          <p>No hay datos</p>
        ) : (
          <>
            <Space style={{ marginBottom: 12 }}>
              <Radio.Group value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                <Radio.Button value="ACTIVAS">Activas</Radio.Button>
                <Radio.Button value="INACTIVAS">Inactivas</Radio.Button>
                <Radio.Button value="TODAS">Todas</Radio.Button>
              </Radio.Group>
            </Space>

            <Tabs activeKey={activeTabKey ?? undefined} onChange={(k) => setActiveTabKey(k)}>
              {tabs.map((m, idx) => (
                <TabPane tab={`${m.nombre} ${m.apellido} ${m.parentesco ? `(${m.parentesco})` : ""}`} key={String(m.afiliadoId ?? idx)}>
                  <div style={{ marginBottom: 8, textAlign: "right" }}>
                    <Button size="small" onClick={() => openAlta(m)} icon={<PlusOutlined />}>
                      Añadir situación
                    </Button>
                  </div>

                  <Table dataSource={filterItems(m.items || [])} columns={situCols(m)} rowKey="id" pagination={false} bordered />
                </TabPane>
              ))}
            </Tabs>
            
{/* Situaciones del grupo familiar */}
            {situacionesData?.grupoFamiliar && situacionesData.grupoFamiliar.length > 0 && (
              <>
                <h4 style={{ marginTop: 16 }}>Grupo Familiar</h4>
                {situacionesData.grupoFamiliar.map((miembro) => (
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

          </>
        )}
      </Modal>

      {/* Modal Alta */}
      <Modal title="Añadir situación terapéutica" open={altaVisible} onCancel={() => setAltaVisible(false)} onOk={submitAlta} destroyOnClose>
        <Form layout="vertical" form={formAlta}>
          <Form.Item name="descripcion" label="Diagnóstico / Descripción" rules={[{ required: true, message: "Ingrese descripción" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fechaInicio" label="Fecha inicio" rules={[{ required: true, message: "Ingrese fecha inicio" }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="notas" label="Notas (opcional)">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Editar fecha fin */}
      <Modal title="Modificar fecha de fin" open={editarVisible} onCancel={() => setEditarVisible(false)} onOk={submitEditar} destroyOnClose>
        <Form layout="vertical" form={formEditar}>
          <Form.Item name="nuevaFechaFin" label="Nueva fecha de fin" rules={[{ required: true, message: "Ingrese nueva fecha de fin" }]}>
            <DatePicker />
          </Form.Item>
          {contextSituacion && contextSituacion.fechaInicio && (
            <div style={{ fontSize: 12, color: "#666" }}>Fecha inicio: {dayjs(contextSituacion.fechaInicio).format("YYYY-MM-DD")}</div>
          )}
        </Form>
      </Modal>

      {/* Modal Dar de baja (confirmación + motivo opcional) */}
      <Modal title="Dar de baja situación" open={bajaVisible} onCancel={() => setBajaVisible(false)} onOk={submitBaja} okText="Confirmar baja" destroyOnClose>
        <p>Confirma dar de baja la situación seleccionada? (Esta acción es reversible mediante reactivación)</p>
        <Form layout="vertical" form={formBaja}>
          <Form.Item name="motivo" label="Motivo (*)">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Situaciones
