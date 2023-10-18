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
  Progress
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  InboxOutlined,
  CloseOutlined
} from '@ant-design/icons'
import getConfig from 'next/config'
import React, { useState, useRef, useEffect, useMemo } from 'react'
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
  UploadRequestMethod
} from 'rc-upload/lib/interface'
import { write, utils } from 'xlsx'
import { saveAs } from 'file-saver'

const csv = require('csvtojson')
import Image from 'next/image'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const format = 'HH:mm'

axios.defaults.withCredentials = true

const { TabPane } = Tabs

const { Option } = Select
const { Dragger } = Upload

const s2ab = (s: any) => {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF
  return buf
}

const GetDistances = () => {
  const user = authRequired({})
  const {
    darkModeActive // boolean - whether the dark mode is active or not
  } = useDarkMode()
  useEffect(() => {
    if (!user) {
      return
    }
  }, [])
  const [data, setData] = useState([])

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
        onProgress
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
      var formData = new FormData()
      formData.append('file', file)
      console.log('formData', file)


      const reader = new FileReader()

      reader.onload = async (event) => {
        if (event && event!.target) {
          const fileContent = event!.target.result
          const csvData = await csv({
            delimiter: ';'
          }).fromString(fileContent)

          let resultData = []
          console.log('csvData', csvData);
          for (let i = 0; i < csvData.length; i++) {
            const element = csvData[i]
            let lat_from = parseFloat(element['Широта от'].replace(',', '.'))
            let lng_from = parseFloat(element['Долгота от'].replace(',', '.'))
            let lat_to = parseFloat(element['Широта до'].replace(',', '.'))
            let lng_to = parseFloat(element['Долгота до'].replace(',', '.'))
            let postData = {
              id: element['№'],
              number: element['№'],
              lat_from,
              lng_from,
              lat_to,
              lng_to,
              distance: 0,
              done: false
            }

            resultData.push(postData)
            // await axios.post(`${webAddress}/api/terminals`, {
            //   ...element,
            // })
          }
          // @ts-ignore
          setData([...resultData])
          // @ts-ignore
          onSuccess('ok', new XMLHttpRequest())
          for (let i = 0; i < resultData.length; i++) {
            const element = resultData[i]
            const {
              data: { distance: result }
            } = await axios.post(`/api/get-distances`, {
              lat_from: element.lat_from,
              lng_from: element.lng_from,
              lat_to: element.lat_to,
              lng_to: element.lng_to
            })
            resultData[i].distance = +result
            resultData[i].done = true
            // @ts-ignore
            setData([...resultData])
          }

          const worksheet = utils.json_to_sheet(resultData.map((item) => ({
            '№': item.id,
            'Широта от': item.lat_from,
            'Долгота от': item.lng_from,
            'Широта до': item.lat_to,
            'Долгота до': item.lng_to,
            'Расстояние км': item.distance
          })))
          const workbook = utils.book_new()
          utils.book_append_sheet(workbook, worksheet, 'Sheet1')

          const wbout = write(workbook, { bookType: 'xlsx', bookSST: true, type: 'binary' })
          const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
          saveAs(blob, 'data.xlsx')

          // Now fileContent contains the content of the file
        }
      }
// @ts-ignore
      reader.readAsText(file)  // or reader.readAsArrayBuffer(file) for binary files
    }
  }

  const [isDrawerVisible, setDrawer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  })
  const [editingRecord, setEditingRecord] = useState(null as any)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [cities, setCities] = useState([] as any)
  const [isShowUploader, setShowUploader] = useState(false)

  let searchInput = useRef(null)

  const deleteAsset = async (assetId: number) => {
    await setAxiosCredentials()

    await axios.post(`${webAddress}/api/assets/unlink`, {
      assetId
    })

    setEditingRecord({
      ...editingRecord,
      asset: editingRecord.asset.filter(
        (asset: any) => asset.assetableId != assetId
      )
    })
  }

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
    setShowUploader(record.asset ? false : true)

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

  const setAxiosCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true
        },
        withCredentials: true
      })
      let { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes
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
      console.log(editingRecord)
      await axios.put(`${webAddress}/api/sliders/${editingRecord?.id}`, {
        ...editingRecord,
        ...values
      })
    } else {
      await axios.post(`${webAddress}/api/sliders/`, {
        ...values
      })
    }
    setIsSubmittingForm(false)
    closeDrawer()
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
      data: { data: result }
    } = await axios.get(`${webAddress}/api/terminals?search=${value}`)
    setData(result)
    setIsLoading(false)
  }

  const progressPercent = useMemo(() => {
    const done = data.filter((item: any) => item.done).length
    const total = data.length
    return Math.round((done / total) * 100)
  }, [data])


  const columns = [
    {
      title: '№',
      dataIndex: 'number',
      key: 'number'
    },
    {
      title: 'Широта от',
      dataIndex: 'lat_from',
      key: 'lon_from'
    },
    {
      title: 'Долгота от',
      dataIndex: 'lng_from',
      key: 'lng_from'
    },
    {
      title: 'Широта до',
      dataIndex: 'lat_to',
      key: 'lat_to'
    },
    {
      title: 'Долгота до',
      dataIndex: 'lng_to',
      key: 'lng_to'
    },
    {
      title: 'Расстояние',
      dataIndex: 'distance',
      key: 'distance'
    }
  ]

  return (
    <MainLayout title='Дистанции'>
      <div className='flex justify-between mb-3'>
        <Input.Search
          loading={isLoading}
          onSearch={onSearch}
          style={{ maxWidth: 400 }}
        />
        <Button type='primary' onClick={addRecord}>
          {/*
// @ts-ignore */}
          <PlusOutlined /> Добавить
        </Button>
      </div>
      <Row className='my-4'>
        <Col span={24}>
          <div>
            <Dragger {...dropProps}>
              <div>
                <p className='ant-upload-drag-icon'>
                  {/*
// @ts-ignore */}
                  <InboxOutlined />
                </p>
                <p className='ant-upload-text'>
                  Нажмите или перетащите файл в эту область, чтобы
                  загрузить
                </p>
              </div>
            </Dragger>
          </div>
        </Col>
      </Row>
      {data && data.length > 0 && (<div className='my-3'><Progress percent={progressPercent} status='active' /></div>)}
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{ pageSize: 1000 }}
        rowKey='id'
        scroll={{ x: 'calc(700px + 50%)' }}
        size='small'
        bordered
      />
    </MainLayout>
  )
}

GetDistances.displayName = 'GetDistances'
export default GetDistances
