import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { NewConversationClient } from './new-conversation-client'

interface NewConversationPageProps {
  params: Promise<{ locale: string }>
}

export default async function NewConversationPage({ params }: NewConversationPageProps) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  return (
    <NewConversationClient
      currentUserId={session.user.id}
      locale={locale}
    />
  )
}
