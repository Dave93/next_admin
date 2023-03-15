import 'tailwindcss/tailwind.css'
import 'antd/dist/antd.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ManagedUIContext } from '@components/ui/context'
import type { AppProps } from 'next/app'
import { useState } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
let captchaKey = publicRuntimeConfig.captchaKey

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <GoogleReCaptchaProvider reCaptchaKey={captchaKey} language="RU">
      <ManagedUIContext>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </ManagedUIContext>
    </GoogleReCaptchaProvider>
  )
}
export default MyApp
