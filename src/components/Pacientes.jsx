import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  message,
  Modal,
  Grid,
  Typography,
} from "antd";
import { EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import {
  getAfiliados,
  getAfiliadoById,
  getHistoriaClinica,
  getAfiliadoByDni,
} from "../services/afiliados";
import Lista from "./Lista";

const { useBreakpoint } = Grid;
const { Title } = Typography;

const Pacientes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [open, setOpen] = useState(false);
  const [historia, setHistoria] = useState(null);
  const [showHistoria, setShowHistoria] = useState(false);
  const [loadingHistoria, setLoadingHistoria] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const screens = useBreakpoint();

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const result = await getAfiliados({ page: page - 1, size: pageSize });
      if (result?.items) {
        setData(result.items);
        setPagination((p) => ({
          ...p,
          total: result.total ?? p.total,
          current: page,
          pageSize,
        }));
      } else if (Array.isArray(result)) {
        setData(result);
        setPagination((p) => ({
          ...p,
          total: result.length,
          current: page,
          pageSize,
        }));
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error al traer afiliados:", error);
      message.error("No se pudieron cargar los afiliados");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const showDetalle = async (id) => {
    setDetalle(null);
    try {
      setLoadingDetalle(true);
      let result = await getAfiliadoById(id);

      if (!result) {
        const local = data.find((it) => Number(it.id) === Number(id));
        if (local?.dni) result = await getAfiliadoByDni(local.dni);
        if (!result && local) {
          result = {
            id: local.id,
            dni: local.dni,
            nombre: local.nombre,
            apellido: local.apellido,
            planMedico: local.planMedico,
            grupoFamiliar: [],
          };
        }
      }

      if (!result) {
        message.error(`Detalle no disponible para afiliado ${id}`);
        return;
      }

      const normalized = {
        ...result,
        grupoFamiliar: Array.isArray(result?.grupoFamiliar)
          ? result.grupoFamiliar
          : result?.grupoFamiliar
          ? [result.grupoFamiliar]
          : [],
        historialCambios: result.historial || result.historialCambios || [],
        afiliado: result.afiliado || {},
      };

      setDetalle(normalized);
      setOpen(true);
    } catch (error) {
      console.error("Error al traer detalle:", error);
      message.error("No se pudo cargar el detalle");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleFetchHistoriaAndOpen = async () => {
    if (!detalle?.id) {
      message.info("Abre detalle del afiliado antes de ver la historia clínica");
      return;
    }

    try {
      setLoadingHistoria(true);
      const dataHist = await getHistoriaClinica(detalle.id);

      if (!dataHist) {
        setHistoria(null);
        setShowHistoria(true);
        return;
      }

      const normalized = {
        turnos: (dataHist.turnos ??
          dataHist.Turnos ??
          dataHist.turnosList ??
          []
        ).map((turno) => ({
          ...turno,
          notas: turno.notas ?? turno.Notas ?? [],
        })),
        ...dataHist,
      };
      setHistoria(normalized);
      setShowHistoria(true);
    } catch (err) {
      console.error("Error al traer historia clínica:", err);
      message.error("Error al obtener historia clínica");
    } finally {
      setLoadingHistoria(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 80,
    },
    {
      title: "DNI",
      dataIndex: "dni",
      key: "dni",
      align: "center",
      width: 100,
    },
    {
      title: "Nombre",
      key: "nombre",
      align: "center",
      render: (_, record) => `${record.nombre} ${record.apellido}`,
    },
    {
      title: "Plan Médico",
      dataIndex: "planMedico",
      key: "planMedico",
      align: "center",
    },
    {
      title: "Titular",
      dataIndex: "titular",
      key: "titular",
      align: "center",
      render: (val) => (val ? "Sí" : "No"),
    },
    {
      title: "Detalle",
      key: "detalle",
      align: "center",
      width: 100,
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => showDetalle(record.id)}
          size={screens.xs ? "small" : "middle"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: screens.xs ? "0 8px" : "0 12px",
            height: screens.xs ? 28 : 32,
          }}
        />
      ),
    },
  ];

  const handleTableChange = (pag) => {
    setPagination(pag);
    fetchData(pag.current, pag.pageSize);
  };

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
        <Title level={4} style={{ marginBottom: 16 }}>
          Afiliados
        </Title>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              position: ["bottomCenter"],
            }}
            onChange={handleTableChange}
            bordered
            scroll={{ x: "max-content" }} // ✅ scroll horizontal activado
            style={{
              width: "100%",
            }}
          />
        </div>
      </Card>

      {/* Modal Detalle Afiliado */}
      <Lista
        open={open}
        onClose={() => setOpen(false)}
        loading={loadingDetalle}
        detalle={detalle}
        title="Detalle del Afiliado"
        fields={[
          { key: "nroAfiliado", label: "Nro Afiliado" },
          { key: "dni", label: "DNI" },
          { key: "nombre", label: "Nombre" },
          { key: "apellido", label: "Apellido" },
          { key: "planMedico", label: "Plan Médico" },
          { key: "email", label: "Email" },
          { key: "telefono", label: "Teléfono" },
          { key: "ciudad", label: "Ciudad" },
          { key: "provincia", label: "Provincia" },
          {
            key: "grupoFamiliar",
            label: "Grupo Familiar",
            subFields: [
              { key: "nombre", label: "Nombre" },
              { key: "apellido", label: "Apellido" },
              { key: "dni", label: "DNI" },
              { key: "planMedico", label: "Plan Médico" },
            ],
          },
        ]}
      >
        <div style={{ marginTop: 12, textAlign: "right" }}>
          <Button
            icon={<FileTextOutlined />}
            onClick={handleFetchHistoriaAndOpen}
            loading={loadingHistoria}
          >
            Ver Historia Clínica
          </Button>
        </div>
      </Lista>

      {/* Modal Historia Clínica */}
      <Modal
        open={showHistoria}
        title="Historia Clínica"
        footer={null}
        onCancel={() => setShowHistoria(false)}
        width={700}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        {Array.isArray(historia?.turnos) && historia.turnos.length > 0 ? (
          historia.turnos.map((t) => (
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
                {(Array.isArray(t.notas) ? t.notas : []).map((n) => (
                  <li key={n.id || n.fecha}>
                    {new Date(n.fecha).toLocaleString()} — {n.texto}
                  </li>
                ))}
              </ul>
            </Card>
          ))
        ) : (
          <p>No hay historia clínica disponible.</p>
        )}
      </Modal>
    </div>
  );
};

export default Pacientes;
