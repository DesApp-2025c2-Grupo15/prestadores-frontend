import React, { useState } from "react"
import {
  Layout,
  Menu,
  Input,
  message,
  Card,
  Space,
  Button,
  Grid,
} from "antd"
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons"
import { Link, Outlet, useLocation } from "react-router-dom"
import { getAfiliadoByDni } from "../services/afiliados"

const { Sider, Content } = Layout
const { useBreakpoint } = Grid

const Dashboard = () => {
  const [search, setSearch] = useState("")
  const [afiliado, setAfiliado] = useState(null)
  const [loading, setLoading] = useState(false)
  const screens = useBreakpoint()
  const location = useLocation()

  const handleSearch = async (value) => {
    if (!value?.trim()) {
      message.warning("Ingrese un término de búsqueda")
      return
    }

    try {
      setLoading(true)
      const data = await getAfiliadoByDni(value.trim())
      if (data) {
        message.success(`Afiliado encontrado: ${data.nombre} ${data.apellido}`)
        setAfiliado(data)
      } else {
        message.error("No se encontró afiliado con ese criterio")
        setAfiliado(null)
      }
    } catch (err) {
      console.error("Error buscando afiliado:", err)
      message.error("Hubo un problema en la búsqueda")
      setAfiliado(null)
    } finally {
      setLoading(false)
    }
  }

  const limpiarBusqueda = () => {
    setAfiliado(null)
    setSearch("")
  }

  return (
    <Layout style={{ minHeight: "100vh", width: "100vw" }}>
      <Layout>
        {/* Sidebar responsive */}
        <Sider
          breakpoint="md"
          collapsedWidth="0"
          style={{
            background: "#fff",
            marginTop: 25,
            padding: 20,
            borderRight: "1px solid #f0f0f0",
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={[location.pathname]}
            style={{ height: "100%", border: "none" }}
          >
            <Menu.Item key="inicio" icon={<FileTextOutlined />}>
              <Link to="inicio">Inicio</Link>
            </Menu.Item>

            <Menu.Item key="turnos" icon={<FileTextOutlined />}>
              <Link to="turnospendientes">Turnos Pendientes</Link>
            </Menu.Item>

            <Menu.Item key="pacientes" icon={<UserOutlined />}>
              <Link to="pacientes">Pacientes</Link>
            </Menu.Item>

            {/* ✅ Siempre visible el acceso al calendario */}
            <Menu.Item key="calendario" icon={<CalendarOutlined />}>
              <Link to="calendario">Calendario</Link>
            </Menu.Item>

            <Menu.SubMenu
              key="solicitudes"
              icon={<FileTextOutlined />}
              title="Solicitudes"
            >
              <Menu.Item key="recetas">
                <Link to="recetas">Recetas</Link>
              </Menu.Item>
              <Menu.Item key="reintegros">
                <Link to="reintegros">Reintegros</Link>
              </Menu.Item>
              <Menu.Item key="autorizaciones">
                <Link to="autorizaciones">Autorizaciones</Link>
              </Menu.Item>
            </Menu.SubMenu>

            <Menu.Item key="situaciones" icon={<MedicineBoxOutlined />}>
              <Link to="situaciones">Situaciones Terapéuticas</Link>
            </Menu.Item>
          </Menu>
        </Sider>

        {/* Contenido principal */}
        <Layout style={{ padding: "24px", background: "#f0f2f5" }}>
          <Content
            style={{
              padding: 24,
              background: "#fff",
              minHeight: 280,
              borderRadius: 8,
            }}
          >
            {/* Buscador */}
            <Card
              style={{
                marginBottom: 16,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <Space
                direction={screens.sm ? "horizontal" : "vertical"}
                size="middle"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Input.Search
                  placeholder="Buscar por nro afiliado / apellido / teléfono"
                  enterButton="Buscar"
                  size="large"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onSearch={handleSearch}
                  loading={loading}
                  style={{
                    width: "100%",
                    maxWidth: 600,
                  }}
                  allowClear
                />
                {afiliado && (
                  <Button
                    onClick={limpiarBusqueda}
                    style={{
                      width: screens.sm ? "auto" : "100%",
                      maxWidth: 600,
                    }}
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </Space>
            </Card>

            {/* Resultado de búsqueda o rutas */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 16,
              }}
            >
              {afiliado ? (
                <Card
                  title={`${afiliado.nombre} ${afiliado.apellido}`}
                  style={{
                    flex: "1 1 300px",
                    maxWidth: 400,
                    minWidth: 280,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                  extra={
                    <Button type="link" onClick={limpiarBusqueda}>
                      ✕
                    </Button>
                  }
                >
                  <p>
                    <b>DNI:</b> {afiliado.dni}
                  </p>
                  <p>
                    <b>Plan Médico:</b> {afiliado.planMedico}
                  </p>
                  <p>
                    <b>Titular:</b> {afiliado.titular ? "Sí" : "No"}
                  </p>
                </Card>
              ) : (
                <Outlet />
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Dashboard
