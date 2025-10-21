import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  Select,
  Space,
  message,
  Grid,
  Typography,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { getTurnos, getEspecialidades } from "../services/turnos_pendientes";
import Lista from "./Lista";

const { Option } = Select;
const { useBreakpoint } = Grid;
const { Title } = Typography;

const TurnosPendientes = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const screens = useBreakpoint();

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarTurnos();
  }, [especialidadSeleccionada]);

  const cargarDatos = async () => {
    try {
      const especialidadesData = await getEspecialidades();
      setEspecialidades(especialidadesData);
      cargarTurnos();
    } catch (err) {
      message.error("Error al cargar datos");
    }
  };

  const cargarTurnos = async () => {
    try {
      setLoading(true);
      const data = await getTurnos(especialidadSeleccionada);
      const turnosPendientes = data.filter((t) => t.estado === "pendiente");
      setTurnos(turnosPendientes);
    } catch (err) {
      message.error("Error al cargar turnos");
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (turno) => {
    setTurnoSeleccionado(turno);
    setModalOpen(true);
  };

 const columns = [
  {
    title: "Fecha",
    dataIndex: "fecha",
    key: "fecha",
    render: (fecha) => new Date(fecha).toLocaleDateString(),
    align: "center",
    width: 120,
  },
  {
    title: "Hora",
    dataIndex: "hora",
    key: "hora",
    align: "center",
    width: 100,
  },
  {
    title: "Especialidad",
    dataIndex: "especialidad",
    key: "especialidad",
    align: "center",
  },
  {
    title: "Médico",
    dataIndex: "medico",
    key: "medico",
    align: "center",
  },
  {
    title: "Paciente",
    dataIndex: "paciente",
    key: "paciente",
    align: "center",
  },
  {
    title: "Estado",
    dataIndex: "estado",
    key: "estado",
    render: (estado) => (
      <Tag color={estado === "pendiente" ? "orange" : "green"}>
        {estado.toUpperCase()}
      </Tag>
    ),
    align: "center",
  },
  {
    title: "Detalles",
    key: "detalles",
    align: "center",
    width: 120,
    render: (_, record) => (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          icon={<EyeOutlined />}
          onClick={() => verDetalle(record)}
          size={screens.xs ? "small" : "middle"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: screens.xs ? "0 8px" : "0 12px",
            height: screens.xs ? 28 : 32,
          }}
        >
          Ver
        </Button>
      </div>
    ),
  },
];


  const fieldsDetalle = [
    { key: "id", label: "ID" },
    { key: "fecha", label: "Fecha" },
    { key: "hora", label: "Hora" },
    { key: "especialidad", label: "Especialidad" },
    { key: "medico", label: "Médico" },
    { key: "paciente", label: "Paciente" },
    { key: "estado", label: "Estado" },
    { key: "notas", label: "Notas" },
  ];

  return (
    <div
      style={{
        padding: screens.sm ? 24 : 12,
        width: "100%",
      }}
    >
      <Card
        bordered={false}
        style={{
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Space
          direction={screens.sm ? "horizontal" : "vertical"}
          size="middle"
          style={{
            width: "100%",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Turnos Pendientes
          </Title>

          <Select
            placeholder="Filtrar por especialidad"
            value={especialidadSeleccionada || undefined}
            onChange={(value) => setEspecialidadSeleccionada(value)}
            style={{
              width: screens.sm ? 250 : "100%",
            }}
            allowClear
          >
            {especialidades.map((esp) => (
              <Option key={esp.id} value={esp.nombre}>
                {esp.nombre}
              </Option>
            ))}
          </Select>
        </Space>

        <div
          style={{
            marginTop: 16,
          }}
        >
          <Table
            columns={columns}
            dataSource={turnos}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              position: ["bottomCenter"],
            }}
            bordered
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: "No hay turnos pendientes",
            }}
            style={{
              width: "100%",
            }}
          />
        </div>
      </Card>

      {/* Modal de detalle */}
      <Lista
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={loadingDetalle}
        detalle={turnoSeleccionado}
        fields={fieldsDetalle}
        title="Detalle del Turno"
      />
    </div>
  );
};

export default TurnosPendientes;