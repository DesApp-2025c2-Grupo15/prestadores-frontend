import React from "react";
import { Layout, Menu, Input } from "antd"
import { UserOutlined, CalendarOutlined, FileTextOutlined, SearchOutlined } from "@ant-design/icons"
import { Link, Outlet } from "react-router-dom"

const { Header, Sider, Content } = Layout

const Dashboard = () => {
  return (
    <Layout style={{ minHeight: "100vh", width: "100vw" }}>
      <Sider width={200} style={{ background: "#fff",paddingTop: "40px" }}>
        <Menu mode="inline" defaultSelectedKeys={["pacientes"]} style={{ height: "100%" }}>
          <Menu.Item key="turnos" icon={<FileTextOutlined />}>
            <Link to="turnospendientes">Turnos Pendientes</Link> 
          </Menu.Item>
          <Menu.Item key="pacientes" icon={<UserOutlined />}>
            <Link to="pacientes">Pacientes</Link>
          </Menu.Item>
          <Menu.Item key="calendario" icon={<CalendarOutlined />}>
            <Link to="calendario">Calendario</Link>
          </Menu.Item>
          <Menu.Item key="solicitudes" icon={<FileTextOutlined />}>
            <Link to="solicitudes">Solicitudes</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout style={{ padding: "24px", background: "#f0f2f5" }}>
        <Header style={{ background: "#fff", padding: "0 16px", marginBottom: 16 }}>
          <Input placeholder="DNI Paciente" prefix={<SearchOutlined />} style={{ width: 300 }} />
        </Header>

        <Content style={{ padding: 24, background: "#fff", minHeight: 280 }}>
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  )
}

export default Dashboard
