import Head from 'next/head'
import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Select,
  DatePicker,
  Table,
  Space,
  Tooltip,
  TimePicker,
  Switch,
  Popover,
  Checkbox,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  LockOutlined,
} from '@ant-design/icons'
import getConfig from 'next/config'
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useDarkMode } from 'next-dark-mode'
import MainLayout from '@components/ui/MainLayout'
import authRequired from '@services/authRequired'
import LoadingScreen from '@components/ui/LoadingScreen'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
const { publicRuntimeConfig } = getConfig()
const format = 'HH:mm'

export default function Users() {
  const user = authRequired({})
  const {
    darkModeActive, // boolean - whether the dark mode is active or not
  } = useDarkMode()
  useEffect(() => {
    if (!user) {
      return
    }
  }, [])

  const [isDrawerVisible, setDrawer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [data, setData] = useState([])
  const [editingRecord, setEditingRecord] = useState(null as any)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  let webAddress = 'http://localhost:3000'
  if (typeof window !== 'undefined') {
    webAddress = window.location.origin
  }

  let searchInput = useRef(null)

  const showDrawer = () => {
    setDrawer(true)
  }

  const closeDrawer = () => {
    setEditingRecord(null)
    setDrawer(false)
  }

  const editRecord = (record: any) => {
    setEditingRecord(record)
    form.resetFields()
    form.setFieldsValue(record)
    setDrawer(true)
  }

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm()
    // this.setState({
    //   searchText: selectedKeys[0],
    //   searchedColumn: dataIndex,
    // })
  }

  const handleReset = (clearFilters: any) => {
    clearFilters()
    // this.setState({ searchText: '' })
  }

  const asignRole = async (
    role: string,
    userId: number,
    e: CheckboxChangeEvent
  ) => {
    console.log(role)
    console.log(e)
    setIsLoading(true)
    await axios.post(`${webAddress}/api/roles/set_to_user`, {
      role,
      userId,
      active: e.target.checked,
    })
    fetchData()
  }

  const fetchData = async () => {
    setIsLoading(true)
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/users`)
    setData(result)
    setIsLoading(false)
  }

  const fetchRoles = async () => {
    setIsLoading(true)
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/roles/list`)
    setRoles(result)
  }

  useEffect(() => {
    fetchData()
    fetchRoles()
  }, [])

  // const Tooltip =

  const columns = [
    {
      title: 'Действие',
      dataIndex: 'action',
      render: (_: any, record: any) => {
        let userRoles: any[] = []
        if (record.roles && record.roles.length) {
          userRoles = record.roles.map((role: any) => role.name)
        }
        const content = (
          <div>
            {roles.map((role: any) => (
              <Checkbox
                key={role.name}
                checked={userRoles.includes(role.name)}
                onChange={(e: CheckboxChangeEvent) =>
                  asignRole(role.name, record.id, e)
                }
              >
                {role.name}
              </Checkbox>
            ))}
          </div>
        )
        return (
          <div className="space-x-2">
            <Tooltip title="Редактировать">
              <Button
                type="primary"
                shape="circle"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  editRecord(record)
                }}
              />
            </Tooltip>
            <Popover content={content} title="Назначить роли" trigger="click">
              <Button type="primary" shape="circle" size="small">
                <LockOutlined />
              </Button>
            </Popover>
          </div>
        )
      },
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Номер телефона',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Роли',
      dataIndex: 'roles',
      render: (_: any, record: any) => {
        return (
          <span>{record?.roles.map((role: any) => role.name).join(', ')}</span>
        )
      },
    },
  ]
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    setIsSubmittingForm(true)
    if (editingRecord) {
      await axios.put(`${webAddress}/api/users/${editingRecord?.id}`, {
        ...editingRecord,
        ...values,
      })
    } else {
      await axios.post(`${webAddress}/api/users/`, {
        ...values,
      })
    }
    setIsSubmittingForm(false)
    closeDrawer()
    fetchData()
  }

  const submitForm = () => {
    form.submit()
  }

  const addRecord = () => {
    setEditingRecord(null)
    form.resetFields()
    setDrawer(true)
  }

  const onSearch = async (value: any) => {
    setIsLoading(true)
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/users?search=${value}`)
    setData(result)
    setIsLoading(false)
  }

  return (
    <MainLayout title="Пользователи">
      <div className="flex justify-between mb-3">
        <Input.Search
          loading={isLoading}
          onSearch={onSearch}
          style={{ maxWidth: 400 }}
        />
        <Button type="primary" onClick={addRecord}>
          <PlusOutlined /> Добавить
        </Button>
      </div>
      <Drawer
        title={
          editingRecord
            ? 'Редактировать пользователя'
            : 'Добавить нового пользователя'
        }
        width={720}
        onClose={closeDrawer}
        visible={isDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
              Отмена
            </Button>
            <Button
              onClick={submitForm}
              loading={isSubmittingForm}
              type="primary"
            >
              Сохранить
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={form}
          hideRequiredMark
          size="small"
          onFinish={onFinish}
          initialValues={editingRecord ? editingRecord : undefined}
        >
          {editingRecord && (
            <Row gutter={16}>
              <Col span={12}>
                <span className="text-gray-500">
                  <span className="font-bold">Телефон: </span>
                  {editingRecord.phone}
                </span>
              </Col>
            </Row>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Имя"
                rules={[{ required: true, message: 'Просьба ввести имя' }]}
              >
                <Input placeholder="Просьба ввести имя" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 'calc(700px + 50%)' }}
        size="small"
        bordered
      />
    </MainLayout>
  )
}
