import 'tailwindcss/tailwind.css'
import 'antd/dist/antd.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ManagedUIContext } from '@components/ui/context'
import type { AppProps } from 'next/app'
import { useState } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6LfDMQElAAAAAL0Nbu6ypK_-chUW81SXBIQgeuoe"
      language="RU"
    >
      <ManagedUIContext>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </ManagedUIContext>
    </GoogleReCaptchaProvider>
  )
}
export default MyApp
