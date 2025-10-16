import React, { useEffect, useState } from "react"
import { Table, Button, Tag } from "antd"
import { EyeOutlined } from "@ant-design/icons"
import { getRecetas, getRecetaById } from "../services/recetas"
import Lista from "./Lista"

const Recetas = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [open, setOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const result = await getRecetas()
    setData(result)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const showDetalle = async (id) => {
      setOpen(true)          
      setDetalle(null)       
      try {
          setLoadingDetalle(true)
          const detail = await getRecetaById(id)
          setDetalle(detail)
      } catch (error) {
          console.error("Error al traer detalle de autorización:", error)
      } finally {
      setLoadingDetalle(false)
      }
    }

  const color = {
    RECIBIDO: "blue",
    EN_ANALISIS: "orange",
    OBSERVADO: "purple",
    APROBADO: "green",
    RECHAZADO: "red",
  }

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Afiliado", render: (_, r) => `${r.afiliado?.nombre} ${r.afiliado?.apellido}` },
    { title: "Medicamento", dataIndex: "medicamento", key: "medicamento" },
    { title: "Dosis", dataIndex: "dosis", key: "dosis" },
    { title: "Estado", dataIndex: "estado", render: e => <Tag color={color[e]}>{e}</Tag> },
    { title: "Fecha", dataIndex: "fechaCreacion", key: "fechaCreacion"},
    {
          title: "Detalle",
          key: "detalle",
          render: (_, record) => (
            <Button type="text" icon={<EyeOutlined />} onClick={() => showDetalle(record.id)} />
          ),
        },
      ]

  return (
    <div style={{ padding: 16 }}>
    <h3>Recetas</h3>
    <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
    />
    <Lista
        open={open}
        onClose={() => setOpen(false)}
        loading={loading}
        detalle={detalle}
        title="Detalle Receta"
        fields={[
            { key: "id", label: "ID" },
            { key: "tipo", label: "Tipo" },
            { key: "estado", label: "Estado" },
            { key: "medicamento", label: "Medicamento" },
            { key: "dosis", label: "Dosis" },
            { key: "fechaCreacion", label: "Fecha de creación" },
            {
            key: "afiliado",
            label: "Afiliado",
            subFields: [
                { key: "nombre", label: "Nombre" },
                { key: "apellido", label: "Apellido" },
                { key: "dni", label: "DNI" },
            ],
            },
            {
            key: "historial",
            label: "Historial de cambios",
            subFields: [
                { key: "estado", label: "Estado" },
                { key: "usuario", label: "Usuario" },
                { key: "fechaCambio", label: "Fecha" },
            ],
            },
        ]}
    />
    </div>
  )
}

export default Recetas
