import React from "react"
import { Modal, Spin, Descriptions, Tag } from "antd"

const renderValue = (value) => {
  if (value == null) return "-"
  if (Array.isArray(value)) return value.length === 0 ? "-" : value
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")
  }
  return value
}

const getColor = (estado) => {
  const map = {
    RECIBIDO: "blue",
    EN_ANALISIS: "orange",
    OBSERVADO: "purple",
    APROBADO: "green",
    RECHAZADO: "red",
  }
  return map[estado] || "default"
}

const Lista = ({ open, onClose, loading, detalle, fields = [], title = "Detalle", children }) => {
  return (
    <Modal open={!!open} onCancel={onClose} footer={null} title={title} width={800}>
      {loading ? (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin />
        </div>
      ) : !detalle ? (
        <p>No hay datos disponibles.</p>
      ) : (
        <>
          <Descriptions column={1} bordered size="small">
            {fields.map((f) => {
              const val = detalle[f.key]
              if (!f.subFields) {
                if (Array.isArray(val)) {
                  return (
                    <Descriptions.Item key={f.key} label={f.label}>
                      {val.length === 0 ? "-" : val.map((it, i) => (
                        <div key={it.id ?? i} style={{ marginBottom: 8, padding: 8, border: "1px solid #eee", borderRadius: 6 }}>
                          {Object.entries(it).map(([k, v]) => <div key={k}><b>{k}:</b> {v == null ? "-" : String(v)}</div>)}
                        </div>
                      ))}
                    </Descriptions.Item>
                  )
                }
                return <Descriptions.Item key={f.key} label={f.label}>{val ?? "-"}</Descriptions.Item>
              }
              const parent = detalle[f.key] || {}
              return (
                <Descriptions.Item key={f.key} label={f.label}>
                  <div>
                    {f.subFields.map((sf) => (
                      <div key={sf.key}><b>{sf.label}:</b> {parent[sf.key] ?? "-"}</div>
                    ))}
                  </div>
                </Descriptions.Item>
              )
            })}
          </Descriptions>

          {/* children es opcional — componentes que necesiten contenido extra lo pasan */}
          {children}
        </>
      )}
    </Modal>
  )
}

export default Lista