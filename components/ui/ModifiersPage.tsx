import Head from 'next/head'
import currency from 'currency.js'
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

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const format = 'HH:mm'

axios.defaults.withCredentials = true

const { Dragger } = Upload

const Modifiers = () => {
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
      setAxiosCredentials()
      var formData = new FormData()
      formData.append('file', file)
      formData.append('parent', 'modifiers')
      formData.append('primary', 'true')
      const hashids = new Hashids(
        'modifiers',
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
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [data, setData] = useState([])
  const [editingRecord, setEditingRecord] = useState(null as any)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [isShowUploader, setShowUploader] = useState(false)

  let searchInput = useRef(null)

  const deleteAsset = async (assetId: number) => {
    setAxiosCredentials()

    await axios.post(`${webAddress}/api/assets/unlink`, {
      assetId,
    })

    setEditingRecord([
      {
        ...editingRecord,
        asset: editingRecord.asset.filter((asset: any) => asset.id != assetId),
      },
    ])
  }

  const showDrawer = () => {
    setDrawer(true)
  }

  const closeDrawer = () => {
    setEditingRecord(null)
    setDrawer(false)
  }

  const editRecord = (record: any) => {
    setEditingRecord({
      ...record,
    })
    form.resetFields()
    setShowUploader(record.asset ? false : true)

    const formData = {
      ...record,
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
    } = await axios.get(`${webAddress}/api/modifiers`)
    setData(result)
    setIsLoading(false)
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
      await axios.put(`${webAddress}/api/modifiers/${editingRecord?.id}`, {
        ...editingRecord,
        ...values,
      })
    } else {
      await axios.post(`${webAddress}/api/modifiers/`, {
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
      title: 'Активность',
      dataIndex: 'active',
      key: 'active',
      render: (_: any) => {
        return <Switch disabled defaultChecked={_} />
      },
    },
    {
      title: 'Заголовок',
      dataIndex: 'name',
      key: 'name',
      sorter: {
        compare: (a: any, b: any) => a.name - b.name,
      },
    },
    {
      title: 'Заголовок(UZ)',
      dataIndex: 'name_uz',
      key: 'name_uz',
      sorter: {
        compare: (a: any, b: any) => a.name_uz - b.name_uz,
      },
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      render: (_: any, record: any) => {
        return (
          <div>
            {currency(record?.price, {
              pattern: '# !',
              separator: ' ',
              decimal: '.',
              symbol: `сум`,
              precision: 0,
            }).format()}
          </div>
        )
      },
    },
  ]

  return (
    <MainLayout title="Модификаторы">
      <div className="flex justify-between mb-3">
        <Input.Search
          loading={isLoading}
          onSearch={onSearch}
          style={{ maxWidth: 400 }}
        />
        {/* <Button type="primary" onClick={addRecord}>
          <PlusOutlined /> Добавить
        </Button> */}
      </div>
      <Drawer
        title={
          editingRecord
            ? 'Редактировать модификатор'
            : 'Добавить новый модификатор'
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
            <div>
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
                  <Form.Item
                    name="name_uz"
                    label="Название(UZ)"
                    rules={[
                      { required: true, message: 'Просьба ввести название' },
                    ]}
                  >
                    <Input placeholder="Просьба ввести название" />
                  </Form.Item>
                </Col>
              </Row>
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
                                onClick={() => deleteAsset(item.id)}
                              ></Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          )}
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

Modifiers.displayName = 'Modifiers'
export default Modifiers
