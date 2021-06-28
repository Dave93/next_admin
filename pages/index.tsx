import authRequired from '@services/authRequired'
import React from 'react'
import LoadingScreen from '@components/ui/LoadingScreen'
import MainLayout from '@components/ui/MainLayout'

export default function Home() {
  const user = authRequired({})

  if (!user) {
    return <LoadingScreen />
  }

  return (
    <MainLayout title="Home">
      <h3>Davr</h3>
    </MainLayout>
  )
}
