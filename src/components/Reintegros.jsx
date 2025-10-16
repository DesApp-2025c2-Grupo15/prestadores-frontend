import React, { useEffect, useState } from "react"
import { Table, Button, Tag } from "antd"
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons"
import { getReintegros, getReintegroById } from "../services/reintegros"
import Lista from "./Lista"

const Reintegros = () => {
  const [data, setData] = useState([])
  const [loadingTabla, setLoadingTabla] = useState(false)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [open, setOpen] = useState(false)

  const loadData = async () => {
    try {
      setLoadingTabla(true)
      const result = await getReintegros()
      setData(result.items || result)
    } catch (error) {
      console.error("Error al traer reintegros:", error)
    } finally {
      setLoadingTabla(false)
    }
  }

  useEffect(() => { loadData() }, [])

 const showDetalle = async (id) => {
     setOpen(true)          
     setDetalle(null)       
     try {
         setLoadingDetalle(true)
         const detail = await getReintegroById(id)
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
    { title: "Prestación", dataIndex: "prestacion", key: "prestacion" },
    { title: "Método", dataIndex: "metodo", key: "metodo" },
    { title: "Monto ($)", dataIndex: "monto", key: "monto" },
    { title: "Estado", dataIndex: "estado", render: e => <Tag color={color[e]}>{e}</Tag> },
    { title: "Fecha", dataIndex: "fechaCreacion", key: "fechaCreacion"},
    /*{
              title: "Detalle",
              key: "detalle",
              render: (_, record) => (
                <Button type="text" icon={<EyeOutlined />} onClick={() => showDetalle(record.id)} />
              ),
            },*/
  ]

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 16 }}>Reintegros</h3>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loadingTabla}
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Lista
        open={open}
        onClose={() => setOpen(false)}
        loading={loadingDetalle}
        detalle={detalle}
        title="Detalle Reintegro"
        fields={[
          { key: "id", label: "ID" },
          { key: "tipo", label: "Tipo" },
          { key: "estado", label: "Estado" },
          { key: "prestacion", label: "Prestación" },
          { key: "metodo", label: "Método" },
          { key: "monto", label: "Monto" },
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
            key: "historialCambios", 
            label: "Historial de cambios",
            subFields: [
              { key: "estado", label: "Estado" },
              { key: "usuario", label: "Usuario" },
              { key: "fechaCambio", label: "Fecha" },
              { key: "motivo", label: "Motivo" },
            ],
          },
        ]}
      />
    </div>
  )
}

export default Reintegros
