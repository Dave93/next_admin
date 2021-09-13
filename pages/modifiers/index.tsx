import React from 'react'
import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(
  () => import('@components/ui/ModifiersPage'),
  {
    ssr: false,
  }
)

const ModifiersPage = () => <DynamicComponentWithNoSSR />

export default ModifiersPage
