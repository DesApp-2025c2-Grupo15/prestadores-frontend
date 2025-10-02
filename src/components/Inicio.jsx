import React, { useEffect, useState } from "react"
import { Row, Col, Card, Typography, Calendar } from "antd"
import { getHistoriaClinica, getAfiliados } from "../services/afiliados"

const { Title, Text } = Typography

const Inicio = () => {
  const [stats, setStats] = useState({ citasPendientes: 0, pacientes: 0 })
  const [citas, setCitas] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // trae historia clínica de un afiliado (ejemplo: id=1)
        const data = await getHistoriaClinica(1)
        const datapa = await getAfiliados() 
        console.log(datapa)
        setCitas(data.turnos)

        setStats({
          citasPendientes: data.turnos.filter((t) => t.estado === "RESERVADO").length,
          pacientes: datapa.length
        })
      } catch (error) {
        console.error("Error al cargar datos del backend:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <div style={{ padding: "16px" }}>
      <Row gutter={16}>
        <Col span={16}>
          {/* Resumen Mensual */}
          <Card
            title="Resumen Mensual"
            bordered={false}
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card style={{ borderRadius: 8, textAlign: "center" }}>
                  <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                    {stats.citasPendientes}
                  </Title>
                  <Text type="secondary">Citas Pendientes</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ borderRadius: 8, textAlign: "center" }}>
                  <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                    {stats.pacientes}
                  </Title>
                  <Text type="secondary">Nuevos Pacientes</Text>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Historial Permanente */}
          <Card
            title="Historial Permanente"
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card style={{ borderRadius: 8, textAlign: "center" }}>
                  <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                    {citas.length}
                  </Title>
                  <Text type="secondary">Historial de Citas</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ borderRadius: 8, textAlign: "center" }}>
                  <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                    {stats.pacientes}
                  </Title>
                  <Text type="secondary">Nuevos Pacientes</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Citas Pendientes */}
        <Col span={8}>
          <Card
            title="Citas Pendientes"
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Calendar fullscreen={false} />

            {/* Detalles debajo del calendario */}
            <div style={{ marginTop: 16 }}>
              {citas
                .filter((cita) => cita.estado === "RESERVADO")
                .map((cita) => (
                  <div key={cita.id} style={{ marginBottom: 12 }}>
                    <Title level={5}>
                      {new Date(cita.fecha).toLocaleDateString()} - {cita.especialidad}
                    </Title>
                    <Text type="secondary">Estado: {cita.estado}</Text>
                    <ul>
                      {cita.notas.map((nota) => (
                        <li key={nota.id}>{nota.texto}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Inicio
