import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  message,
  Card,
  Space,
  Grid,
  Typography,
} from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  getRecetas,
  getRecetaById,
  crearReceta,
  actualizarReceta,
  cambiarEstadoReceta,
} from "../services/recetas";
import Lista from "./Lista";
import EditorModal from "./EditorModal";
import StateChangeModal from "./StateChangeModal";
import ObservationModal from "./ObservationModal";

const { useBreakpoint } = Grid;
const { Title } = Typography;

const Recetas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [open, setOpen] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // editor (create / edit)
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("create");
  const [editorItem, setEditorItem] = useState(null);

  // state change / observation
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCurrentState, setSelectedCurrentState] = useState(null);
  const [obsModalOpen, setObsModalOpen] = useState(false);

  const screens = useBreakpoint();

  // campo schema para EditorModal (reutilizable)
  const recetaFields = [
    { name: "tipo", label: "Tipo", type: "text" },
    { name: "afiliadoId", label: "Afiliado ID", type: "number", rules: [{ required: true }] },
    { name: "medicamento", label: "Medicamento", type: "text", rules: [{ required: true }] },
    { name: "dosis", label: "Dosis", type: "text", rules: [{ required: true }] },
    {
      name: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "RECIBIDO", label: "RECIBIDO" },
        { value: "EN_ANALISIS", label: "EN_ANALISIS" },
        { value: "APROBADO", label: "APROBADO" },
        { value: "OBSERVADO", label: "OBSERVADO" },
        { value: "RECHAZADO", label: "RECHAZADO" },
      ],
      rules: [{ required: true }],
    },
    { name: "fechaCreacion", label: "Fecha Creación", type: "date" },
    { name: "observacion", label: "Observación", type: "textarea" },
  ];

  // reglas de transiciones simples (sin motivo)
  const transitionMap = {
    RECIBIDO: ["EN_ANALISIS"],
    EN_ANALISIS: ["APROBADO"],
    APROBADO: [],
    OBSERVADO: [],
    RECHAZO: [],
    RECHAZADO: [],
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getRecetas().catch(() => null);
      const items = res?.items ?? res ?? [];
      setData(items);
    } catch (err) {
      console.error("Error al cargar recetas:", err);
      message.error("No se pudieron cargar recetas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showDetalle = async (id) => {
    setDetalle(null);
    try {
      setLoadingDetalle(true);
      const detail = await getRecetaById(id).catch(() => null);
      if (!detail) {
        const local = data.find((r) => String(r.id) === String(id));
        if (local) {
          setDetalle({
            ...local,
            historialCambios: local.historial || local.historialCambios || [],
            afiliado: local.afiliado || {},
          });
          setOpen(true);
          return;
        }
        message.error(`Detalle no disponible para la receta ${id}`);
        return;
      }
      setDetalle({
        ...detail,
        historialCambios: detail.historial || detail.historialCambios || [],
        afiliado: detail.afiliado || {},
      });
      setOpen(true);
    } catch (err) {
      console.error("Error traer detalle receta:", err);
      message.error("No se pudo cargar el detalle");
    } finally {
      setLoadingDetalle(false);
    }
  };

  // abrir editor create
  const handleOpenCreate = () => {
    setEditorMode("create");
    setEditorItem({
      tipo: "RECETA",
      estado: "RECIBIDO",
      afiliadoId: "",
      medicamento: "",
      dosis: "",
    });
    setEditorOpen(true);
  };

  // abrir editor edit (normaliza valores para el formulario)
  const handleOpenEdit = async (id) => {
    const detail =
      (await getRecetaById(id).catch(() => null)) ||
      data.find((r) => String(r.id) === String(id));
    if (!detail) {
      message.error("No se encontró la receta para editar");
      return;
    }
    setEditorMode("edit");
    setEditorItem({
      ...detail,
      afiliadoId: detail?.afiliado?.id ?? detail?.afiliadoId ?? "",
      fechaCreacion: detail?.fechaCreacion ?? null,
      observacion: detail?.observacion ?? detail?.observaciones ?? "",
    });
    setEditorOpen(true);
  };

  // guardar create / edit -> intenta API y hace fallback mock si falla
  const handleSave = async (values) => {
    if (editorMode === "create") {
      try {
        await crearReceta(values);
        message.success("Receta creada (API)");
        await loadData();
      } catch (err) {
        // fallback local
        const newId =
          (data.reduce(
            (m, it) => Math.max(m, Number(it.id || 0)),
            0
          ) || 0) + 1;
        const newItem = {
          id: newId,
          tipo: values.tipo || "RECETA",
          medicamento: values.medicamento,
          dosis: values.dosis,
          estado: values.estado || "RECIBIDO",
          fechaCreacion: values.fechaCreacion || new Date().toISOString(),
          afiliado: { id: values.afiliadoId },
          observacion: values.observacion || "",
          historialCambios: [],
        };
        setData((d) => [newItem, ...d]);
        message.info("API no disponible: Receta creada (mock)");
      } finally {
        setEditorOpen(false);
      }
    } else {
      // edit
      try {
        const id = editorItem?.id;
        if (!id) throw new Error("ID faltante");
        await actualizarReceta(id, values);
        message.success("Receta actualizada (API)");
        await loadData();
        if (open && detalle?.id === id) showDetalle(id);
      } catch (err) {
        // fallback local update
        const updated = {
          ...editorItem,
          ...values,
          afiliado: {
            id: values.afiliadoId ?? editorItem?.afiliado?.id,
          },
          fechaCreacion:
            values.fechaCreacion ??
            editorItem?.fechaCreacion ??
            new Date().toISOString(),
        };
        setData((d) =>
          d.map((it) =>
            String(it.id) === String(updated.id) ? updated : it
          )
        );
        if (open && detalle?.id === updated.id) setDetalle(updated);
        message.info("API no disponible: Receta actualizada (mock)");
        setEditorOpen(false);
      }
    }
  };

  const handleDeleteLocal = (item) => {
    // eliminar local (API delete not implemented here)
    setData((d) => d.filter((it) => String(it.id) !== String(item.id)));
    message.success("Receta eliminada (mock)");
    if (open && detalle?.id === item.id) setOpen(false);
    setEditorOpen(false);
  };

  // Estado simple (sin motivo)
  const openChangeState = (id, currentState) => {
    setSelectedId(id);
    setSelectedCurrentState(currentState);
    setStateModalOpen(true);
  };

  const handleConfirmChangeState = async ({ newState, motivo = null }) => {
    if (!selectedId) return;
    try {
      await cambiarEstadoReceta(selectedId, {
        nuevoEstado: newState,
        motivo,
        usuario: "usuario.app",
      });
      message.success("Estado actualizado (API)");
      await loadData();
      if (open && detalle?.id === selectedId) showDetalle(selectedId);
    } catch (err) {
      // fallback mock: aplica estado y agrega historial si hay motivo
      setData((d) =>
        d.map((it) =>
          String(it.id) === String(selectedId)
            ? {
                ...it,
                estado: newState,
                historialCambios: motivo
                  ? [
                      {
                        fecha: new Date().toISOString(),
                        usuario: "mock",
                        accion: newState,
                        motivo,
                      },
                      ...(it.historialCambios || []),
                    ]
                  : it.historialCambios,
              }
            : it
        )
      );
      if (open && detalle?.id === selectedId)
        setDetalle((prev) => ({
          ...prev,
          estado: newState,
          historialCambios: motivo
            ? [
                {
                  fecha: new Date().toISOString(),
                  usuario: "mock",
                  accion: newState,
                  motivo,
                },
                ...(prev.historialCambios || []),
              ]
            : prev.historialCambios,
        }));
      message.info("API no disponible: Estado actualizado (mock)");
    } finally {
      setStateModalOpen(false);
      setSelectedId(null);
    }
  };

  // Observar / Rechazar (motivo obligatorio)
  const openObservation = (id, currentState) => {
    setSelectedId(id);
    setSelectedCurrentState(currentState);
    setObsModalOpen(true);
  };

  const handleConfirmObservation = async ({ estado, motivo }) => {
    if (!selectedId) return;
    try {
      await cambiarEstadoReceta(selectedId, {
        nuevoEstado: estado,
        motivo,
        usuario: "usuario.app",
      });
      message.success("Acción realizada (API)");
      await loadData();
      if (open && detalle?.id === selectedId) showDetalle(selectedId);
    } catch (err) {
      setData((d) =>
        d.map((it) =>
          String(it.id) === String(selectedId)
            ? {
                ...it,
                estado,
                historialCambios: [
                  {
                    fecha: new Date().toISOString(),
                    usuario: "mock",
                    accion: estado,
                    motivo,
                  },
                  ...(it.historialCambios || []),
                ],
              }
            : it
        )
      );
      if (open && detalle?.id === selectedId)
        setDetalle((prev) => ({
          ...prev,
          estado,
          historialCambios: [
            {
              fecha: new Date().toISOString(),
              usuario: "mock",
              accion: estado,
              motivo,
            },
            ...(prev.historialCambios || []),
          ],
        }));
      message.info("API no disponible: Acción guardada (mock)");
    } finally {
      setObsModalOpen(false);
      setSelectedId(null);
    }
  };

  const color = {
    RECIBIDO: "blue",
    EN_ANALISIS: "orange",
    OBSERVADO: "purple",
    APROBADO: "green",
    RECHAZADO: "red",
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80, align: "center" },
    {
      title: "Afiliado",
      render: (_, r) =>
        `${r.afiliado?.nombre ?? r.afiliado?.id ?? "-"} ${r.afiliado?.apellido ?? ""}`,
      align: "center",
    },
    { title: "Medicamento", dataIndex: "medicamento", key: "medicamento", align: "center" },
    { title: "Dosis", dataIndex: "dosis", key: "dosis", align: "center" },
    {
      title: "Estado",
      dataIndex: "estado",
      render: (e) => <Tag color={color[e]}>{e}</Tag>,
      align: "center",
    },
    { title: "Fecha", dataIndex: "fechaCreacion", key: "fechaCreacion", align: "center" },
    {
      title: "Detalle",
      key: "detalle",
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => showDetalle(record.id)}
          size={screens.xs ? "small" : "middle"}
        />
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "center",
      render: (_, record) => (
        <Space size="small" direction={screens.xs ? "vertical" : "horizontal"}>
          <Button size="small" onClick={() => handleOpenEdit(record.id)}>
            Editar
          </Button>
          <Button size="small" onClick={() => openChangeState(record.id, record.estado)}>
            Cambiar estado
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: screens.sm ? 24 : 12, width: "100%" }}>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>Recetas</Title>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ width: screens.xs ? "100%" : "auto" }}
          >
            Crear receta
          </Button>
        }
        bordered={false}
        style={{
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{ pageSize: 10, position: ["bottomCenter"] }}
            bordered
            scroll={{ x: "max-content" }}
            style={{ minWidth: screens.xs ? 700 : "100%" }}
          />
        </div>

        <Lista
          open={open}
          onClose={() => setOpen(false)}
          loading={loadingDetalle}
          detalle={detalle}
          title="Detalle Receta"
          fields={[
            { key: "id", label: "ID" },
            { key: "tipo", label: "Tipo" },
            { key: "estado", label: "Estado" },
            { key: "medicamento", label: "Medicamento" },
            { key: "dosis", label: "Dosis" },
            { key: "fechaCreacion", label: "Fecha de creación" },
            {
              key: "afiliado",
              label: "Afiliado",
              subFields: [
                { key: "nombre", label: "Nombre" },
                { key: "apellido", label: "Apellido" },
                { key: "dni", label: "DNI" },
              ],
            },
            { key: "historialCambios", label: "Historial de cambios" },
          ]}
        />

        <EditorModal
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          mode={editorMode}
          initialValues={editorItem}
          fields={recetaFields}
          title={editorMode === "create" ? "Crear Receta" : "Editar Receta"}
          onSave={handleSave}
          onDelete={editorMode === "edit" ? handleDeleteLocal : undefined}
        />

        <StateChangeModal
          open={stateModalOpen}
          onClose={() => setStateModalOpen(false)}
          currentState={selectedCurrentState}
          // todas las opciones — el modal pedirá motivo si elige OBSERVADO/RECHAZO
          allowedStates={["EN_ANALISIS", "APROBADO", "OBSERVADO", "RECHAZADO"]}
          onConfirm={handleConfirmChangeState}
        />

        {/* ObservationModal: forzar solo OBSERVADO / RECHAZADO y motivo obligatorio */}
        <ObservationModal
          open={obsModalOpen}
          onClose={() => setObsModalOpen(false)}
          onConfirm={handleConfirmObservation}
          options={[
            { value: "OBSERVADO", label: "Observar" },
            { value: "RECHAZADO", label: "Rechazar" },
          ]}
          defaultEstado="OBSERVADO"
        />
      </Card>
    </div>
  );
};

export default Recetas;
