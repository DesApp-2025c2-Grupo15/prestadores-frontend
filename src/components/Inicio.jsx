import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Calendar, Grid } from "antd";
import { getHistoriaClinica, getAfiliados } from "../services/afiliados";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const Inicio = () => {
  const [stats, setStats] = useState({ citasPendientes: 0, pacientes: 0 });
  const [citas, setCitas] = useState([]);
  const screens = useBreakpoint();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ejemplo: obtiene historia clínica y afiliados
        const data = await getHistoriaClinica(1);
        const datapa = await getAfiliados();
        setCitas(data.turnos);
        setStats({
          citasPendientes: data.turnos.filter(
            (t) => t.estado === "RESERVADO"
          ).length,
          pacientes: datapa.length,
        });
      } catch (error) {
        console.error("Error al cargar datos del backend:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "16px" }}>
      <Row gutter={[16, 16]}>
        {/* Columna izquierda: Resumen e Historial */}
        <Col xs={24} md={16}>
          {/* Resumen Mensual */}
          <Card
            title="Resumen Mensual"
            bordered={false}
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card style={{ borderRadius: 8, textAlign: "center" }}>
                  <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                    {stats.citasPendientes}
                  </Title>
                  <Text type="secondary">Citas Pendientes</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
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
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card style={{ borderRadius: 8, textAlign: "center" }}>
                  <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                    {citas.length}
                  </Title>
                  <Text type="secondary">Historial de Citas</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
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

        {/* ✅ Citas Pendientes (visible solo en pantallas >= md) */}
        {screens.md && (
          <Col xs={24} md={8}>
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
                        {new Date(cita.fecha).toLocaleDateString()} -{" "}
                        {cita.especialidad}
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
        )}
      </Row>

      {/* 📱 Texto visible solo en móviles cuando se oculta el calendario */}
      {!screens.md && (
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Text type="secondary">
            📅 El calendario está disponible solo en versión escritorio.
          </Text>
        </div>
      )}
    </div>
  );
};

export default Inicio;
