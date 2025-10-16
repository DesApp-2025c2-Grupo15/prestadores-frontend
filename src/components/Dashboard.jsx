import React, { useState } from "react"
import { Layout, Menu, Input, message, Card } from "antd"
import { UserOutlined, CalendarOutlined, FileTextOutlined, SearchOutlined, MedicineBoxOutlined } from "@ant-design/icons"
import { Link, Outlet } from "react-router-dom"
import { getAfiliadoByDni } from "../services/afiliados"

const { Header, Sider, Content } = Layout

const Dashboard = () => {
  const [dni, setDni] = useState("")
  const [afiliado, setAfiliado] = useState(null)

  const buscarAfiliado = async (value) => {
    if (!value) {
      message.warning("Por favor ingrese un DNI")
      return
    }
    try {
      const data = await getAfiliadoByDni(value)
      if (data) {
        message.success(`Afiliado encontrado: ${data.nombre} ${data.apellido}`)
        setAfiliado(data)
      } else {
        message.error("No se encontró afiliado con ese DNI")
        setAfiliado(null)
      }
    } catch (err) {
      console.error("Error buscando afiliado:", err)
      message.error("Hubo un problema en la búsqueda")
    }
  }

  return (
    <Layout style={{ minHeight: "100vh", width: "100vw" }}>
      {/* Sidebar */}
      <Sider width={250} style={{ background: "#fff", paddingTop: "40px" }}>
        <Menu mode="inline" defaultSelectedKeys={["inicio"]} style={{ height: "100%" }}>
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
        <Header style={{ background: "#fff", padding: "0 16px", marginBottom: 16 }}>
          <Input.Search
            placeholder="DNI Paciente"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={dni}
            onChange={(e) => {
              setDni(e.target.value)
              if (e.target.value === "") {
              setAfiliado(null) // limpia el resultado cuando borrás el DNI
              }
            }}
            onSearch={buscarAfiliado}
            enterButton="Buscar"
            
          />
        </Header>

        <Content style={{ padding: 24, background: "#fff", minHeight: 280 }}>
          {/* Si hay afiliado, lo mostramos */}
          {afiliado ? (
            <Card title={`${afiliado.nombre} ${afiliado.apellido}`} style={{ width: 400 }}>
              <p><b>DNI:</b> {afiliado.dni}</p>
              <p><b>Plan Medico:</b> {afiliado.planMedico}</p>

            </Card>
          ) : (
            <Outlet /> 
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

export default Dashboard
