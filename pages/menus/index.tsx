import Head from 'next/head'
import { Drawer, Form, Button, Col, Row, Input, Table, Tooltip } from 'antd'
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

export default function Menus() {
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
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [data, setData] = useState([])
  const [menuData, setMenuData] = useState([])
  const [editingRecord, setEditingRecord] = useState(null as any)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([] as number[])
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

  const fetchData = async () => {
    setIsLoading(true)
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/menu_types`)
    setData(result)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns = [
    {
      title: 'Действие',
      dataIndex: 'action',
      render: (_: any, record: any) => {
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
          </div>
        )
      },
    },
    {
      title: 'Код',
      dataIndex: 'code',
      key: 'code',
    },
  ]

  const menuColumns = [
    {
      title: 'Действие',
      dataIndex: 'action',
      render: (_: any, record: any) => {
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
          </div>
        )
      },
    },
    {
      title: 'Название(RU)',
      dataIndex: 'name_ru',
      key: 'name_ru',
    },
    {
      title: 'Название(UZ)',
      dataIndex: 'name_uz',
      key: 'name_uz',
    },
    {
      title: 'Ссылка',
      dataIndex: 'href',
      key: 'href',
    },
  ]
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    setIsSubmittingForm(true)
    if (editingRecord) {
      await axios.put(`${webAddress}/api/menu_types/${editingRecord?.id}`, {
        ...editingRecord,
        ...values,
      })
    } else {
      await axios.post(`${webAddress}/api/menu_types/`, {
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
    } = await axios.get(`${webAddress}/api/menu_types?search=${value}`)
    setData(result)
    setIsLoading(false)
  }

  const menuTypeSelectionChange = (selectedRowKeys: any) => {
    console.log(selectedRowKeys)
  }

  return (
    <MainLayout title="Пользователи">
      <Drawer
        title={
          editingRecord ? 'Редактировать тип меню' : 'Добавить новый тип меню'
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Код"
                rules={[{ required: true, message: 'Просьба ввести код' }]}
              >
                <Input placeholder="Просьба ввести код" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
      <Row gutter={16}>
        <Col span={8}>
          <div className="flex justify-between mb-3">
            <Button type="primary" onClick={addRecord}>
              <PlusOutlined /> Добавить
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            loading={isLoading}
            showHeader={false}
            rowKey="id"
            size="small"
            bordered
            rowSelection={{
              selectedRowKeys,
              onChange: menuTypeSelectionChange,
            }}
            onRow={(record: any, rowIndex: number | undefined) => {
              return {
                onClick: (event) => {
                  setSelectedRowKeys([record.id])
                },
              }
            }}
          />
        </Col>
        <Col span={16}>
          <div className="flex justify-between mb-3">
            <Button type="primary" onClick={addRecord}>
              <PlusOutlined /> Добавить
            </Button>
          </div>
          <Table
            columns={menuColumns}
            dataSource={menuData}
            loading={isMenuLoading}
            rowKey="id"
            size="small"
            bordered
          />
        </Col>
      </Row>
    </MainLayout>
  )
}
