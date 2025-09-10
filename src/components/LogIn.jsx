import React from "react"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { useState } from "react"
import { Form, Input, Button, Typography, Card, message  } from "antd"
import { login } from "../services/authService"
import { useNavigate } from "react-router-dom"

const { Link, Text } = Typography

const Login = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [isFormValid, setFormValid] = useState(false)
    const [loading, setLoading] = useState(false)
    const [validationState, setValidationState] = useState({
        username: false,
        password: false,
    })

    const updateValidationState = () => {
      const values = form.getFieldsValue()
      const errors = form.getFieldsError()
      const hasErrors = errors.some(err => err.errors.length > 0)
      const allFilled = values.username && values.password
      setFormValid(allFilled && !hasErrors)
    }

  
    const onFinish = async (values) => {
      setLoading(true)
      try {
        const data = await login(values)
        message.success("Inicio de sesión exitoso")
        localStorage.setItem("token", data.token)
        navigate("/dashboard")
      } catch (err) {
        message.error(err.message || "Error al iniciar sesión")
      } finally {
        setLoading(false)
      }
    }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        background: "#0099F9",
      }}
    >
        <Card style={{
          width: "400px",
          padding: "40px",
          borderRadius: "10px",
          textAlign: "center",
          background: "transparent",
          border: "none",
        }}> 
            <Form
                form={form}
                name="login_form"
                onFinish={onFinish}
                onValuesChange={updateValidationState} 
                style={{ width: 300, margin: "0 auto" }}
                >
                {/* Username */}
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: "Por favor, ingresa tu usuario" }]}
                    style={{ color:"#FFFFFF"}}
                >
                    <Input
                    prefix={<UserOutlined style={{ color:"#FFFFFF"}}/>}
                    placeholder="DNI o CUIL"
                    size="large"
                    style={{
                        background: "transparent",color:"#FFFFFF"
                    }}
                    />
                </Form.Item>

                {/* Password */}
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: "Por favor, ingresa tu contraseña" }]}
                    style={{ color:"#FFFFFF"}}
                >
                    <Input.Password
                    prefix={<LockOutlined style={{ color:"#FFFFFF"}}/>}
                    placeholder="Contraseña"
                    size="large"
                    style={{
                        background: "transparent",color:"#FFFFFF"
                    }}
                    />
                </Form.Item>
                {/* Botón */}
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                        disabled={!isFormValid}
                        style={{
                            backgroundColor: "#ffffff",
                            color: "#2148C0",
                            fontWeight: "bold",
                            border: "none"
                        }}
                        >
                        INICIAR SESIÓN
                    </Button>
                </Form.Item>
                <Text
                    type="secondary"
                    style={{ cursor: "pointer",color: "#FFFFFF" }} >
                    ¿Olvidaste tu contraseña?
                </Text>
            </Form>
        </Card>
      </div>
  )
}
export default Login
