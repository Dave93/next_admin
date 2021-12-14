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
  Slider,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  InboxOutlined,
  CloseOutlined,
  MinusCircleOutlined,
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

const DeliveryPricing = () => {
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
  const [terminalList, setTerminalList] = useState([] as any[])
  const [channelName, setChannelName] = useState('')

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
    // if (editingObject.start_date) {
    //   editingObject.start_date = moment(editingObject.start_date)
    // }
    // if (editingObject.end_date) {
    //   editingObject.end_date = moment(editingObject.end_date)
    // }
    // if (editingObject.bonus_products) {
    //   editingObject.bonus_products = editingObject.bonus_products.split(',')
    // }
    // console.log(record.clause_products)
    // if (editingObject.clause_products) {
    //   editingObject.clause_products = editingObject.clause_products.split(',')
    // }

    // if (editingObject.available_days) {
    //   editingObject.available_days = editingObject.available_days.split(',')
    // }

    if (editingObject.config) {
      editingObject.config = JSON.parse(editingObject.config)
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
    } = await axios.get(`${webAddress}/api/delivery_pricings`)
    setData(result)
    const {
      data: { data: terminals },
    } = await axios.get(`${webAddress}/api/terminals`)
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
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

    // if (values.available_days) {
    //   values.available_days = values.available_days.join(',')
    // }

    // if (values.bonus_products) {
    //   values.bonus_products = values.bonus_products.join(',')
    // }

    // if (values.clause_products) {
    //   values.clause_products = values.clause_products.join(',')
    // }
    values.active = values.active ? 1 : 0
    values.is_default = values.is_default ? 1 : 0
    if (values.config) {
      values.config = JSON.stringify(values.config)
    }
    if (editingRecord) {
      await axios.put(
        `${webAddress}/api/delivery_pricings/${editingRecord?.id}`,
        {
          ...editingRecord,
          ...values,
        }
      )
    } else {
      await axios.post(`${webAddress}/api/delivery_pricings/`, {
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
      title: 'Активность',
      dataIndex: 'active',
      key: 'active',
      render: (_: any) => {
        return <Switch disabled defaultChecked={_} />
      },
    },
    {
      title: 'По-умолчанию',
      dataIndex: 'is_default',
      key: 'is_default',
      render: (_: any) => {
        return <Switch disabled defaultChecked={_} />
      },
    },
    {
      title: 'Филиал',
      dataIndex: 'from_terminal',
      render: (_: any, record: any) => {
        let res = ''
        if (record.from_terminal) {
          let activeTerminal = terminalList.find(
            (item: any) => item.id === record.from_terminal
          )
          if (activeTerminal) {
            res = activeTerminal.name
          }
        }
        return res
      },
    },
    {
      title: 'Мин. сумма',
      dataIndex: 'min_price',
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
                  <Form.Item
                    name="is_default"
                    label="По-умолчанию"
                    valuePropName="checked"
                  >
                    <Switch />
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
                  <Form.Item name="min_price" label="Минимальная сумма заказа">
                    <InputNumber />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.List name="config">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, fieldKey, ...restField }) => (
                          <Row gutter={16} key={key}>
                            <Col span={11}>
                              <Form.Item
                                {...restField}
                                name={[name, 'range']}
                                fieldKey={[fieldKey, 'range']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Обязательно указание диапазона',
                                  },
                                ]}
                              >
                                <Slider
                                  range
                                  // tooltipVisible
                                  // defaultValue={[20, 50]}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={11}>
                              <Form.Item
                                {...restField}
                                name={[name, 'price']}
                                fieldKey={[fieldKey, 'price']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Укажите цену',
                                  },
                                ]}
                              >
                                <InputNumber placeholder="Цена" />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <MinusCircleOutlined
                                className="dynamic-delete-button"
                                onClick={() => {
                                  remove(name)
                                }}
                              />
                            </Col>
                          </Row>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Добавить условие
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="father_price"
                    label="Цена за км дальше условий"
                  >
                    <InputNumber />
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

DeliveryPricing.displayName = 'DeliveryPricing'
export default DeliveryPricing
