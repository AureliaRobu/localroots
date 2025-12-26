'use server'

import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'
import { GroupCategory } from '@prisma/client'

// Response type for consistent error handling
type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

// Get or create a direct conversation between two users
export async function getOrCreateConversation(
  otherUserId: string
): Promise<ActionResult<{ id: string; isNew: boolean }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const userId = session.user.id

    if (userId === otherUserId) {
      return { success: false, error: 'Cannot create conversation with yourself' }
    }

    // Find existing direct conversation between these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            }
          }
        }
      }
    })

    if (existing) {
      return { success: true, data: { id: existing.id, isNew: false } }
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: 'DIRECT',
        participants: {
          create: [
            { userId },
            { userId: otherUserId }
          ]
        }
      }
    })

    return { success: true, data: { id: conversation.id, isNew: true } }
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error)
    return { success: false, error: 'Failed to get or create conversation' }
  }
}

// Get conversation messages with pagination
export async function getConversationMessages(
  conversationId: string,
  options: {
    limit?: number
    before?: string // ISO date string for cursor-based pagination
  } = {}
): Promise<ActionResult<{
  messages: Array<{
    id: string
    conversationId: string
    senderId: string
    content: string
    type: string
    attachmentUrl: string | null
    createdAt: Date
    sender: { id: string; name: string | null; image: string | null }
  }>
  hasMore: boolean
}>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const { limit = 50, before } = options

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id
        }
      }
    })

    if (!participant) {
      return { success: false, error: 'Not authorized to view this conversation' }
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(before && {
          createdAt: { lt: new Date(before) }
        })
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1 // Fetch one extra to check if there are more
    })

    const hasMore = messages.length > limit
    const resultMessages = hasMore ? messages.slice(0, limit) : messages

    return {
      success: true,
      data: {
        messages: resultMessages.reverse(), // Return in chronological order
        hasMore
      }
    }
  } catch (error) {
    console.error('Error in getConversationMessages:', error)
    return { success: false, error: 'Failed to get messages' }
  }
}

// Get user's conversations
export async function getUserConversations(): Promise<ActionResult<Array<{
  id: string
  type: string
  updatedAt: Date
  participants: Array<{
    userId: string
    user: { id: string; name: string | null; image: string | null; role: string }
  }>
  group: { id: string; name: string; imageUrl: string | null; category: string } | null
  lastMessage: {
    id: string
    content: string
    type: string
    senderId: string
    createdAt: Date
    sender: { id: string; name: string | null }
  } | null
  unreadCount: number
}>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const userId = session.user.id

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            }
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            category: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Get unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find(p => p.userId === userId)
        const unreadCount = participant
          ? await prisma.message.count({
              where: {
                conversationId: conv.id,
                createdAt: { gt: participant.lastReadAt },
                senderId: { not: userId }
              }
            })
          : 0

        return {
          id: conv.id,
          type: conv.type,
          updatedAt: conv.updatedAt,
          participants: conv.participants.map(p => ({
            userId: p.userId,
            user: p.user
          })),
          group: conv.group,
          lastMessage: conv.messages[0] || null,
          unreadCount
        }
      })
    )

    return { success: true, data: conversationsWithUnread }
  } catch (error) {
    console.error('Error in getUserConversations:', error)
    return { success: false, error: 'Failed to get conversations' }
  }
}

// Get conversation details
export async function getConversation(
  conversationId: string
): Promise<ActionResult<{
  id: string
  type: string
  participants: Array<{
    userId: string
    user: { id: string; name: string | null; image: string | null; role: string }
  }>
  group: { id: string; name: string; description: string | null; imageUrl: string | null; category: string; createdById: string } | null
}>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            }
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            category: true,
            createdById: true
          }
        }
      }
    })

    if (!conversation) {
      return { success: false, error: 'Conversation not found' }
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      p => p.userId === session.user.id
    )

    if (!isParticipant) {
      return { success: false, error: 'Not authorized' }
    }

    return {
      success: true,
      data: {
        id: conversation.id,
        type: conversation.type,
        participants: conversation.participants.map(p => ({
          userId: p.userId,
          user: p.user
        })),
        group: conversation.group
      }
    }
  } catch (error) {
    console.error('Error in getConversation:', error)
    return { success: false, error: 'Failed to get conversation' }
  }
}

// Search for groups
export async function searchGroups(
  options: {
    query?: string
    category?: GroupCategory
    limit?: number
  } = {}
): Promise<ActionResult<Array<{
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string
  conversationId: string
  memberCount: number
  createdBy: { id: string; name: string | null; image: string | null }
  isMember: boolean
}>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const { query, category, limit = 20 } = options

    const groups = await prisma.group.findMany({
      where: {
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        }),
        ...(category && { category })
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        conversation: {
          include: {
            participants: {
              select: { userId: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    const result = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      imageUrl: group.imageUrl,
      category: group.category,
      conversationId: group.conversationId,
      memberCount: group.conversation.participants.length,
      createdBy: group.createdBy,
      isMember: group.conversation.participants.some(
        p => p.userId === session.user.id
      )
    }))

    return { success: true, data: result }
  } catch (error) {
    console.error('Error in searchGroups:', error)
    return { success: false, error: 'Failed to search groups' }
  }
}

// Join a group
export async function joinGroup(
  groupId: string
): Promise<ActionResult<{ conversationId: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        conversation: {
          include: {
            participants: true
          }
        }
      }
    })

    if (!group) {
      return { success: false, error: 'Group not found' }
    }

    // Check if already a member
    const isAlreadyMember = group.conversation.participants.some(
      p => p.userId === session.user.id
    )

    if (isAlreadyMember) {
      return { success: true, data: { conversationId: group.conversationId } }
    }

    // Add user to group
    await prisma.conversationParticipant.create({
      data: {
        conversationId: group.conversationId,
        userId: session.user.id
      }
    })

    // Create system message
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true }
    })

    await prisma.message.create({
      data: {
        conversationId: group.conversationId,
        senderId: session.user.id,
        content: `${user?.name || 'Someone'} joined the group`,
        type: 'SYSTEM'
      }
    })

    return { success: true, data: { conversationId: group.conversationId } }
  } catch (error) {
    console.error('Error in joinGroup:', error)
    return { success: false, error: 'Failed to join group' }
  }
}

// Leave a group
export async function leaveGroup(
  groupId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId }
    })

    if (!group) {
      return { success: false, error: 'Group not found' }
    }

    // Cannot leave if you're the creator
    if (group.createdById === session.user.id) {
      return { success: false, error: 'Group creator cannot leave. Delete the group instead.' }
    }

    // Get user name for system message
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true }
    })

    // Remove from group
    await prisma.conversationParticipant.delete({
      where: {
        conversationId_userId: {
          conversationId: group.conversationId,
          userId: session.user.id
        }
      }
    })

    // Create system message
    await prisma.message.create({
      data: {
        conversationId: group.conversationId,
        senderId: session.user.id,
        content: `${user?.name || 'Someone'} left the group`,
        type: 'SYSTEM'
      }
    })

    return { success: true, data: { success: true } }
  } catch (error) {
    console.error('Error in leaveGroup:', error)
    return { success: false, error: 'Failed to leave group' }
  }
}

// Create a group
export async function createGroup(
  data: {
    name: string
    description?: string
    category: GroupCategory
    memberIds?: string[]
    imageUrl?: string
  }
): Promise<ActionResult<{ groupId: string; conversationId: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const { name, description, category, memberIds = [], imageUrl } = data

    if (!name.trim()) {
      return { success: false, error: 'Group name is required' }
    }

    // Create conversation and group in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create conversation
      const conversation = await tx.conversation.create({
        data: {
          type: 'GROUP',
          participants: {
            create: [
              { userId: session.user.id },
              ...memberIds
                .filter(id => id !== session.user.id)
                .map(userId => ({ userId }))
            ]
          }
        }
      })

      // Create group
      const group = await tx.group.create({
        data: {
          conversationId: conversation.id,
          name: name.trim(),
          description: description?.trim(),
          category,
          imageUrl,
          createdById: session.user.id
        }
      })

      // Create system message
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          content: `Group "${name}" was created`,
          type: 'SYSTEM'
        }
      })

      return { groupId: group.id, conversationId: conversation.id }
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Error in createGroup:', error)
    return { success: false, error: 'Failed to create group' }
  }
}

// Mark conversation as read
export async function markConversationAsRead(
  conversationId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id
        }
      },
      data: {
        lastReadAt: new Date()
      }
    })

    return { success: true, data: { success: true } }
  } catch (error) {
    console.error('Error in markConversationAsRead:', error)
    return { success: false, error: 'Failed to mark as read' }
  }
}

// Get users to start a conversation with (farmers for customers, customers for farmers)
export async function getAvailableChatUsers(
  options: { search?: string; limit?: number } = {}
): Promise<ActionResult<Array<{
  id: string
  name: string | null
  image: string | null
  role: string
  farmName?: string
}>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const { search, limit = 20 } = options

    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { farmerProfile: { farmName: { contains: search, mode: 'insensitive' } } }
          ]
        })
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        farmerProfile: {
          select: { farmName: true }
        }
      },
      take: limit,
      orderBy: { name: 'asc' }
    })

    return {
      success: true,
      data: users.map(u => ({
        id: u.id,
        name: u.name,
        image: u.image,
        role: u.role,
        farmName: u.farmerProfile?.farmName
      }))
    }
  } catch (error) {
    console.error('Error in getAvailableChatUsers:', error)
    return { success: false, error: 'Failed to get users' }
  }
}
