import { FC, useEffect } from 'react'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'

const authRequired: FC = () => {
  const { user } = useUI()
  const router = useRouter()
  useEffect(() => {
    if (!user) {
      router.push('/login')
    } /* else {
    const userRoles = auth.user.roles.map((role) => role.name)
    if (!userRoles.includes('admin')) {
      router.push('/login')
    }
  }*/
  }, [user, router])
  return user
}

export default authRequired
