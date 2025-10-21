import React, { useEffect } from "react"
import { Modal, Form, Input, Select, DatePicker, InputNumber, Checkbox, Switch, Grid } from "antd"
import dayjs from "dayjs"

const { TextArea } = Input
const { Option } = Select
const { useBreakpoint } = Grid

// field: { name, label, type, rules?, props?, options? }
// type: "text"|"textarea"|"select"|"date"|"number"|"checkbox"|"switch"
const EditorModal = ({ open, onClose, initialValues = {}, fields = [], onSave, onDelete, mode = "create", title }) => {
  const [form] = Form.useForm()
  const screens = useBreakpoint()

  useEffect(() => {
    form.resetFields()
    const vals = { ...initialValues }
    fields.forEach((f) => {
      if (f.type === "date" && vals[f.name]) {
        vals[f.name] = dayjs(vals[f.name])
      }
    })
    form.setFieldsValue(vals)
  }, [initialValues, form, open, fields])

  const renderField = (f) => {
    const common = { name: f.name, label: f.label, rules: f.rules || [] }
    const props = f.props || {}

    switch (f.type || "text") {
      case "textarea":
        return (
          <Form.Item key={f.name} {...common}>
            <TextArea {...props} />
          </Form.Item>
        )
      case "select":
        return (
          <Form.Item key={f.name} {...common}>
            <Select {...props}>
              {(f.options || []).map((o) => (
                <Option key={o.value ?? o} value={o.value ?? o}>
                  {o.label ?? o}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )
      case "date":
        return (
          <Form.Item key={f.name} {...common}>
            <DatePicker showTime style={{ width: "100%" }} {...props} />
          </Form.Item>
        )
      case "number":
        return (
          <Form.Item key={f.name} {...common}>
            <InputNumber style={{ width: "100%" }} {...props} />
          </Form.Item>
        )
      case "checkbox":
        return (
          <Form.Item key={f.name} name={f.name} valuePropName="checked" label={f.label} rules={f.rules || []}>
            <Checkbox {...props}>{f.checkboxLabel}</Checkbox>
          </Form.Item>
        )
      case "switch":
        return (
          <Form.Item key={f.name} name={f.name} valuePropName="checked" label={f.label} rules={f.rules || []}>
            <Switch {...props} />
          </Form.Item>
        )
      default:
        return (
          <Form.Item key={f.name} {...common}>
            <Input {...props} />
          </Form.Item>
        )
    }
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const normalized = { ...values }
      fields.forEach((f) => {
        if (f.type === "date" && normalized[f.name]) {
          normalized[f.name] = normalized[f.name].toISOString()
        }
      })
      onSave && onSave(normalized)
      onClose && onClose()
    } catch {
      // validation errors - no action
    }
  }

  return (
    <Modal
      open={open}
      title={title || (mode === "create" ? "Crear" : "Editar")}
      onCancel={onClose}
      onOk={handleOk}
      okText={mode === "create" ? "Crear" : "Guardar"}
      destroyOnClose
      centered
      width={screens.xs ? "95%" : 600}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}
    >
      <Form layout="vertical" form={form}>
        {fields.map((f) => renderField(f))}
        {mode === "edit" && onDelete && (
          <Form.Item>
            <a
              onClick={() => {
                onDelete && onDelete(form.getFieldsValue())
                onClose && onClose()
              }}
              style={{ color: "red" }}
            >
              Eliminar
            </a>
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default EditorModal
