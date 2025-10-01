import { Card, Spin, Button } from "antd"
import React, { useState, useEffect } from "react"
import { getHistoriaClinica } from "../services/afiliados"

const Lista = ({ open, onClose, loading, detalle, fields }) => {
  const [historia, setHistoria] = useState(null)
  const [loadingHistoria, setLoadingHistoria] = useState(false)
  const [showHistoria, setShowHistoria] = useState(false)

  // Limpiar historia cuando cambia el paciente o se cierra
  useEffect(() => {
    setHistoria(null)
    setShowHistoria(false)
  }, [detalle, open])

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
      {/* Card de Detalle */}
      <Card
        title="Detalle Afiliado"
        style={{
          width: 600,
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
        extra={
          <Button
            style={{
              backgroundColor: "#444",   // gris oscuro
              color: "#fff",             // texto blanco
              border: "none"
            }}
            onClick={fetchHistoriaClinica}
            loading={loadingHistoria}
          >
            Ver Historia Clínica
          </Button>
        }
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
                      {value.map((item) => (
                        <li key={item.id}>
                          {field.subFields
                            .map((sub) => `${item[sub.key] || ""}`)
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

      {/* Card de Historia Clínica */}
      {showHistoria && historia && (
        <Card
          title="Historia Clínica"
          style={{
            width: 600,
            maxHeight: "80vh",
            overflowY: "auto",
            position: "absolute",
            zIndex: 1100,
          }}
          onClick={(e) => e.stopPropagation()}
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
              title={`${t.especialidad} - ${new Date(
                t.fecha
              ).toLocaleDateString()}`}
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

export default Lista
