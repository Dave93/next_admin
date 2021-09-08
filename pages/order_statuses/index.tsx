import Head from 'next/head'
import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Select,
  Table,
  Tooltip,
  Switch,
  InputNumber,
} from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons'
import getConfig from 'next/config'
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useDarkMode } from 'next-dark-mode'
import MainLayout from '@components/ui/MainLayout'
import authRequired from '@services/authRequired'
import LoadingScreen from '@components/ui/LoadingScreen'
import Cookies from 'js-cookie'
import moment from 'moment'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const format = 'HH:mm'

axios.defaults.withCredentials = true

const { Option } = Select

const OrderStatuses = () => {
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
  const [bxStatuses, setBXStatuses] = useState([])
  const [systemStatuses, setSystemStatuses] = useState({} as any)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [data, setData] = useState([])
  const [editingRecord, setEditingRecord] = useState(null as any)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)

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

    const formData = { ...record }

    form.setFieldsValue(formData)
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
    } = await axios.get(`${webAddress}/api/order_statuses`)
    setData(result)
    setIsLoading(false)
  }

  const fetchB24Statuses = async () => {
    const { data } = await axios.get(`${webAddress}/api/order_statuses/b24`)
    setBXStatuses(data.data)
  }

  const fetchSystemStatuses = async () => {
    const { data } = await axios.get(`${webAddress}/api/order_statuses/system`)
    setSystemStatuses(data.data)
  }

  const setAxiosCredentials = () => {
    const csrf = Cookies.get('X-XSRF-TOKEN')
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    setIsSubmittingForm(true)
    setAxiosCredentials()
    if (editingRecord) {
      await axios.put(`${webAddress}/api/order_statuses/${editingRecord?.id}`, {
        ...editingRecord,
        ...values,
      })
    } else {
      await axios.post(`${webAddress}/api/order_statuses/`, {
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
    } = await axios.get(`${webAddress}/api/terminals?search=${value}`)
    setData(result)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchB24Statuses()
    fetchSystemStatuses()
    fetchData()
  }, [])

  const columns = [
    {
      title: 'Действие',
      dataIndex: 'action',
      render: (_: any, record: any) => {
        return (
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
        )
      },
    },
    {
      title: 'Статус системы',
      dataIndex: 'api_status',
      key: 'api_status',
      render: (_: any, record: any) => {
        return (
          <span>
            {systemStatuses[record.api_status] &&
              systemStatuses[record.api_status].label}
          </span>
        )
      },
    },
    {
      title: 'Статус Б24',
      dataIndex: 'b24_status',
      key: 'b24_status',
      render: (_: any, record: any) => {
        if (bxStatuses.length) {
          let status: any = bxStatuses.find(
            (rec: any) => rec.id == record.b24_status
          )
          return <span>{status && status.name}</span>
        }
        return <span>{record.api_status}</span>
      },
    },
  ]

  return (
    <MainLayout title="Статусы заказов">
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
        title={editingRecord ? 'Редактировать статус' : 'Добавить новый статус'}
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
          size="small"
          onFinish={onFinish}
          initialValues={editingRecord ? editingRecord : undefined}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="b24_status" label="Статус Б24">
                <Select>
                  {bxStatuses.map((status: any) => (
                    <Option value={status.id} key={status.id}>
                      {status.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="api_status" label="Статус системы">
                <Select>
                  {Object.keys(systemStatuses).map((status: any) => (
                    <Option value={status} key={status}>
                      {systemStatuses[status].label}
                    </Option>
                  ))}
                </Select>
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

OrderStatuses.displayName = 'OrderStatuses'
export default OrderStatuses
