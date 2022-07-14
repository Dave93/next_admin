import Head from 'next/head'
import { Alert, Button, Card, Col, DatePickerProps, Progress, Row } from 'antd'
import { DatePicker, Space } from 'antd'
import moment from 'moment'
import { DownloadOutlined } from '@ant-design/icons'
import getConfig from 'next/config'
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useDarkMode } from 'next-dark-mode'
import MainLayout from '@components/ui/MainLayout'
import authRequired from '@services/authRequired'
import Cookies from 'js-cookie'

const { RangePicker } = DatePicker

const dateFormat = 'DD.MM.YYYY'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

axios.defaults.withCredentials = true

export default function Menus() {
  const user = authRequired({})
  const {
    darkModeActive, // boolean - whether the dark mode is active or not
  } = useDarkMode()
  const [dates, setDates] = useState([
    moment().startOf('month').format(dateFormat),
    moment().endOf('month').format(dateFormat),
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [percent, setPercent] = useState<number | null>(null)
  const [dowloadLink, setDownloadLink] = useState('')

  useEffect(() => {
    if (!user) {
      return
    }
  }, [])

  const calendarChage = (dates: any, dateStrings: [string, string]) => {
    setDates(dateStrings)
  }

  const downloadReport = async () => {
    const a = document.createElement('a')
    a.href = dowloadLink
    a.download = dowloadLink
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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

  const startCreatingReport = async () => {
    setIsLoading(true)
    setErrorMessage('')
    setDownloadLink('')
    await setAxiosCredentials()
    const {
      data: { data: result },
    }: { data: { data: any } } = await axios.get(`${webAddress}/api/terminals`)
    console.log(result)
    const otpToken = Cookies.get('opt_token')
    for (const terminal in result) {
      const { data: terminalResult } = await axios.post(
        `${webAddress}/api/terminals/report`,
        {
          terminalId: result[terminal].id,
          dateFrom: dates[0],
          dateTo: dates[1],
          start: terminal == '0' ? true : false,
        },
        {
          headers: {
            Authorization: `Bearer ${otpToken}`,
          },
        }
      )

      if (
        typeof terminalResult.result != 'undefined' &&
        !terminalResult.result
      ) {
        setErrorMessage(terminalResult.message)

        setIsLoading(false)
        setPercent(null)
      } else {
        setIsLoading(false)
        let key = parseInt(terminal, 0) + 1
        console.log('key', key)
        console.log('length', result.length)
        setPercent(Math.ceil((key / result.length) * 100))
        setDownloadLink(terminalResult.link)
      }
    }
    // let ress = await axios.post(
    //   `${webAddress}/api/auth_otp`,
    //   {
    //     phone: '+998' + phoneValue,
    //     code: passwordValue,
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${otpToken}`,
    //     },
    //     withCredentials: true,
    //   }
    // )
  }

  useEffect(() => {}, [])

  return (
    <MainLayout title="Отчёт по филиалам">
      <Row gutter={16}>
        <Col>
          <RangePicker
            defaultValue={[moment().startOf('month'), moment().endOf('month')]}
            format={dateFormat}
            onCalendarChange={calendarChage}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            shape="round"
            size="middle"
            onClick={() => startCreatingReport()}
            loading={isLoading}
          >
            Сформировать
          </Button>
        </Col>
      </Row>

      {errorMessage.length > 0 && (
        <div className="my-3">
          <Alert
            message="Error"
            description={errorMessage}
            type="error"
            showIcon
          />
        </div>
      )}

      {percent != null && (
        <div className="my-3">
          <Card
            hoverable
            title={percent < 100 ? 'Формируем отчёт' : 'Отчёт готов'}
          >
            {percent < 100 ? (
              <Progress percent={percent} status="active" />
            ) : (
              <div>
                <Button
                  type="primary"
                  shape="round"
                  icon={<DownloadOutlined />}
                  size="middle"
                  onClick={() => downloadReport()}
                >
                  Скачать
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </MainLayout>
  )
}
