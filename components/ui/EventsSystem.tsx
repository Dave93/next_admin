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
  Progress,
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
import { useQuery } from 'react-query'
import moment from 'moment-timezone'

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

moment.tz.setDefault('Asia/Tashkent')

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

  const dropProps = {
    name: 'file',
    multiple: true,
    maxCount: 1,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange(info: any) {
      const { status } = info.file
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
    customRequest: async (options: RcCustomRequestOptions) => {
      const {
        onSuccess,
        onError,
        file,
        onProgress,
      }: {
        onProgress?: (event: UploadProgressEvent) => void
        onError?: (
          event: UploadRequestError | ProgressEvent,
          body?: any
        ) => void
        onSuccess?: (body: any, xhr: XMLHttpRequest) => void
        data?: object
        filename?: string
        file: Exclude<BeforeUploadFileType, File | boolean> | RcFile
        withCredentials?: boolean
        action: string
        headers?: UploadRequestHeader
        method: UploadRequestMethod
      } = options
      // console.log(arguments)
      await setAxiosCredentials()
      var formData = new FormData()
      formData.append('file', file)
      formData.append('parent', 'events_system')
      formData.append('primary', 'true')
      const hashids = new Hashids(
        'events_system',
        8,
        'abcdefghijklmnopqrstuvwxyz1234567890'
      )
      formData.append('parent_id', hashids.encode(editingRecord.id))

      const config = {
        headers: { 'content-type': 'multipart/form-data' },
        onUploadProgress: (event: any) => {
          const percent: number = Math.floor((event.loaded / event.total) * 100)
          const progress: UploadProgressEvent = { ...event, percent }
          onProgress && onProgress(progress)
        },
      }
      axios
        .post(`${webAddress}/api/assets`, formData, config)
        .then(({ data: response }) => {
          onSuccess && onSuccess(response, response)
        })
        .catch(onError)
    },
  }

  const [isDrawerVisible, setDrawer] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [editingRecord, setEditingRecord] = useState(null as any)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [ruDescriptionEditorState, setRuDescriptionEditorState] = useState('')
  const [channelName, setChannelName] = useState('')
  const [isShowUploader, setShowUploader] = useState(false)

  const { data, isLoading, error } = useQuery(
    ['events_system_data'],
    async () => {
      const {
        data: { data: result },
      } = await axios.get(`${webAddress}/api/events_systems`)
      return result
    },
    {
      // Refetch the data every second
      refetchInterval: 2000,
    }
  )

  let searchInput = useRef(null)

  const showDrawer = () => {
    setDrawer(true)
  }

  const closeDrawer = () => {
    setEditingRecord(null)
    setDrawer(false)
  }
  const deleteAsset = async (assetId: number) => {
    await setAxiosCredentials()

    await axios.post(`${webAddress}/api/assets/unlink`, {
      assetId,
    })

    setEditingRecord({
      ...editingRecord,
      asset: editingRecord.asset.filter(
        (asset: any) => asset.assetableId != assetId
      ),
    })
  }

  const editRecord = (record: any) => {
    let editingObject = { ...record }
    let text = ''
    if (editingObject.text) {
      text = editingObject.text
    }
    if (editingObject.start_date) {
      editingObject.start_date = moment(editingObject.start_date)
    }

    setShowUploader(record.asset ? false : true)
    setEditingRecord({
      ...editingObject,
      text,
    })
    form.resetFields()

    const formData = {
      ...editingObject,
      text,
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
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
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
      if (values.start_date) {
        values.start_date = values.start_date.toDate()
        // values.start_date add 5 hours
        values.start_date.setHours(values.start_date.getHours() + 5)
      }
      console.log(values.start_date)
      console.log({
        ...editingRecord,
        ...values,
      })
      await axios.put(`${webAddress}/api/events_systems/${editingRecord?.id}`, {
        ...editingRecord,
        ...values,
      })
    } else {
      await axios.post(`${webAddress}/api/events_systems/`, {
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

  useEffect(() => {
    moment.tz.setDefault('Asia/Tashkent')
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
      title: 'Дата начала',
      dataIndex: 'start_date',
      render: (_: any, record: any) => {
        let res = ''
        // format date via luxon to DD.MM.YYYY
        if (record.start_date) {
          res = DateTime.fromISO(record.start_date).toFormat('dd.MM.yyyy HH:mm')
        }
        return <span>{res}</span>
      },
      // key: 'sort',
    },
    {
      title: 'Текст',
      dataIndex: 'text',
      render: (_: any, record: any) => {
        return <span dangerouslySetInnerHTML={{ __html: record.text }}></span>
      },
    },
    {
      title: 'Процент выполнения',
      dataIndex: 'progress',
      render: (_: any, record: any) => {
        return record.progress ? (
          <Progress type="circle" percent={record.progress} width={50} />
        ) : (
          ''
        )
      },
    },
    {
      title: 'Статус',
      dataIndex: 'state',
    },
    {
      title: 'Отправлено/Всего',
      dataIndex: 'progress',
      render: (_: any, record: any) => {
        let users_count = 0
        let sent_count = 0
        if (record.users_count) {
          users_count = record.users_count
        }
        if (record.sent_count) {
          sent_count = record.sent_count
        }
        return (
          <span>
            {sent_count}/{users_count}
          </span>
        )
      },
    },
    {
      title: 'Язык',
      dataIndex: 'lang',
    },
  ]

  return (
    <MainLayout title="Акции">
      <div className="flex justify-between mb-3">
        <Button type="primary" onClick={addRecord}>
          {/*
// @ts-ignore */}
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
                    label="Дата начала"
                    name="start_date"
                    rules={[
                      {
                        required: true,
                        message: 'Пожалуйста, укажите дату начала',
                      },
                    ]}
                  >
                    {/*
// @ts-ignore */}
                    <DatePicker
                      format={'DD.MM.YYYY HH:mm'}
                      showTime={{ format: 'HH:mm' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="text"
                    label="Текст"
                    rules={[
                      {
                        required: true,
                        message: 'Пожалуйста, укажите текст',
                      },
                    ]}
                  >
                    <TextArea rows={6} />
                  </Form.Item>
                </Col>
              </Row>
              {editingRecord && (
                <Row>
                  <Col span={24}>
                    {isShowUploader ? (
                      <div>
                        <Dragger {...dropProps}>
                          <div>
                            <p className="ant-upload-drag-icon">
                              {/*
// @ts-ignore */}
                              <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">
                              Нажмите или перетащите файл в эту область, чтобы
                              загрузить
                            </p>
                          </div>
                        </Dragger>
                      </div>
                    ) : (
                      <div className="flex mt-4">
                        {editingRecord &&
                          editingRecord?.asset?.map((item: any) => (
                            <div className="relative w-28" key={item.id}>
                              <Image
                                src={item.link}
                                width="100"
                                height="100"
                                layout="intrinsic"
                              />
                              <div className="absolute top-0 right-0">
                                <Button
                                  size="small"
                                  icon={
                                    // @ts-ignore
                                  <CloseOutlined />
                                }
                                  danger
                                  shape="circle"
                                  type="primary"
                                  onClick={() => deleteAsset(item.assetableId)}
                                ></Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </Col>
                </Row>
              )}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="lang" label="Язык">
                    <Select
                      showSearch
                      placeholder="Выберите язык"
                      optionFilterProp="children"
                      allowClear
                    >
                      <Option value={'ru'}>Русский</Option>
                      <Option value={'uz'}>Узбекский</Option>
                      <Option value={'en'}>Английский</Option>
                    </Select>
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
