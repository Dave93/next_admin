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
  MergeCellsOutlined,
  DownOutlined,
} from '@ant-design/icons'
import getConfig from 'next/config'
import React, { useState, useRef, useEffect, useMemo } from 'react'
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

  // Drawers
  const [isDrawerVisible, setDrawer] = useState(false)
  const [isVariantDrawerVisible, setVariantDrawer] = useState(false)
  const [isMergeDrawerVisible, setMergeDrawerVisible] = useState(false)

  // Editing
  const [editingCategory, setEditingCategory] = useState(null as any)
  const [editingMenuRecord, setEditingMenuRecord] = useState(null as any)
  const [editingVariant, setEditingVariant] = useState(null as any)

  // Table loaders
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [isVariantsLoading, setIsVariantsLoading] = useState(false)

  // Form submit loaders
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [isVariantSubmittingForm, setIsVariantSubmittingForm] = useState(false)
  const [isMergeSubmittingForm, setIsMergeSubmittingForm] = useState(false)

  // Table datas
  const [data, setData] = useState([])
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])

  // Selections
  const [selectedCategory, setSelectedCategory] = useState(null as any)
  const [selectedProducts, setSelectedProducts] = useState([] as any[])
  const [selectedVariant, setSelectedVariant] = useState(null as any)

  // Search and Channel
  const [channelName, setChannelName] = useState('')
  const [productSearchText, setProductSearchText] = useState('')

  // Forms
  const [form] = Form.useForm()
  const [mergeForm] = Form.useForm()
  const [variantForm] = Form.useForm()

  const editCategory = () => {
    setEditingCategory(selectedCategory)
    let name = selectedCategory.attribute_data.name[channelName]
    form.resetFields()
    form.setFieldsValue({ name_ru: name.ru, name_uz: name.uz })
    setDrawer(true)
  }

  const editVariant = () => {
    setEditingVariant(selectedVariant)
    let name = selectedVariant.attribute_data.name[channelName]
    variantForm.resetFields()
    variantForm.setFieldsValue({
      name_ru: name.ru,
      name_uz: name.uz,
      custom_name: selectedVariant.custom_name,
    })
    setVariantDrawer(true)
  }

  const addRecord = () => {
    setEditingCategory(null)
    form.resetFields()
    setDrawer(true)
  }

  const deleteMenuItem = async (record: any) => {
    setIsMenuLoading(true)
    await axios.delete(`${webAddress}/api/menu_items/${record.id}`)
    // menuItems()
  }

  const closeDrawer = () => {
    setEditingCategory(null)
    setDrawer(false)
  }

  const closeMergeDrawer = () => {
    setMergeDrawerVisible(false)
  }

  const closeVariantDrawer = () => {
    setVariantDrawer(false)
  }

  const startMergeProducts = () => {
    setMergeDrawerVisible(true)
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
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/categories?mode=tree`)
    setChannelName(channelData.name)
    setData(result)
  }

  const fetchProducts = async (selectedId: number = 0) => {
    setIsMenuLoading(true)
    const {
      data: { data: result },
    } = await axios.get(
      `${webAddress}/api/products?categoryId=${selectedId}&product_id=0`
    )
    setProducts(result)
    setIsMenuLoading(false)
  }

  const fetchVariants = async (selectedId: number = 0) => {
    setIsVariantsLoading(true)
    const {
      data: { data: result },
    } = await axios.get(
      `${webAddress}/api/products/variants?product_id=${selectedId}`
    )
    setVariants(result)
    setIsVariantsLoading(false)
  }

  const setAxiosCredentials = () => {
    const csrf = Cookies.get('X-XSRF-TOKEN')
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const submitVariantForm = () => {
    variantForm.submit()
  }

  const submitMergeForm = () => {
    mergeForm.submit()
  }

  const submitForm = () => {
    form.submit()
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

  const onProductsFinish = async (values: any) => {
    setIsMergeSubmittingForm(true)
    setAxiosCredentials()

    await axios.post(`${webAddress}/api/products/merge`, {
      ...values,
      productIds: selectedProducts.map((prod) => prod.id),
      categoryId: selectedCategory.id,
    })

    setIsMergeSubmittingForm(false)
    closeMergeDrawer()
    fetchProducts(selectedCategory.id)
  }

  const onVariantFinish = async (values: any) => {
    setIsVariantSubmittingForm(true)
    setAxiosCredentials()

    await axios.put(`${webAddress}/api/products/${selectedVariant.id}`, {
      ...values,
    })

    setIsVariantSubmittingForm(false)
    closeVariantDrawer()
    let editableCount = selectedProducts.filter(
      (prod) => !prod.product_id && prod.price <= 0
    )
    if (editableCount.length === 1) {
      fetchVariants(editableCount[0].id)
    }
  }

  const onSearch = async (value: any) => {
    setProductSearchText(value)
  }

  const onSelect = async (
    selectedKeys: Key[],
    info: {
      node: any
      selectedNodes: DataNode[]
    }
  ) => {
    setSelectedProducts([])
    setSelectedCategory(info.node)
    fetchProducts(info?.node?.id)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const selectedProductsCount = useMemo(() => {
    let count = 0
    count = selectedProducts.filter((prod) => prod.price > 0).length
    return count
  }, [selectedProducts])

  const activeProductEdit = useMemo(() => {
    let active = false
    const prodLength = selectedProducts.filter(
      (prod) => prod.price <= 0 && !prod.product_id
    ).length
    active = prodLength == 1 && prodLength == selectedProducts.length
    return active
  }, [selectedProducts])

  const filteredProduct = useMemo(() => {
    let result = products

    if (productSearchText.length > 0) {
      result = result.filter((prod: any) => {
        return (
          prod?.attribute_data?.name[channelName]?.ru
            .toLowerCase()
            .indexOf(productSearchText.toLowerCase()) >= 0 ||
          prod?.attribute_data?.name[channelName]?.uz
            .toLowerCase()
            .indexOf(productSearchText.toLowerCase()) >= 0
        )
      })
    }

    return result
  }, [products, productSearchText])

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
  ]

  const expandedRowRender = (record: any) => {
    const columns = [
      { title: 'Название', dataIndex: 'name', key: 'name' },
      {
        title: 'Цена',
        key: 'price',
        render: (_: any, rec: any) => (
          <span>
            {new Intl.NumberFormat('uz', {
              style: 'currency',
              currency: 'UZS',
              maximumFractionDigits: 0,
            }).format(rec?.price)}
          </span>
        ),
      },
    ]
    return (
      <Table
        columns={columns}
        dataSource={record?.modifiers}
        pagination={false}
        rowKey="id"
        size="small"
        title={() => <div className="font-bold text-xl">Модификаторы</div>}
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
          editingVariant ? 'Редактировать вариант' : 'Добавить новую категорию'
        }
        width={720}
        onClose={closeVariantDrawer}
        visible={isVariantDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={closeVariantDrawer} style={{ marginRight: 8 }}>
              Отмена
            </Button>
            <Button
              onClick={submitVariantForm}
              loading={isVariantSubmittingForm}
              type="primary"
            >
              Сохранить
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={variantForm}
          size="small"
          onFinish={onVariantFinish}
          initialValues={editingVariant ? editingVariant : undefined}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name_ru"
                label="Название товара(рус)"
                rules={[{ required: true, message: 'Просьба ввести название' }]}
              >
                <Input placeholder="Просьба ввести название" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_uz"
                label="Название товара(узб)"
                rules={[{ required: true, message: 'Просьба ввести название' }]}
              >
                <Input placeholder="Просьба ввести название" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="custom_name"
                label="Заголовок варианта"
                rules={[
                  { required: true, message: 'Просьба ввести заголовок' },
                ]}
              >
                <Input placeholder="Просьба ввести заголовок" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
      <Drawer
        title={'Объединить товары'}
        width={720}
        onClose={closeMergeDrawer}
        visible={isMergeDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={closeMergeDrawer} style={{ marginRight: 8 }}>
              Отмена
            </Button>
            <Button
              onClick={submitMergeForm}
              loading={isMergeSubmittingForm}
              type="primary"
            >
              Объединить
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={mergeForm}
          size="small"
          onFinish={onProductsFinish}
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
        </Form>
      </Drawer>
      <Row gutter={16}>
        <Col span={4}>
          <div className="font-bold text-xl mb-3">Категории</div>
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
        <Col span={12}>
          <div className="font-bold text-xl mb-3">Продукты</div>
          <div className="flex space-x-2 mb-3">
            <Button
              type="primary"
              onClick={startMergeProducts}
              disabled={
                selectedProductsCount < 2 ||
                selectedProductsCount != selectedProducts.length
              }
            >
              <MergeCellsOutlined /> Объединить {selectedProductsCount}
            </Button>
            <Button
              type="primary"
              onClick={editCategory}
              disabled={!activeProductEdit}
            >
              <EditOutlined /> Редактировать
            </Button>
            <Input.Search
              placeholder="Search..."
              allowClear
              onSearch={onSearch}
            />
          </div>
          <Table
            columns={productsColumns}
            dataSource={filteredProduct}
            loading={isMenuLoading}
            expandable={{ expandedRowRender }}
            rowKey="id"
            size="small"
            bordered
            rowSelection={{
              type: 'checkbox',
              onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
                setSelectedProducts(selectedRows)
                setSelectedVariant(null)
                let editableCount = selectedRows.filter(
                  (prod) => !prod.product_id && prod.price <= 0
                )
                if (editableCount.length === 1) {
                  fetchVariants(editableCount[0].id)
                } else {
                  setVariants([])
                }
              },
            }}
          />
        </Col>
        <Col span={8}>
          <div className="font-bold text-xl mb-3">Варианты</div>
          <div className="flex space-x-2 mb-3">
            <Button
              type="primary"
              onClick={editVariant}
              disabled={!selectedVariant}
            >
              <EditOutlined /> Редактировать
            </Button>
          </div>
          <Table
            columns={productsColumns}
            dataSource={variants}
            loading={isVariantsLoading}
            expandable={{ expandedRowRender }}
            rowKey="id"
            size="small"
            bordered
            rowSelection={{
              type: 'radio',
              onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
                setSelectedVariant(selectedRows[0])
              },
            }}
          />
        </Col>
      </Row>
    </MainLayout>
  )
}
