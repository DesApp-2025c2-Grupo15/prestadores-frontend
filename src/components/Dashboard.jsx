import React, { useState } from "react"
import { Layout, Menu, Input, message, Card, Space, Button } from "antd"
import { UserOutlined, CalendarOutlined, FileTextOutlined, SearchOutlined, MedicineBoxOutlined } from "@ant-design/icons"
import { Link, Outlet } from "react-router-dom"
import { getAfiliadoByDni } from "../services/afiliados"

const { Sider, Content } = Layout

const Dashboard = () => {
  const [search, setSearch] = useState("")
  const [afiliado, setAfiliado] = useState(null)
  const [loading, setLoading] = useState(false)
  

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
      <Layout style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        <Sider  width={300} style={{ background: "#fff",marginTop: 25 ,padding: 20 }}>
          <Menu mode="inline" defaultSelectedKeys={["inicio"]} style={{ height: "100%", border: "none" }}>
            <Menu.Item key="inicio" icon={<FileTextOutlined />}>
              <Link to="inicio">Inicio</Link>
            </Menu.Item>
            <Menu.Item key="turnos" icon={<FileTextOutlined />}>
              <Link to="turnospendientes">Turnos Pendientes</Link>
            </Menu.Item>
            <Menu.Item key="pacientes" icon={<UserOutlined />}>
              <Link to="pacientes">Pacientes</Link>
            </Menu.Item>
            <Menu.Item key="calendario" icon={<CalendarOutlined />}>
              <Link to="calendario">Calendario</Link>
            </Menu.Item>

            {/* Submenú Solicitudes */}
            <Menu.SubMenu key="solicitudes" icon={<FileTextOutlined />} title="Solicitudes">
              <Menu.Item key="solicitudes/recetas">
                <Link to="recetas">Recetas</Link>
              </Menu.Item>
              <Menu.Item key="solicitudes/reintegros">
                <Link to="reintegros">Reintegros</Link>
              </Menu.Item>
              <Menu.Item key="solicitudes/autorizaciones">
                <Link to="autorizaciones">Autorizaciones</Link>
              </Menu.Item>
            </Menu.SubMenu>

            <Menu.Item key="situaciones" icon={<MedicineBoxOutlined />}>
              <Link to="situaciones">Situaciones Terapéuticas</Link>
            </Menu.Item>
          </Menu>
        </Sider>

        {/* Contenido */}
        <Layout style={{ padding: "24px", background: "#f0f2f5" }}>
          <Content style={{ padding: 24, background: "#fff", minHeight: 280 }}>
            {/* Buscador sobre el contenido */}
            <Card style={{ marginBottom: 16, border: "none" }}>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Input.Search
                  placeholder="Buscar por nro afiliado / apellido / teléfono"
                  enterButton="Buscar"
                  size="large"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onSearch={handleSearch}
                  loading={loading}
                  style={{ width: 400 }}
                  allowClear
                />
                {afiliado && (
                  <Button onClick={limpiarBusqueda}>
                    Limpiar búsqueda
                  </Button>
                )}
              </Space>
            </Card>
            {/* Si hay afiliado encontrado, lo mostramos */}
            {afiliado ? (
              <Card 
                title={`${afiliado.nombre} ${afiliado.apellido}`} 
                style={{ width: 400 }}
                extra={<Button type="link" onClick={limpiarBusqueda}>✕</Button>}
              >
                <p><b>DNI:</b> {afiliado.dni}</p>
                <p><b>Plan Médico:</b> {afiliado.planMedico}</p>
                <p><b>Titular:</b> {afiliado.titular ? "Sí" : "No"}</p>
              </Card>
            ) : (
              /* Contenido normal de las rutas */
              <Outlet />
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Dashboard