import React from 'react'
import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(
  () => import('@components/ui/MobilePushEvents'),
  {
    ssr: false,
  }
)

const SalePage = () => <DynamicComponentWithNoSSR />

export default SalePage
