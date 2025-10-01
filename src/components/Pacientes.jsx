import React, { useEffect, useState } from "react"
import { Table, Button } from "antd"
import { EyeOutlined } from "@ant-design/icons"
import { getAfiliados, getAfiliadoById } from "../services/afiliados"
import Lista from "./Lista"

const Pacientes = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [open, setOpen] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

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
      const result = await getAfiliadoById(id)
      setDetalle(result)
      setOpen(true)
    } catch (error) {
      console.error("Error al traer detalle:", error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: "DNI", dataIndex: "dni", key: "dni" },
    { title: "Nombre", render: (_, record) => `${record.nombre} ${record.apellido}`, key: "nombre" },
    { title: "Plan Médico", dataIndex: "planMedico", key: "planMedico" },
    { title: "Titular", dataIndex: "titular", key: "titular", render: val => (val ? "Sí" : "No") },
    {
      title: "Detalle",
      key: "detalle",
      render: (_, record) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => showDetalle(record.id)} />
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys)
      console.log("Filas seleccionadas:", keys)
    },
  }

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
        rowSelection={rowSelection}
        bordered
      />

      <Lista
        open={open}
        onClose={() => setOpen(false)}
        loading={loading}
        detalle={detalle}
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
    </div>
  )
}

export default Pacientes
