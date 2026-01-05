import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { MessagesLayoutClient } from './messages-layout-client'

export default async function MessagesLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const session = await auth()
  const { locale } = await params

  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  return (
    <MessagesLayoutClient userId={session.user.id}>
      {children}
    </MessagesLayoutClient>
  )
}
