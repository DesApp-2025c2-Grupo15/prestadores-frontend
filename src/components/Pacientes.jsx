import React, { useEffect, useState } from "react";
import { Table, Button, Drawer, Spin } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const Pacientes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [open, setOpen] = useState(false);

  // Cargar lista de afiliados
  useEffect(() => {
    const fetchAfiliados = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/v1/prestadores/afiliados");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error al traer afiliados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAfiliados();
  }, []);

  // Ver detalle de un afiliado
  const showDetalle = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/v1/prestadores/afiliados/${id}`);
      const result = await response.json();
      setDetalle(result);
      setOpen(true);
    } catch (error) {
      console.error("Error al traer detalle del afiliado:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "DNI",
      dataIndex: "dni",
      key: "dni",
    },
    {
      title: "Nombre",
      render: (_, record) => `${record.nombre} ${record.apellido}`,
      key: "nombre",
    },
    {
      title: "Plan Médico",
      dataIndex: "planMedico",
      key: "planMedico",
    },
    {
      title: "Titular",
      dataIndex: "titular",
      key: "titular",
      render: (val) => (val ? "Sí" : "No"),
    },
    {
      title: "Detalle",
      key: "detalle",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => showDetalle(record.id)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 16 }}>Afiliados</h3>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Drawer
        title="Detalle Afiliado"
        open={open}
        onClose={() => setOpen(false)}
        width={480}
      >
        {loading ? (
          <Spin />
        ) : detalle ? (
          <div>
            <p><b>Nro Afiliado:</b> {detalle.nroAfiliado}</p>
            <p><b>DNI:</b> {detalle.dni}</p>
            <p><b>Nombre:</b> {detalle.nombre} {detalle.apellido}</p>
            <p><b>Plan Médico:</b> {detalle.planMedico}</p>
            <p><b>Email:</b> {detalle.email}</p>
            <p><b>Teléfono:</b> {detalle.telefono}</p>
            <p><b>Ciudad:</b> {detalle.ciudad}</p>
            <p><b>Provincia:</b> {detalle.provincia}</p>

            <h4>Grupo Familiar</h4>
            <ul>
              {detalle.grupoFamiliar.map((g) => (
                <li key={g.id}>
                  {g.nombre} {g.apellido} — DNI: {g.dni} — {g.planMedico}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No hay datos del afiliado.</p>
        )}
      </Drawer>
    </div>
  );
};

export default Pacientes;
