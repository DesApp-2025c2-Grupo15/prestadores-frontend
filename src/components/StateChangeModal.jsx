import React, { useEffect, useState } from "react"
import { Modal, Form, Select, Input } from "antd"

const { TextArea } = Input
const { Option } = Select

// props: open, onClose, currentState, allowedStates, onConfirm({ newState, motivo })
const StateChangeModal = ({ open, onClose, currentState, allowedStates = [], onConfirm }) => {
  const [form] = Form.useForm()
  const [selected, setSelected] = useState(allowedStates[0] ?? null)

  useEffect(() => {
    form.resetFields()
    setSelected(allowedStates[0] ?? null)
    form.setFieldsValue({ newState: allowedStates[0] ?? null, motivo: "" })
  }, [open, allowedStates, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const payload = { newState: values.newState, motivo: values.motivo ?? null }
      onConfirm && onConfirm(payload)
      onClose && onClose()
    } catch (e) {
      // validation errors
    }
  }

  return (
    <Modal open={!!open} title="Cambiar estado" onCancel={onClose} onOk={handleOk} okText="Confirmar" destroyOnClose>
      <Form form={form} layout="vertical" initialValues={{ newState: allowedStates[0] ?? null, motivo: "" }}>
        <Form.Item name="newState" label="Estado nuevo" rules={[{ required: true }]}>
          <Select onChange={(val) => setSelected(val)}>
            {allowedStates.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Estado actual">
          <div>{currentState ?? "-"}</div>
        </Form.Item>

        {(selected === "OBSERVADO" || selected === "RECHAZADO") && (
          <Form.Item name="motivo" label="Motivo" rules={[{ required: true, message: "Motivo obligatorio" }]}>
            <TextArea rows={4} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default StateChangeModal