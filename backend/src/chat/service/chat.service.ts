import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ConversationEntity } from '../entities/conversation.entity';
import { MessageEntity } from '../entities/message.entity';
import { UserEntity } from '../../auth/entities/user.entity';

function pairIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationsRepo: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messagesRepo: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async listUsers(excludeUserId: string) {
    const users = await this.usersRepo.find({
      order: { name: 'ASC' },
    });
    return {
      success: true,
      data: users
        .filter((u) => u.id !== excludeUserId)
        .map((u) => ({ id: u.id, name: u.name, email: u.email })),
    };
  }

  async listConversations(userId: string) {
    const rows = await this.conversationsRepo.find({
      where: [{ userLowId: userId }, { userHighId: userId }],
      order: { lastMessageAt: 'DESC', updatedAt: 'DESC' },
    });

    const peerIds = rows.map((c) =>
      c.userLowId === userId ? c.userHighId : c.userLowId,
    );
    const peers =
      peerIds.length > 0
        ? await this.usersRepo.find({ where: { id: In(peerIds) } })
        : [];
    const peerMap = new Map(peers.map((p) => [p.id, p]));

    return {
      success: true,
      data: rows.map((c) => {
        const peerId = c.userLowId === userId ? c.userHighId : c.userLowId;
        const peer = peerMap.get(peerId);
        return {
          id: c.id,
          peer: peer
            ? { id: peer.id, name: peer.name, email: peer.email }
            : { id: peerId, name: 'Unknown', email: '' },
          lastMessageAt: c.lastMessageAt,
          lastMessagePreview: c.lastMessagePreview,
          createdAt: c.createdAt,
        };
      }),
    };
  }

  async getOrCreateConversation(userId: string, peerUserId: string) {
    if (userId === peerUserId) {
      throw new ForbiddenException('Cannot chat with yourself');
    }

    const peer = await this.usersRepo.findOne({ where: { id: peerUserId } });
    if (!peer) throw new NotFoundException('User not found');

    const [userLowId, userHighId] = pairIds(userId, peerUserId);
    let conversation = await this.conversationsRepo.findOne({
      where: { userLowId, userHighId },
    });

    if (!conversation) {
      conversation = this.conversationsRepo.create({
        id: uuidv4(),
        userLowId,
        userHighId,
        lastMessageAt: null,
        lastMessagePreview: '',
      });
      await this.conversationsRepo.save(conversation);
    }

    return {
      success: true,
      data: {
        id: conversation.id,
        peer: { id: peer.id, name: peer.name, email: peer.email },
        lastMessageAt: conversation.lastMessageAt,
        lastMessagePreview: conversation.lastMessagePreview,
        createdAt: conversation.createdAt,
      },
    };
  }

  private async assertMember(conversationId: string, userId: string) {
    const conversation = await this.conversationsRepo.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (
      conversation.userLowId !== userId &&
      conversation.userHighId !== userId
    ) {
      throw new ForbiddenException('Not a member of this conversation');
    }
    return conversation;
  }

  async listMessages(conversationId: string, userId: string) {
    await this.assertMember(conversationId, userId);
    const messages = await this.messagesRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
    return {
      success: true,
      data: messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        body: m.body,
        createdAt: m.createdAt,
      })),
    };
  }

  async sendMessage(conversationId: string, userId: string, body: string) {
    const conversation = await this.assertMember(conversationId, userId);
    const text = body.trim();
    if (!text) throw new BadRequestException('Message cannot be empty');

    const message = this.messagesRepo.create({
      id: uuidv4(),
      conversationId,
      senderId: userId,
      body: text,
    });
    await this.messagesRepo.save(message);

    conversation.lastMessageAt = message.createdAt;
    conversation.lastMessagePreview = text.slice(0, 240);
    await this.conversationsRepo.save(conversation);

    return {
      success: true,
      data: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        body: message.body,
        createdAt: message.createdAt,
      },
    };
  }
}
