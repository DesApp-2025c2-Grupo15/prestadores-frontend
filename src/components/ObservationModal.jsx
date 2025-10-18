import React, { useEffect, useState } from "react"
import { Modal, Form, Radio, Input, Button, Space } from "antd"

const { TextArea } = Input

// props:
// open, onClose, onConfirm({ estado, motivo }), defaultEstado?
const ObservationModal = ({ open, onClose, onConfirm, defaultEstado = "OBSERVADO", options = null }) => {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  // Opciones por defecto (etiquetas amigables)
  const estadoOptions = options ?? [
    { value: "APROBADO", label: "Aceptado" },
    { value: "RECHAZADO", label: "Rechazado" },
    { value: "EN_ANALISIS", label: "En Análisis" },
    { value: "OBSERVADO", label: "Observar" },
  ]

  useEffect(() => {
    form.resetFields()
    form.setFieldsValue({ estado: defaultEstado, motivo: "" })
  }, [open, form, defaultEstado])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      await Promise.resolve(onConfirm ? onConfirm(values) : null)
      setSubmitting(false)
      onClose && onClose()
    } catch (e) {
      // validation errors
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={!!open}
      onCancel={onClose}
      footer={null}
      title="Observar / Rechazar"
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ estado: defaultEstado, motivo: "" }}>
        <Form.Item label="Estado" name="estado" rules={[{ required: true, message: "Seleccioná una acción" }]}>
          <Radio.Group>
            <Space direction="vertical">
              {estadoOptions.map((o) => (
                <Radio key={o.value} value={o.value}>
                  {o.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="motivo"
          label="Motivo (*)"
          rules={[{ required: true, message: "El motivo es obligatorio" }]}
        >
          <TextArea rows={5} placeholder="Ingresar motivo (obligatorio)" />
        </Form.Item>

        <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
          <Space>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="primary" onClick={handleOk} loading={submitting}>
              Guardar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ObservationModal