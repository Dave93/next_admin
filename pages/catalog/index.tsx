import Head from 'next/head'
import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Table,
  Tooltip,
  Popconfirm,
  Tree,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  DeleteOutlined,
  DownOutlined,
} from '@ant-design/icons'
import getConfig from 'next/config'
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useDarkMode } from 'next-dark-mode'
import MainLayout from '@components/ui/MainLayout'
import authRequired from '@services/authRequired'
import Cookies from 'js-cookie'
import defaultChannel from '@services/defaultChannel'
import { Key } from 'antd/lib/table/interface'
import { DataNode, EventDataNode } from 'antd/lib/tree'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

axios.defaults.withCredentials = true

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
  const [editingCategory, setEditingCategory] = useState(null as any)
  const [isMenuDrawerVisible, setMenuDrawer] = useState(false)
  const [editingMenuRecord, setEditingMenuRecord] = useState(null as any)
  const [isLoading, setIsLoading] = useState(false)
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [isMenuSubmittingForm, setIsMenuSubmittingForm] = useState(false)
  const [data, setData] = useState([])
  const [menuData, setMenuData] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([] as number[])
  const [selectedCategory, setSelectedCategory] = useState(null as any)
  const [channelName, setChannelName] = useState('')

  let searchInput = useRef(null)
  const [form] = Form.useForm()
  const [menuForm] = Form.useForm()

  const closeDrawer = () => {
    setEditingCategory(null)
    setDrawer(false)
  }

  const editCategory = () => {
    setEditingCategory(selectedCategory)
    let name = selectedCategory.attribute_data.name[channelName]
    form.resetFields()
    form.setFieldsValue({ name_ru: name.ru, name_uz: name.uz })
    setDrawer(true)
  }

  const addRecord = () => {
    setEditingCategory(null)
    form.resetFields()
    setDrawer(true)
  }

  const closeMenuDrawer = () => {
    setEditingMenuRecord(null)
    setMenuDrawer(false)
  }

  const editMenuRecord = (record: any) => {
    setEditingMenuRecord(record)
    menuForm.resetFields()
    menuForm.setFieldsValue(record)
    setMenuDrawer(true)
  }

  const deleteMenuItem = async (record: any) => {
    setIsMenuLoading(true)
    await axios.delete(`${webAddress}/api/menu_items/${record.id}`)
    // menuItems()
  }

  const addMenuRecord = () => {
    setEditingMenuRecord(null)
    menuForm.resetFields()
    setMenuDrawer(true)
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
    const channelData = await defaultChannel()
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/categories?mode=tree`)
    setChannelName(channelData.name)
    setData(result)
    setIsLoading(false)
  }

  const fetchProducts = async (selectedId: number = 0) => {
    setIsMenuLoading(true)
    const {
      data: { data: result },
    } = await axios.get(
      `${webAddress}/api/products?parentId=${
        selectedId ? selectedId : selectedRowKeys[0]
      }`
    )
    setMenuData(result)
    setIsMenuLoading(false)
  }

  // const menuItems = async (selectedId: number = 0) => {
  //   setIsMenuLoading(true)
  //   const {
  //     data: { data: result },
  //   } = await axios.get(
  //     `${webAddress}/api/menu_items?type_id=${
  //       selectedId ? selectedId : selectedRowKeys[0]
  //     }`
  //   )
  //   setMenuData(result)
  //   setIsMenuLoading(false)
  // }

  const setAxiosCredentials = () => {
    const csrf = Cookies.get('X-XSRF-TOKEN')
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const onCategoryFinish = async (values: any) => {
    setIsSubmittingForm(true)
    setAxiosCredentials()
    if (editingCategory) {
      await axios.put(`${webAddress}/api/categories/${editingCategory?.id}`, {
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

  const onMenuFinish = async (values: any) => {
    setIsMenuSubmittingForm(true)
    setAxiosCredentials()
    if (editingMenuRecord) {
      await axios.put(`${webAddress}/api/menu_items/${editingMenuRecord?.id}`, {
        ...editingMenuRecord,
        ...values,
        type_id: selectedRowKeys[0],
      })
    } else {
      await axios.post(`${webAddress}/api/menu_items/`, {
        ...values,
        type_id: selectedRowKeys[0],
      })
    }
    setIsMenuSubmittingForm(false)
    closeMenuDrawer()
    // menuItems()
  }

  const submitMenuForm = () => {
    menuForm.submit()
  }

  const onSearch = async (value: any) => {
    setIsLoading(true)
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/menu_types?search=${value}`)
    setData(result)
    setIsLoading(false)
  }

  const onSelect = async (
    selectedKeys: Key[],
    info: {
      node: any
      selectedNodes: DataNode[]
    }
  ) => {
    console.log('selected', info.selectedNodes)
    console.log('selectedNode', info.node)
    setSelectedCategory(info.node)
    fetchProducts(info?.node?.id)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const productsColumns = [
    {
      title: 'Название(RU)',
      dataIndex: 'name_ru',
      render: (_: any, record: any) => {
        return <div>{record?.attribute_data?.name[channelName]?.ru}</div>
      },
    },
    {
      title: 'Название(UZ)',
      dataIndex: 'name_uz',
      render: (_: any, record: any) => {
        return <div>{record?.attribute_data?.name[channelName]?.uz}</div>
      },
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      render: (_: any, record: any) => {
        return (
          <div>
            {new Intl.NumberFormat('uz', {
              style: 'currency',
              currency: 'UZS',
              maximumFractionDigits: 0,
            }).format(record?.price)}
          </div>
        )
      },
    },
    {
      title: 'Название варианта',
      dataIndex: 'custom_name',
      key: 'custom_name',
    },
  ]

  const expandedRowRender = (record: any) => {
    const columns = [
      { title: 'Название', dataIndex: 'name', key: 'name' },
      {
        title: 'Цена',
        key: 'price',
        render: () => (
          <span>
            {new Intl.NumberFormat('uz', {
              style: 'currency',
              currency: 'UZS',
              maximumFractionDigits: 0,
            }).format(record?.price)}
          </span>
        ),
      },
    ]
    return (
      <Table
        columns={columns}
        dataSource={record?.modifiers}
        pagination={false}
        title={() => <div className="font-bold">Модификаторы</div>}
        bordered={true}
      />
    )
  }

  return (
    <MainLayout title="Каталог">
      <Drawer
        title={
          editingCategory
            ? 'Редактировать категорию'
            : 'Добавить новую категорию'
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
          onFinish={onCategoryFinish}
          initialValues={editingCategory ? editingCategory : undefined}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Код">
                <span>
                  {selectedCategory?.attribute_data?.name[channelName].ru}
                </span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_uz"
                label="Название(узб)"
                rules={[{ required: true, message: 'Просьба ввести название' }]}
              >
                <Input placeholder="Просьба ввести название" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
      <Drawer
        title={
          editingMenuRecord
            ? 'Редактировать пункт меню'
            : 'Добавить новый пункт меню'
        }
        width={720}
        onClose={closeMenuDrawer}
        visible={isMenuDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={closeMenuDrawer} style={{ marginRight: 8 }}>
              Отмена
            </Button>
            <Button
              onClick={submitMenuForm}
              loading={isMenuSubmittingForm}
              type="primary"
            >
              Сохранить
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={menuForm}
          hideRequiredMark
          size="small"
          onFinish={onMenuFinish}
          initialValues={editingMenuRecord ? editingMenuRecord : undefined}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name_ru"
                label="Заголовок(RU)"
                rules={[
                  { required: true, message: 'Просьба ввести заголовок' },
                ]}
              >
                <Input placeholder="Просьба ввести заголовок" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_uz"
                label="Заголовок(UZ)"
                rules={[
                  { required: true, message: 'Просьба ввести заголовок' },
                ]}
              >
                <Input placeholder="Просьба ввести заголовок" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="href"
                label="Ссылка"
                rules={[{ required: true, message: 'Просьба ввести ссылку' }]}
              >
                <Input placeholder="Просьба ввести ссылку" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sort"
                label="Сортировка"
                rules={[
                  { required: true, message: 'Просьба ввести сортировку' },
                ]}
              >
                <Input placeholder="Просьба ввести сортировку" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
      <Row gutter={16}>
        <Col span={4}>
          <div className="flex justify-between mb-3">
            <Button
              type="primary"
              onClick={editCategory}
              disabled={!selectedCategory}
            >
              <EditOutlined /> Редактировать
            </Button>
          </div>
          <Tree
            showLine
            switcherIcon={<DownOutlined />}
            onSelect={onSelect}
            selectable={true}
            treeData={data}
            key="id"
            titleRender={(item: any) => (
              <div>{item?.attribute_data?.name[channelName]?.ru}</div>
            )}
          />
        </Col>
        <Col span={20}>
          <div className="flex justify-between mb-3">
            <Button
              type="primary"
              onClick={addMenuRecord}
              disabled={!selectedRowKeys.length}
            >
              <PlusOutlined /> Добавить
            </Button>
          </div>
          <Table
            columns={productsColumns}
            dataSource={menuData}
            loading={isMenuLoading}
            expandable={{ expandedRowRender }}
            rowKey="id"
            size="small"
            bordered
          />
        </Col>
      </Row>
    </MainLayout>
  )
}
