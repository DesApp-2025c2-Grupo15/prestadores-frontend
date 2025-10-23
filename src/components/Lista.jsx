import React from "react";
import { Modal, Spin, Descriptions, Tag, Grid } from "antd";

const { useBreakpoint } = Grid;

const renderValue = (value) => {
  if (value == null) return "-";
  if (Array.isArray(value)) return value.length === 0 ? "-" : value;
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
  return map[estado] || "default";
}

const Lista = ({
  open,
  onClose,
  loading,
  detalle,
  fields = [],
  title = "Detalle",
  children,
}) => {
  const screens = useBreakpoint()

  return (
    <Modal
      open={!!open}
      onCancel={onClose}
      footer={null}
      title={title}
      // ancho del modal ajustable según dispositivo
      width={screens.xs ? "95%" : screens.sm ? 700 : 800}
      bodyStyle={{
        padding: screens.xs ? "12px 8px" : "24px",
        overflowX: "auto",
      }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin />
        </div>
      ) : !detalle ? (
        <p>No hay datos disponibles.</p>
      ) : (
        <>
          <Descriptions
            bordered
            size={screens.xs ? "small" : "middle"}
            column={screens.xs ? 1 : 2} // en móviles, una sola columna
            style={{
              wordBreak: "break-word",
              fontSize: screens.xs ? 13 : 14,
            }}
          >
            {fields.map((f) => {
              const val = detalle[f.key];
              if (!f.subFields) {
                if (Array.isArray(val)) {
                  return (
                    <Descriptions.Item key={f.key} label={f.label}>
                      {val.length === 0 ? (
                        "-"
                      ) : (
                        val.map((it, i) => (
                          <div
                            key={it.id ?? i}
                            style={{
                              marginBottom: 8,
                              padding: 8,
                              border: "1px solid #eee",
                              borderRadius: 6,
                              background: "#fafafa",
                            }}
                          >
                            {Object.entries(it).map(([k, v]) => (
                              <div key={k}>
                                <b>{k}:</b> {v == null ? "-" : String(v)}
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </Descriptions.Item>
                  );
                }
                return (
                  <Descriptions.Item key={f.key} label={f.label}>
                    {val ?? "-"}
                  </Descriptions.Item>
                );
              }
              const parent = detalle[f.key] || {};
              return (
                <Descriptions.Item key={f.key} label={f.label}>
                  <div>
                    {f.subFields.map((sf) => (
                      <div key={sf.key}>
                        <b>{sf.label}:</b> {parent[sf.key] ?? "-"}
                      </div>
                    ))}
                  </div>
                </Descriptions.Item>
              )
            })}
          </Descriptions>

          {/* children es opcional — componentes que necesiten contenido extra lo pasan */}
          {children && (
            <div style={{ marginTop: 16, width: "100%" }}>{children}</div>
          )}
        </>
      )}
    </Modal>
  )
}

export default Lista