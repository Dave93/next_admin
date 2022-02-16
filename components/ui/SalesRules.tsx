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
  Upload,
  message,
  Checkbox,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  InboxOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import getConfig from 'next/config'
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useDarkMode } from 'next-dark-mode'
import MainLayout from '@components/ui/MainLayout'
import authRequired from '@services/authRequired'
import Cookies from 'js-cookie'
import moment from 'moment'
import Hashids from 'hashids'
import {
  BeforeUploadFileType,
  RcFile,
  UploadRequestError,
  UploadRequestOption as RcCustomRequestOptions,
  UploadProgressEvent,
  UploadRequestHeader,
  UploadRequestMethod,
} from 'rc-upload/lib/interface'
import Image from 'next/image'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import defaultChannel from '@services/defaultChannel'
import { DateTime } from 'luxon'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const format = 'HH:mm'

axios.defaults.withCredentials = true

const { TabPane } = Tabs

const { Option } = Select
const { Dragger } = Upload
const { TextArea } = Input

// days of the week
const days = [
  {
    value: '1',
    label: 'Пн',
  },
  {
    value: '2',
    label: 'Вт',
  },
  {
    value: '3',
    label: 'Ср',
  },
  {
    value: '4',
    label: 'Чт',
  },
  {
    value: '5',
    label: 'Пт',
  },
  {
    value: '6',
    label: 'Сб',
  },
  {
    value: '7',
    label: 'Вс',
  },
]

const Sale = () => {
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
  const [modifierProductList, setModifierProductList] = useState([] as any[])
  const [channelName, setChannelName] = useState('')
  const [terminalList, setTerminalList] = useState([] as any[])

  let searchInput = useRef(null)

  const showDrawer = () => {
    setDrawer(true)
  }

  const closeDrawer = () => {
    setEditingRecord(null)
    setDrawer(false)
  }

  const editRecord = (record: any) => {
    let editingObject = { ...record }
    if (editingObject.start_date) {
      editingObject.start_date = moment(editingObject.start_date)
    }
    if (editingObject.end_date) {
      editingObject.end_date = moment(editingObject.end_date)
    }
    if (editingObject.bonus_products) {
      editingObject.bonus_products = editingObject.bonus_products.split(',')
    }
    console.log(record.clause_products)
    if (editingObject.clause_products) {
      editingObject.clause_products = editingObject.clause_products.split(',')
    }

    if (editingObject.available_days) {
      editingObject.available_days = editingObject.available_days.split(',')
    }

    setEditingRecord({
      ...editingObject,
    })
    form.resetFields()

    const formData = {
      ...editingObject,
    }

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
    } = await axios.get(`${webAddress}/api/sales_rules`)
    setData(result)
    const {
      data: { data: prodList },
    } = await axios.get(`${webAddress}/api/products`)
    const {
      data: { data: terminals },
    } = await axios.get(`${webAddress}/api/terminals`)
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
    setModifierProductList(prodList)
    setTerminalList(terminals)
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
    if (values.available_days) {
      values.available_days = values.available_days.join(',')
    }

    if (values.bonus_products) {
      values.bonus_products = values.bonus_products.join(',')
    }

    if (values.clause_products) {
      values.clause_products = values.clause_products.join(',')
    }
    console.log(values)
    if (!values.delivery_type) {
      values.delivery_type = null
    }
    if (editingRecord) {
      await axios.put(`${webAddress}/api/sales_rules/${editingRecord?.id}`, {
        ...editingRecord,
        ...values,
      })
    } else {
      await axios.post(`${webAddress}/api/sales_rules/`, {
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
      title: 'Дата начала',
      dataIndex: 'start_date',
      render: (_: any, record: any) => {
        let res = ''
        // format date via luxon to DD.MM.YYYY
        if (record.start_date) {
          res = DateTime.fromISO(record.start_date).toFormat('dd.MM.yyyy')
        }
        return <span>{res}</span>
      },
      // key: 'sort',
    },
    {
      title: 'Дата окончания',
      dataIndex: 'end_date',
      render: (_: any, record: any) => {
        let res = ''
        // format date via luxon to DD.MM.YYYY
        if (record.end_date) {
          res = DateTime.fromISO(record.end_date).toFormat('dd.MM.yyyy')
        }
        return <span>{res}</span>
      },
    },
    {
      title: 'Дни недели',
      dataIndex: 'available_days',
      render: (_: any, record: any) => {
        let res = ''
        if (record.available_days) {
          res = record.available_days.split(',')
          // find name of label days including in res
          res = days
            .filter((day: any) => res.includes(day.value))
            .map((day: any) => day.label)
            .join(', ')
        }
        return <span>{res}</span>
      },
    },
    {
      title: 'Товар для условия акции',
      dataIndex: 'clause_products',
      render: (_: any, record: any) => {
        let res = ''
        if (record.clause_products) {
          res = record.clause_products.split(',').map((prod: String) => +prod)
          // find name of label days including in res
          res = modifierProductList
            .filter((prod: any) => res.includes(prod.id))
            .map((prod: any) => prod.attribute_data['name'][channelName]['ru'])
            .join(', ')
        }
        return <span>{res}</span>
      },
    },
    {
      title: 'Бонусные товары',
      dataIndex: 'bonus_products',
      render: (_: any, record: any) => {
        let res = ''
        if (record.bonus_products) {
          res = record.bonus_products.split(',').map((prod: String) => +prod)
          // find name of label days including in res
          res = modifierProductList
            .filter((prod: any) => res.includes(prod.id))
            .map((prod: any) => prod.attribute_data['name'][channelName]['ru'])
            .join(', ')
        }
        return <span>{res}</span>
      },
    },
  ]
  return (
    <MainLayout title="Акции">
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
        title={editingRecord ? 'Редактировать акцию' : 'Добавить новую акцию'}
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
                    name="active"
                    label="Активность"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="max_count" label="Макс. кол-во">
                    <InputNumber min={1} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Дата начала"
                    name="start_date"
                    rules={[
                      {
                        required: true,
                        message: 'Пожалуйста, укажите дату начала',
                      },
                    ]}
                  >
                    <DatePicker format={'DD.MM.YYYY'} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Дата окончания"
                    name="end_date"
                    rules={[
                      {
                        required: true,
                        message: 'Пожалуйста, укажите дату окончания',
                      },
                    ]}
                  >
                    <DatePicker format={'DD.MM.YYYY'} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="available_days"
                    label="Дни недели"
                    rules={[
                      { required: true, message: 'Просьба ввести дни недели' },
                    ]}
                  >
                    <Checkbox.Group options={days} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="clause_products"
                    label="Товар для условия акции"
                  >
                    <Select
                      showSearch
                      placeholder="Выберите товар"
                      optionFilterProp="children"
                      mode="multiple"
                    >
                      {modifierProductList.map((prod: any) => (
                        <Option value={prod.id} key={prod.id}>
                          {prod.attribute_data['name'][channelName]['ru']}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="bonus_products"
                    label="Бонусные товары"
                    rules={[
                      {
                        required: true,
                        message: 'Просьба указать товары выдаваемые как бонус',
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Выберите товар"
                      optionFilterProp="children"
                      mode="multiple"
                    >
                      {modifierProductList.map((prod: any) => (
                        <Option value={prod.id} key={prod.id}>
                          {prod.attribute_data['name'][channelName]['ru']}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="from_terminal" label="Филиал">
                    <Select
                      showSearch
                      placeholder="Выберите филиал"
                      optionFilterProp="children"
                      allowClear
                    >
                      {terminalList.map((prod: any) => (
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
                  <Form.Item name="delivery_type" label="Способ доставки">
                    <Select
                      showSearch
                      placeholder="Выберите способ доставки"
                      optionFilterProp="children"
                      allowClear
                    >
                      <Option value={'pickup'}>Самовывоз</Option>
                      <Option value={'deliver'}>Доставка</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="min_price" label="Минимальная сумма заказа">
                    <InputNumber min={1} />
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

Sale.displayName = 'Sale'
export default Sale
