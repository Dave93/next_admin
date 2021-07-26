import React from 'react'
import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(
  () => import('@components/ui/CatalogPage'),
  {
    ssr: false,
  }
)

const CatalogPage = () => <DynamicComponentWithNoSSR />

export default CatalogPage
