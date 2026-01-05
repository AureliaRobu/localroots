import { auth } from '@/lib/auth/auth'
import { redirect, notFound } from 'next/navigation'
import { getConversation, getConversationMessages, markConversationAsRead } from '@/lib/actions/chat'
import { ChatPageClient } from './chat-page-client'

interface ChatPageProps {
  params: Promise<{
    locale: string
    conversationId: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { locale, conversationId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  const [conversationResult, messagesResult] = await Promise.all([
    getConversation(conversationId),
    getConversationMessages(conversationId, { limit: 50 }),
    markConversationAsRead(conversationId)
  ])

  if (!conversationResult.success || !conversationResult.data) {
    notFound()
  }

  const conversation = conversationResult.data
  const messages = messagesResult.success ? messagesResult.data.messages : []

  // Build participant names map
  const participantNames = new Map<string, string>()
  conversation.participants.forEach(p => {
    participantNames.set(p.userId, p.user.name || 'Unknown')
  })

  // Get display info for header
  const otherParticipant = conversation.type === 'DIRECT'
    ? conversation.participants.find(p => p.userId !== session.user.id)?.user
    : null

  const headerInfo = {
    name: conversation.type === 'GROUP'
      ? conversation.group?.name || 'Group'
      : otherParticipant?.name || 'Unknown',
    image: conversation.type === 'GROUP'
      ? conversation.group?.imageUrl
      : otherParticipant?.image,
    role: conversation.type === 'DIRECT'
      ? otherParticipant?.role
      : undefined,
    isGroup: conversation.type === 'GROUP',
    participantCount: conversation.participants.length
  }

  return (
    <ChatPageClient
      conversationId={conversationId}
      currentUserId={session.user.id}
      initialMessages={messages}
      participantNames={Object.fromEntries(participantNames)}
      headerInfo={headerInfo}
      locale={locale}
    />
  )
}
