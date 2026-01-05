import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { GroupsClient } from './groups-client'

interface GroupsPageProps {
  params: Promise<{ locale: string }>
}

export default async function GroupsPage({ params }: GroupsPageProps) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  return (
    <GroupsClient
      currentUserId={session.user.id}
      locale={locale}
    />
  )
}
