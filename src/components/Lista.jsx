import { Card, Spin } from "antd"
import React from "react"

const Lista = ({ open, onClose, loading, detalle, fields, title = "Detalle" }) => {
  if (!open) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Card
        title={title}
        style={{
          width: 600,
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <Spin />
        ) : detalle ? (
          <div>
            {fields.map((field) => {
              const value = detalle[field.key]
              if (Array.isArray(value)) {
                return (
                  <div key={field.key}>
                    <h4>{field.label}</h4>
                    <ul>
                      {value.map((item, idx) => (
                        <li key={item.id || idx}>
                          {field.subFields
                            ?.map((sub) => item[sub.key])
                            .filter(Boolean)
                            .join(" — ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              }
              return (
                <p key={field.key}>
                  <b>{field.label}:</b> {value ?? "No disponible"}
                </p>
              )
            })}
          </div>
        ) : (
          <p>No hay datos disponibles.</p>
        )}
      </Card>
    </div>
  )
}

export default Lista
