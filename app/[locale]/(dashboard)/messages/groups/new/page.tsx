import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { NewGroupClient } from './new-group-client'

interface NewGroupPageProps {
  params: Promise<{ locale: string }>
}

export default async function NewGroupPage({ params }: NewGroupPageProps) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  return (
    <NewGroupClient
      currentUserId={session.user.id}
      locale={locale}
    />
  )
}
