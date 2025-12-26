import { Server, Socket } from 'socket.io';
import { prisma } from '../utils/prisma';

interface SendMessageData {
  conversationId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
  attachmentUrl?: string;
}

interface ReadMessageData {
  conversationId: string;
  messageId: string;
}

export function registerChatHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Join conversation room
  socket.on('join:conversation', async (conversationId: string) => {
    try {
      // Verify user is participant
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId
          }
        }
      });

      if (!participant) {
        socket.emit('error', { message: 'Not authorized to join this conversation' });
        return;
      }

      socket.join(`conversation:${conversationId}`);
      socket.emit('joined:conversation', { conversationId });

      console.log(`User ${userId} joined conversation ${conversationId}`);
    } catch (error) {
      console.error('Error joining conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  // Leave conversation room
  socket.on('leave:conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    socket.emit('left:conversation', { conversationId });
    console.log(`User ${userId} left conversation ${conversationId}`);
  });

  // Send message
  socket.on('message:send', async (data: SendMessageData) => {
    try {
      // Verify user is participant
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: data.conversationId,
            userId
          }
        }
      });

      if (!participant) {
        socket.emit('error', { message: 'Not authorized to send messages' });
        return;
      }

      // Create message in database
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content,
          type: data.type || 'TEXT',
          attachmentUrl: data.attachmentUrl
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });

      // Broadcast to conversation room
      io.to(`conversation:${data.conversationId}`).emit('message:new', message);

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() }
      });

      console.log(`Message sent in conversation ${data.conversationId} by user ${userId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Mark message as read
  socket.on('message:read', async (data: ReadMessageData) => {
    try {
      // Create or update read receipt
      await prisma.messageReadReceipt.upsert({
        where: {
          messageId_userId: {
            messageId: data.messageId,
            userId
          }
        },
        create: {
          messageId: data.messageId,
          userId
        },
        update: {
          readAt: new Date()
        }
      });

      // Update last read timestamp for participant
      await prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: data.conversationId,
            userId
          }
        },
        data: {
          lastReadAt: new Date()
        }
      });

      // Notify other participants about read receipt
      socket.to(`conversation:${data.conversationId}`).emit('message:read', {
        messageId: data.messageId,
        userId,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      socket.emit('error', { message: 'Failed to mark message as read' });
    }
  });

  // Get unread count for a conversation
  socket.on('messages:unread_count', async (conversationId: string) => {
    try {
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId
          }
        }
      });

      if (!participant) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }

      const unreadCount = await prisma.message.count({
        where: {
          conversationId,
          createdAt: { gt: participant.lastReadAt },
          senderId: { not: userId }
        }
      });

      socket.emit('messages:unread_count', { conversationId, count: unreadCount });
    } catch (error) {
      console.error('Error getting unread count:', error);
      socket.emit('error', { message: 'Failed to get unread count' });
    }
  });
}
