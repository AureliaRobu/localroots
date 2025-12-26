import { Server, Socket } from 'socket.io';
import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

type GroupCategory = 'GENERAL' | 'FOOD_SHARE' | 'NEWS' | 'RECIPES' | 'TIPS' | 'LOCAL_EVENTS';

interface CreateGroupData {
  name: string;
  description?: string;
  category: GroupCategory;
  memberIds: string[];
  imageUrl?: string;
}

interface AddMemberData {
  groupId: string;
  userId: string;
}

interface RemoveMemberData {
  groupId: string;
  userId: string;
}

export function registerGroupHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Create group
  socket.on('group:create', async (data: CreateGroupData) => {
    try {
      // Validate input
      if (!data.name || data.name.trim().length === 0) {
        socket.emit('error', { message: 'Group name is required' });
        return;
      }

      // Create conversation and group in transaction
      const group = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Create conversation first
        const conversation = await tx.conversation.create({
          data: {
            type: 'GROUP',
            participants: {
              create: [
                { userId }, // Creator
                ...data.memberIds
                  .filter(id => id !== userId) // Avoid duplicate if creator is in memberIds
                  .map(id => ({ userId: id }))
              ]
            }
          }
        });

        // Create group linked to conversation
        return await tx.group.create({
          data: {
            conversationId: conversation.id,
            name: data.name.trim(),
            description: data.description?.trim(),
            category: data.category,
            imageUrl: data.imageUrl,
            createdById: userId
          },
          include: {
            conversation: {
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
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        });
      });

      // Auto-join creator to the conversation room
      socket.join(`conversation:${group.conversationId}`);

      // Notify all members (including creator)
      const allMemberIds = [userId, ...data.memberIds.filter(id => id !== userId)];
      const allSockets = await io.fetchSockets();

      for (const memberSocket of allSockets) {
        if (allMemberIds.includes(memberSocket.data.userId)) {
          memberSocket.join(`conversation:${group.conversationId}`);
          memberSocket.emit('group:created', group);
        }
      }

      // Create system message for group creation
      await prisma.message.create({
        data: {
          conversationId: group.conversationId,
          senderId: userId,
          content: `Group "${group.name}" was created`,
          type: 'SYSTEM'
        }
      });

      console.log(`Group "${group.name}" created by user ${userId}`);
    } catch (error) {
      console.error('Error creating group:', error);
      socket.emit('error', { message: 'Failed to create group' });
    }
  });

  // Add member to group
  socket.on('group:add_member', async (data: AddMemberData) => {
    try {
      // Verify requester is group creator
      const group = await prisma.group.findUnique({
        where: { id: data.groupId },
        include: {
          conversation: {
            include: {
              participants: true
            }
          }
        }
      });

      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      if (group.createdById !== userId) {
        socket.emit('error', { message: 'Only the group creator can add members' });
        return;
      }

      // Check if user is already a member
      const isAlreadyMember = group.conversation.participants.some(
        (p: { userId: string }) => p.userId === data.userId
      );

      if (isAlreadyMember) {
        socket.emit('error', { message: 'User is already a member' });
        return;
      }

      // Add participant
      await prisma.conversationParticipant.create({
        data: {
          conversationId: group.conversationId,
          userId: data.userId
        }
      });

      // Get new member info
      const newMember = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true, name: true, image: true }
      });

      // Notify conversation room
      io.to(`conversation:${group.conversationId}`).emit('group:member_added', {
        groupId: data.groupId,
        conversationId: group.conversationId,
        user: newMember
      });

      // Add new member's socket to the room
      const allSockets = await io.fetchSockets();
      for (const s of allSockets) {
        if (s.data.userId === data.userId) {
          s.join(`conversation:${group.conversationId}`);
          s.emit('group:joined', group);
        }
      }

      // Create system message
      await prisma.message.create({
        data: {
          conversationId: group.conversationId,
          senderId: userId,
          content: `${newMember?.name || 'A user'} was added to the group`,
          type: 'SYSTEM'
        }
      });

      console.log(`User ${data.userId} added to group ${data.groupId}`);
    } catch (error) {
      console.error('Error adding member:', error);
      socket.emit('error', { message: 'Failed to add member' });
    }
  });

  // Remove member from group
  socket.on('group:remove_member', async (data: RemoveMemberData) => {
    try {
      const group = await prisma.group.findUnique({
        where: { id: data.groupId }
      });

      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      // Only creator can remove members (or member can leave themselves)
      if (group.createdById !== userId && data.userId !== userId) {
        socket.emit('error', { message: 'Not authorized to remove members' });
        return;
      }

      // Cannot remove the creator
      if (data.userId === group.createdById) {
        socket.emit('error', { message: 'Cannot remove the group creator' });
        return;
      }

      // Get member info before removal
      const member = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true, name: true }
      });

      // Remove participant
      await prisma.conversationParticipant.delete({
        where: {
          conversationId_userId: {
            conversationId: group.conversationId,
            userId: data.userId
          }
        }
      });

      // Notify conversation room
      io.to(`conversation:${group.conversationId}`).emit('group:member_removed', {
        groupId: data.groupId,
        conversationId: group.conversationId,
        userId: data.userId
      });

      // Remove member's socket from the room
      const allSockets = await io.fetchSockets();
      for (const s of allSockets) {
        if (s.data.userId === data.userId) {
          s.leave(`conversation:${group.conversationId}`);
          s.emit('group:left', { groupId: data.groupId });
        }
      }

      // Create system message
      const messageContent = data.userId === userId
        ? `${member?.name || 'A user'} left the group`
        : `${member?.name || 'A user'} was removed from the group`;

      await prisma.message.create({
        data: {
          conversationId: group.conversationId,
          senderId: userId,
          content: messageContent,
          type: 'SYSTEM'
        }
      });

      console.log(`User ${data.userId} removed from group ${data.groupId}`);
    } catch (error) {
      console.error('Error removing member:', error);
      socket.emit('error', { message: 'Failed to remove member' });
    }
  });

  // Leave group (convenience method)
  socket.on('group:leave', async (groupId: string) => {
    socket.emit('group:remove_member', { groupId, userId });
  });

  // Update group info
  socket.on('group:update', async (data: {
    groupId: string;
    name?: string;
    description?: string;
    imageUrl?: string;
  }) => {
    try {
      const group = await prisma.group.findUnique({
        where: { id: data.groupId }
      });

      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      if (group.createdById !== userId) {
        socket.emit('error', { message: 'Only the group creator can update group info' });
        return;
      }

      const updatedGroup = await prisma.group.update({
        where: { id: data.groupId },
        data: {
          ...(data.name && { name: data.name.trim() }),
          ...(data.description !== undefined && { description: data.description?.trim() }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl })
        },
        include: {
          createdBy: {
            select: { id: true, name: true, image: true }
          }
        }
      });

      io.to(`conversation:${group.conversationId}`).emit('group:updated', updatedGroup);

      console.log(`Group ${data.groupId} updated by user ${userId}`);
    } catch (error) {
      console.error('Error updating group:', error);
      socket.emit('error', { message: 'Failed to update group' });
    }
  });
}
