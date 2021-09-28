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

const Terminals = () => {
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
  const [cities, setCities] = useState([] as any)
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
    if (formData.delivery_time) {
      formData.delivery_time = moment(formData.delivery_time)
    }
    if (formData.pickup_time) {
      formData.pickup_time = moment(formData.pickup_time)
    }
    if (formData.open_work) {
      formData.open_work = moment(formData.open_work)
    }
    if (formData.close_work) {
      formData.close_work = moment(formData.close_work)
    }
    if (formData.open_weekend) {
      formData.open_weekend = moment(formData.open_weekend)
    }
    if (formData.close_weekend) {
      formData.close_weekend = moment(formData.close_weekend)
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
    } = await axios.get(`${webAddress}/api/terminals`)
    setData(result)
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
      await axios.put(`${webAddress}/api/terminals/${editingRecord?.id}`, {
        ...editingRecord,
        ...values,
      })
    } else {
      await axios.post(`${webAddress}/api/terminals/`, {
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

  const fetchCities = async () => {
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/cities`)
    setCities(result)
  }

  useEffect(() => {
    fetchData()
    fetchCities()
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
      title: 'Терминал ид',
      dataIndex: 'terminal_id',
      key: 'terminal_id',
    },
    {
      title: 'Русский',
      children: [
        {
          title: 'Название',
          dataIndex: 'name',
          key: 'name',
          sorter: {
            compare: (a: any, b: any) => a.name - b.name,
          },
        },
        {
          title: 'Описание',
          dataIndex: 'desc',
          key: 'desc',
          sorter: {
            compare: (a: any, b: any) => a.desc - b.desc,
          },
        },
      ],
    },
    {
      title: 'Узбекский',
      children: [
        {
          title: 'Название',
          dataIndex: 'name_uz',
          key: 'name_uz',
          sorter: {
            compare: (a: any, b: any) => a.name_uz - b.name_uz,
          },
        },
        {
          title: 'Описание',
          dataIndex: 'desc_uz',
          key: 'desc_uz',
          sorter: {
            compare: (a: any, b: any) => a.desc_uz - b.desc_uz,
          },
        },
      ],
    },
    {
      title: 'Английский',
      children: [
        {
          title: 'Название',
          dataIndex: 'name_en',
          key: 'name_en',
          sorter: {
            compare: (a: any, b: any) => a.name_en - b.name_en,
          },
        },
        {
          title: 'Описание',
          dataIndex: 'desc_en',
          key: 'desc_en',
          sorter: {
            compare: (a: any, b: any) => a.desc_en - b.desc_en,
          },
        },
      ],
    },
    {
      title: 'Время доставки',
      dataIndex: 'delivery_time',
      key: 'delivery_time',
    },
    {
      title: 'Время самовывоза',
      dataIndex: 'pickup_time',
      key: 'pickup_time',
    },
    {
      title: 'Широта',
      dataIndex: 'latitude',
      key: 'latitude',
    },
    {
      title: 'Долгота',
      dataIndex: 'longitude',
      key: 'longitude',
    },
    {
      title: 'ПН-СБ',
      children: [
        {
          title: 'Время открытия',
          dataIndex: 'open_work',
          key: 'open_work',
        },
        {
          title: 'Время закрытия',
          dataIndex: 'close_work',
          key: 'close_work',
        },
      ],
    },
    {
      title: 'Воскресенье',
      children: [
        {
          title: 'Время открытия',
          dataIndex: 'open_weekend',
          key: 'open_weekend',
        },
        {
          title: 'Время закрытия',
          dataIndex: 'close_weekend',
          key: 'close_weekend',
        },
      ],
    },
    {
      title: 'Телеграм группа',
      dataIndex: 'tg_group',
      key: 'tg_group',
    },
  ]

  return (
    <MainLayout title="Терминалы">
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
          editingRecord ? 'Редактировать терминал' : 'Добавить новый терминал'
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
          size="small"
          onFinish={onFinish}
          initialValues={editingRecord ? editingRecord : undefined}
        >
          {editingRecord && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Терминал ид">
                  <span>{editingRecord?.terminal_id}</span>
                </Form.Item>
              </Col>
            </Row>
          )}
          <Tabs type="card">
            <TabPane tab="Общие" key="1">
              {!editingRecord && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Терминал ид"
                      name="terminal_id"
                      rules={[
                        {
                          required: true,
                          message: 'Просьба ввести ид терминала',
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              )}
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
                  <Form.Item name="delivery_type" label="Тип">
                    <Radio.Group buttonStyle="solid">
                      <Radio.Button value="all">Все</Radio.Button>
                      <Radio.Button value="deliver">Доставка</Radio.Button>
                      <Radio.Button value="pickup">Самовывоз</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="city_id" label="Город">
                    <Select>
                      <Option value="">Выберите вариант</Option>
                      {cities.map((item: any) => (
                        <Option value={item.id} key={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Название"
                    rules={[
                      { required: true, message: 'Просьба ввести название' },
                    ]}
                  >
                    <Input placeholder="Просьба ввести название" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="desc" label="Описание">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name_uz" label="Название (уз.)">
                    <Input placeholder="Просьба ввести название" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="desc_uz" label="Описание (уз.)">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name_en" label="Название (анг.)">
                    <Input placeholder="Просьба ввести название" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="desc_en" label="Описание (анг.)">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="delivery_time" label="Время доставки">
                    <TimePicker format={format} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="pickup_time" label="Время самовывоза">
                    <TimePicker format={format} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="latitude" label="Широта">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="longitude" label="Долгота">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="open_work" label="Время открытия (ПН-СБ)">
                    <TimePicker format={format} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="close_work" label="Время закрытия (ПН-СБ)">
                    <TimePicker format={format} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="open_weekend" label="Время открытия (ВС)">
                    <TimePicker format={format} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="close_weekend" label="Время закрытия (ВС)">
                    <TimePicker format={format} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="tg_group" label="Группа в телеграм">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
            {editingRecord && (
              <TabPane tab="Способы оплаты" key="2">
                <Divider orientation="left">Payme</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="payme_active"
                      label="Активность"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="payme_test_mode"
                      label="Тестовый режим"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="payme_merchant_id"
                      label="Идентификатор мерчанта"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="payme_secure_key" label="Секретный ключ">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="payme_secure_key_test"
                      label="Секретный ключ для тестов"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="payme_print"
                      label="Добавить в чек данные о товарах"
                    >
                      <Select>
                        <Option value="no">Нет</Option>
                        <Option value="yes">Да</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Divider orientation="left">Click</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="click_active"
                      label="Активность"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="click_merchant_service_id"
                      label="Идентификатор услуг"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="click_merchant_user_id"
                      label="Идентификатор пользователя в системе поставщиков"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="click_secret_key"
                      label="Секретный ключ магаина"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="click_merchant_id"
                      label="Идентификатор поставщика"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>
            )}
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

Terminals.displayName = 'Terminals'
export default Terminals
