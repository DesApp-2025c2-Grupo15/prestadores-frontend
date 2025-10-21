import React from "react"
import { Modal, Spin, Descriptions, Tag, Grid } from "antd"

const { useBreakpoint } = Grid

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
    PENDIENTE: "orange",
  }
  return map[estado?.toUpperCase()] || "default"
}

export default function DetalleModal({
  open,
  onClose,
  loading,
  detalle,
  title,
  fields = [],
}) {
  const screens = useBreakpoint()

  // Calculamos el ancho dinámicamente
  const modalWidth = screens.xs ? "95%" : screens.sm ? 600 : 800
  const columns = screens.xs ? 1 : screens.sm ? 2 : 3

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={title}
      width={modalWidth}
      centered
      bodyStyle={{
        padding: screens.xs ? "12px" : "24px",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin />
        </div>
      ) : !detalle ? (
        <p style={{ textAlign: "center", color: "#999" }}>
          No hay detalle para mostrar.
        </p>
      ) : (
        <Descriptions
          column={columns}
          bordered
          size={screens.xs ? "middle" : "small"}
          style={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {fields.map((f) => {
            const val = detalle[f.key]

            // Estado con color
            if (f.key === "estado") {
              return (
                <Descriptions.Item key={f.key} label={f.label}>
                  <Tag color={getColor(val)}>{val || "-"}</Tag>
                </Descriptions.Item>
              )
            }

            // Array de objetos (por ejemplo, notas)
            if (Array.isArray(val)) {
              return (
                <Descriptions.Item key={f.key} label={f.label} span={columns}>
                  {val.length === 0 ? (
                    "-"
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {val.map((it, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#fafafa",
                            border: "1px solid #eee",
                            borderRadius: 6,
                            padding: "8px 12px",
                            fontSize: screens.xs ? 13 : 14,
                          }}
                        >
                          {Object.entries(it).map(([k, v]) => (
                            <div key={k}>
                              <b>{k}:</b> {v == null ? "-" : String(v)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </Descriptions.Item>
              )
            }

            // Subcampos (objeto anidado)
            if (f.subFields) {
              const parent = detalle[f.key] || {}
              return (
                <Descriptions.Item key={f.key} label={f.label}>
                  <div>
                    {f.subFields.map((sf) => (
                      <div key={sf.key}>
                        <b>{sf.label}:</b> {renderValue(parent[sf.key])}
                      </div>
                    ))}
                  </div>
                </Descriptions.Item>
              )
            }

            // Valor plano
            return (
              <Descriptions.Item key={f.key} label={f.label}>
                {renderValue(val)}
              </Descriptions.Item>
            )
          })}
        </Descriptions>
      )}
    </Modal>
  )
}
