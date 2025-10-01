import React from "react"
import { Row, Col, Card, Typography, Calendar } from "antd"

const { Title, Text } = Typography

const Inicio = () => {
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
                    25
                  </Title>
                  <Text type="secondary">Citas Pendientes</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ borderRadius: 8, textAlign: "center" }}>
                  <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                    150
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
                    +999
                  </Title>
                  <Text type="secondary">Historial de Citas</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ borderRadius: 8, textAlign: "center" }}>
                  <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                    +999
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
            <Title level={5} style={{ marginTop: 16 }}>
              25/09/25 -
            </Title>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Inicio
