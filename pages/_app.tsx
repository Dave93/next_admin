import 'tailwindcss/tailwind.css'
import 'antd/dist/antd.css'
import { ManagedUIContext } from '@components/ui/context'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ManagedUIContext>
      <Component {...pageProps} />
    </ManagedUIContext>
  )
}
export default MyApp
