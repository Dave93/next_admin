import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { LockClosedIcon } from '@heroicons/react/solid'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/router'
import { Input, Form } from 'antd'
import axios from 'axios'
import Cookies from 'js-cookie'

export default function Login() {
  const router = useRouter()
  const { register, handleSubmit, control, watch } = useForm()
  const [isCodeSent, setCodeSent] = useState(false)

  const phoneValue = watch('phone')
  const passwordValue = watch('password')

  const onSubmit = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    // try {
    //   const loginAttempt = await login(email, password)
    //   if (loginAttempt.status === 204) {
    //     router.push('/')
    //   } else {
    //     alert('Login failed')
    //   }
    // } catch (error) {
    //   console.error(error)
    // }
  }
  return (
    <>
      <Head>
        <title>HQ Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
              alt="Workflow"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <Form.Item label="Телефон" labelCol={{ span: 5 }}>
                  <Controller
                    name="phone"
                    defaultValue=""
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChange={onChange}
                        value={value}
                        addonBefore="+998"
                        allowClear
                      />
                    )}
                  />
                </Form.Item>
              </div>
              {isCodeSent && (
                <div>
                  <Form.Item label="Код из смс" labelCol={{ span: 5 }}>
                    <Controller
                      name="password"
                      defaultValue=""
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input.Password
                          onChange={onChange}
                          value={value}
                          allowClear
                        />
                      )}
                    />
                  </Form.Item>
                </div>
              )}
            </div>
            {!isCodeSent && (
              <div>
                <button
                  type="submit"
                  className={`${
                    !phoneValue ? 'opacity-40 cursor-not-allowed' : ''
                  } group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  disabled={!phoneValue}
                >
                  Получить код
                </button>
              </div>
            )}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon
                    className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                    aria-hidden="true"
                  />
                </span>
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

// export async function getServerSideProps({ res, req }) {
//   // Is there a better way to know the user is already logged in?
//   console.log(process.env.API_URL)
//   try {
//     const isAuthed = await fetch(`${process.env.API_URL}/api/user`, {
//       credentials: 'include',
//       headers: {
//         accept: 'application/json',
//         referer: 'http://localhost:3000/',
//         cookie: req.headers.cookie,
//       },
//     })
//     const data = await isAuthed.text()
//     console.log(data)
//     if (isAuthed.status === 200) {
//       res.setHeader('Location', '/')
//       res.statusCode = 302

//       return { props: {} }
//     }
//   } catch (error) {
//     console.error(error)
//   }

//   const csrf = await fetch(`${process.env.API_URL}/sanctum/csrf-cookie`)
//   res.setHeader('set-cookie', csrf.headers.raw()['set-cookie'])

//   return { props: {} }
// }
