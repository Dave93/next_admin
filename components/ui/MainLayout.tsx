import { Layout, Menu, Dropdown } from 'antd'
import {
  UserOutlined,
  TranslationOutlined,
  HomeOutlined,
  DownOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  MenuOutlined,
  FileTextOutlined,
  FileImageOutlined,
  PercentageOutlined,
  CarOutlined,
  SendOutlined,
  TeamOutlined
} from '@ant-design/icons'
import Head from 'next/head'
import { LocationMarkerIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useDarkMode } from 'next-dark-mode'
// import { useAuth } from "../../services/useAuth";
import styles from './MainLayout.module.css'
import React, { ReactNode } from 'react'
import { useUI } from '@components/ui/context'

const { Header, Content, Footer, Sider } = Layout
const { SubMenu } = Menu

export default function MainLayout({
  children,
  title = '',
}: {
  children: ReactNode
  title: string
}) {
  const route = useRouter()
  // const { logout } = useAuth();

  const {
    darkModeActive, // boolean - whether the dark mode is active or not
  } = useDarkMode()

  // const signOut = async () => {
  //   console.log("davr");
  //   await logout();
  //   route.route.push("/login");
  // };

  const logout = () => {
    localStorage.removeItem('mijoz')
    return route.push('/login')
  }

  const { user } = useUI()
  const menu = (
    <Menu>
      <Menu.Item danger key="logout" onClick={logout}>
        <span>Выйти</span>
      </Menu.Item>
    </Menu>
  )

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          theme={darkModeActive ? 'dark' : 'light'}
        >
          <div className={styles.logo} />
          <Menu
            theme={darkModeActive ? 'dark' : 'light'}
            mode="inline"
            defaultSelectedKeys={[route.pathname]}
          >
            <Menu.Item key="/" icon={
              // @ts-ignore
              <HomeOutlined />
            }>
              <Link href="/">Главная</Link>
            </Menu.Item>
            <Menu.Item
              key="/get-distances"
              icon={
                // @ts-ignore
                <TeamOutlined
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/get-distances">Получить дистанции</Link>
            </Menu.Item>
            <Menu.Item
              key="/organizations"
              icon={
                // @ts-ignore
                <TeamOutlined
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/organizations">Организации</Link>
            </Menu.Item>
            <Menu.Item
              key="/organizations_fills"
              icon={
                // @ts-ignore
                <TeamOutlined
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/organizations_fills">Документы организаций</Link>
            </Menu.Item>
            <Menu.Item
              key="/cities"
              icon={
               // @ts-ignore
                <LocationMarkerIcon
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/cities">Города</Link>
            </Menu.Item>
            <Menu.Item
              key="/sliders"
              icon={
              // @ts-ignore
                <FileImageOutlined
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/sliders">Слайдеры</Link>
            </Menu.Item>
            <Menu.Item
              key="/news"
              icon={
              // @ts-ignore
                <UnorderedListOutlined
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/news">Новости</Link>
            </Menu.Item>
            <Menu.Item
              key="/sale"
              icon={
              // @ts-ignore
                <UnorderedListOutlined
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/sale">Акции</Link>
            </Menu.Item>
            <Menu.Item
              key="/terminals"
              icon={
              // @ts-ignore
                <LocationMarkerIcon
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/terminals">Терминалы</Link>
            </Menu.Item>
            <Menu.Item key="/terminals_report" icon={
                // @ts-ignore
              <MenuOutlined />
            }>
              <Link href="/terminals_report">Отчёт по филиалам</Link>
            </Menu.Item>
            <Menu.Item key="/events_system" icon={
                // @ts-ignore
              <SendOutlined />
            }>
              <Link href="/events_system">Рассылка</Link>
            </Menu.Item>
            <Menu.Item key="/mobile_push_events" icon={
                // @ts-ignore
              <SendOutlined />
            }>
              <Link href="/mobile_push_events">Mobile рассылки</Link>
            </Menu.Item>
            <Menu.Item key="/delivery_pricing" icon={
                // @ts-ignore
              <CarOutlined />
            }>
              <Link href="/delivery_pricing">Условия доставки</Link>
            </Menu.Item>
            <Menu.Item key="/order_statuses" icon={
                // @ts-ignore
              <SettingOutlined />
            }>
              <Link href="/order_statuses">Статусы заказов</Link>
            </Menu.Item>
            <Menu.Item key="/configs" icon={
                // @ts-ignore
              <SettingOutlined />
            }>
              <Link href="/configs">Настройки</Link>
            </Menu.Item>
            <Menu.Item key="/langs" icon={
                // @ts-ignore
              <TranslationOutlined />
            }>
              <Link href="/langs">Языки</Link>
            </Menu.Item>
            <Menu.Item key="/users" icon={
                // @ts-ignore
              <UserOutlined />
            }>
              <Link href="/users">Пользователи</Link>
            </Menu.Item>
            <Menu.Item key="/menus" icon={
                // @ts-ignore
              <MenuOutlined />
            }>
              <Link href="/menus">Пункты меню</Link>
            </Menu.Item>
            <Menu.Item key="/catalog" icon={
                // @ts-ignore
              <MenuOutlined />
            }>
              <Link href="/catalog">Каталог</Link>
            </Menu.Item>
            <Menu.Item key="/modifiers" icon={
                // @ts-ignore
              <MenuOutlined />
            }>
              <Link href="/modifiers">Модификаторы</Link>
            </Menu.Item>
            <Menu.Item key="/sms_templates" icon={
                // @ts-ignore
              <FileTextOutlined />
            }>
              <Link href="/sms_templates">Шаблоны смс</Link>
            </Menu.Item>
            <Menu.Item key="/sales_rules" icon={
                // @ts-ignore
              <PercentageOutlined />
            }>
              <Link href="/sales_rules">Правила акций</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header className={`${styles.siteLayoutSubHeaderBackground} px-3`}>
            <Dropdown overlay={menu}>
              <a
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                {/*
// @ts-ignore */}
                {user?.user?.name} <DownOutlined />
              </a>
            </Dropdown>
          </Header>
          <Content style={{ margin: '24px 16px 0' }}>
            <div
              className={styles.siteLayoutBackground}
              style={{ padding: 24, minHeight: 360 }}
            >
              {children}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Havoqand ©{new Date().getFullYear()} Created with &hearts; by Davr
          </Footer>
        </Layout>
      </Layout>
    </>
  )
}
