import { FC, useEffect } from 'react'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'

const authRequired: FC = () => {
  const { user } = useUI()
  const router = useRouter()

  let userData = user

  if (typeof user == 'string') {
    try {
      userData = JSON.parse(user)
    } catch (e) {}
  }

  useEffect(() => {
    if (!userData) {
      router.push('/login')
    } else {
      if (!userData.user) {
        router.push('/login')
        return
      }
      const userRoles = userData.user.roles.map((role: any) => role.name)
      if (!userRoles.includes('admin')) {
        router.push('/permission_denied')
      }
    }

    /* else {
    const userRoles = auth.user.roles.map((role) => role.name)
    if (!userRoles.includes('admin')) {
      router.push('/login')
    }
  }*/
  }, [user, router, userData])
  return user
}

export default authRequired
