import React, { useEffect, useState } from "react"
import { Table, Button, Card, Spin } from "antd"
import { EyeOutlined, FileTextOutlined } from "@ant-design/icons"
import { getAfiliados, getAfiliadoById, getHistoriaClinica } from "../services/afiliados"
import Lista from "./Lista"

const Pacientes = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [open, setOpen] = useState(false)
  const [historia, setHistoria] = useState(null)
  const [showHistoria, setShowHistoria] = useState(false)
  const [loadingHistoria, setLoadingHistoria] = useState(false)

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize)
  }, [])

  const fetchData = async (page, pageSize) => {
    try {
      setLoading(true)
      const result = await getAfiliados()
      setData(result)
      setPagination({ ...pagination, total: result.length })
    } catch (error) {
      console.error("Error al traer afiliados:", error)
    } finally {
      setLoading(false)
    }
  }

  const showDetalle = async (id) => {
    try {
      setLoading(true)
      setDetalle(null)
      const result = await getAfiliadoById(id)
      setDetalle(result)
      setOpen(true)
    } catch (error) {
      console.error("Error al traer detalle:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistoriaClinica = async () => {
    if (!detalle?.id) return
    try {
      setLoadingHistoria(true)
      const data = await getHistoriaClinica(detalle.id)
      setHistoria(data)
      setShowHistoria(true)
    } catch (err) {
      console.error("Error al traer historia clínica:", err)
    } finally {
      setLoadingHistoria(false)
    }
  }

  const columns = [
    { title: "DNI", dataIndex: "dni", key: "dni" },
    {
      title: "Nombre",
      render: (_, record) => `${record.nombre} ${record.apellido}`,
      key: "nombre",
    },
    { title: "Plan Médico", dataIndex: "planMedico", key: "planMedico" },
    { title: "Titular", dataIndex: "titular", key: "titular", render: (val) => (val ? "Sí" : "No") },
    {
      title: "Detalle",
      key: "detalle",
      render: (_, record) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => showDetalle(record.id)} />
      ),
    },
  ]

  const handleTableChange = (pag) => {
    setPagination(pag)
    fetchData(pag.current, pag.pageSize)
  }

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 16 }}>Afiliados</h3>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
        }}
        onChange={handleTableChange}
        bordered
      />

      <Lista
        open={open}
        onClose={() => setOpen(false)}
        loading={loading}
        detalle={detalle}
        title="Detalle del Afiliado"
        fields={[
          { key: "nroAfiliado", label: "Nro Afiliado" },
          { key: "dni", label: "DNI" },
          { key: "nombre", label: "Nombre" },
          { key: "apellido", label: "Apellido" },
          { key: "planMedico", label: "Plan Médico" },
          { key: "email", label: "Email" },
          { key: "telefono", label: "Teléfono" },
          { key: "ciudad", label: "Ciudad" },
          { key: "provincia", label: "Provincia" },
          {
            key: "grupoFamiliar",
            label: "Grupo Familiar",
            subFields: [
              { key: "nombre" },
              { key: "apellido" },
              { key: "dni" },
              { key: "planMedico" },
            ],
          },
        ]}
      />

      {/* Botón de Historia Clínica flotante cuando hay detalle abierto */}
      {open && (
        <Button
          icon={<FileTextOutlined />}
          style={{
            position: "fixed",
            bottom: 40,
            right: 40,
            backgroundColor: "#444",
            color: "#fff",
            border: "none",
          }}
          onClick={fetchHistoriaClinica}
          loading={loadingHistoria}
        >
          Ver Historia Clínica
        </Button>
      )}

      {/* Card de Historia Clínica */}
      {showHistoria && historia && (
        <Card
          title="Historia Clínica"
          style={{
            width: 600,
            maxHeight: "80vh",
            overflowY: "auto",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1100,
          }}
          extra={
            <Button size="small" onClick={() => setShowHistoria(false)}>
              X
            </Button>
          }
        >
          {historia.turnos.map((t) => (
            <Card
              key={t.id}
              size="small"
              title={`${t.especialidad} - ${new Date(t.fecha).toLocaleDateString()}`}
              style={{ marginBottom: 12 }}
            >
              <p>Estado: {t.estado}</p>
              <h4>Notas:</h4>
              <ul>
                {t.notas.map((n) => (
                  <li key={n.id}>
                    {new Date(n.fecha).toLocaleString()} — {n.texto}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </Card>
      )}
    </div>
  )
}

export default Pacientes
