import React from 'react'
import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(
  () => import('@components/ui/ModifiersPage'),
  {
    ssr: false,
  }
)

{/*
// @ts-ignore */}
const ModifiersPage = () => <DynamicComponentWithNoSSR />

export default ModifiersPage
