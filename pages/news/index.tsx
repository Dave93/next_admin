import React from 'react'
import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(
  () => import('@components/ui/NewsPage'),
  {
    ssr: false,
  }
)

{/*
// @ts-ignore */}
const NewsPage = () => <DynamicComponentWithNoSSR />

export default NewsPage
