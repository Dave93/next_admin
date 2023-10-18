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
  Radio,
  Tabs,
  Divider,
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

const { TabPane } = Tabs

const { Option } = Select

const OrganizationsFills = () => {
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [data, setData] = useState([])
  const [editingRecord, setEditingRecord] = useState(null as any)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [organizationsList, setOrganizationsList] = useState([] as any[])

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
    } = await axios.get(`${webAddress}/api/organizations_fills`, {
      headers: {
        'Content-Type': 'application/json',
        // @ts-ignore
        'Authorization': 'Bearer ' + user?.user_token,
      }
    })
    setData(result)
    const {
      data: { data: orgList },
    } = await axios.get(`${webAddress}/api/organizations`, {
      headers: {
        'Content-Type': 'application/json',
        // @ts-ignore
        'Authorization': 'Bearer ' + user?.user_token,
      }
    })
    setOrganizationsList(orgList)
    setIsLoading(false)
  }

  const setAxiosCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        },
        withCredentials: true,
      })
      let { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    setIsSubmittingForm(true)
    await setAxiosCredentials()
    if (editingRecord) {
      await axios.put(`${webAddress}/api/organizations_fills/${editingRecord?.id}`, {
        ...editingRecord,
        ...values,
      }, {
        headers: {
          'Content-Type': 'application/json',
          // @ts-ignore
          'Authorization': 'Bearer ' + user?.user_token,
        }
      })
    } else {
      await axios.post(`${webAddress}/api/organizations_fills/`, {
        ...values,
      }, {
        headers: {
          'Content-Type': 'application/json',
          // @ts-ignore
          'Authorization': 'Bearer ' + user?.user_token,
        }
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
              icon={
              // @ts-ignore
              <EditOutlined />
            }
              onClick={() => {
                editRecord(record)
              }}
            />
          </Tooltip>
        )
      },
    },
    {
      title: 'Дата пополнения',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: any) => {
        return moment(text).format('DD.MM.YYYY')
      }
    },
    {
      title: 'Номер документа',
        dataIndex: 'doc_number',
        key: 'doc_number',
    },
    {
      title: 'Дата документа',
        dataIndex: 'doc_date',
        key: 'doc_date',
        render: (text: any) => {
            return moment(text).format('DD.MM.YYYY')
        }
    },
    {
      title: 'Сумма пополнения',
      dataIndex: 'balance',
      key: 'balance',
      render: (text: any) => {
        return Intl.NumberFormat( 'ru-RU', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 }).format(text)
      }
    },
  ]

  return (
    <MainLayout title="Документы организаций">
      <div className="flex justify-between mb-3">
        <Input.Search
          loading={isLoading}
          onSearch={onSearch}
          style={{ maxWidth: 400 }}
        />
        <Button type="primary" onClick={addRecord}>
          {/*
// @ts-ignore */}
          <PlusOutlined /> Добавить
        </Button>
      </div>
      <Drawer
        title={editingRecord ? 'Редактировать документ организации' : 'Добавить новый документ организации'}
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
          <Tabs type="card">
            <TabPane tab="Общие" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="org_id"
                    label="Организация"
                  >
                    <Select
                      showSearch
                      placeholder="Выберите организацию"
                      optionFilterProp="children"
                    >
                      {organizationsList.map((prod: any) => (
                        <Option value={prod.id} key={prod.id}>
                          {prod.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="doc_number"
                    label="Номер документа"
                    rules={[
                      { required: true, message: 'Просьба ввести номер документа' },
                    ]}
                  >
                    <Input placeholder="Просьба ввести номер документа" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Дата документа"
                    name="doc_date"
                    rules={[
                      {
                        required: true,
                        message: 'Пожалуйста, укажите дату документа',
                      },
                    ]}
                  >
                    {/*
// @ts-ignore */}
                    <DatePicker
                      format={'DD.MM.YYYY'}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="balance" label="Сумма пополнения"
                             rules={[
                               { required: true, message: 'Просьба ввести cумма пополнения' },
                             ]}>
                    <InputNumber placeholder="Просьба ввести cумма пополнения" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
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

OrganizationsFills.displayName = 'OrganizationsFills'
export default OrganizationsFills
