import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { handleAIRequest } from '../../../ai-models/runners/orchestrator';
import { PrismaService } from '../prisma/prisma.service';
import { ChatRequestDto } from './chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async respond(dto: ChatRequestDto) {
    const user = dto.user_id ? await this.prisma.user.findUnique({ where: { id: dto.user_id } }) : null;
    if (dto.user_id && !user) {
      throw new NotFoundException('User not found');
    }

    const session = await this.getOrCreateSession(dto.session_id, dto.user_id);

    await this.prisma.chatMessage.create({
      data: {
        session_id: session.id,
        sender: 'user',
        content: dto.message,
      },
    });

    const aiResponse = await handleAIRequest({ user, sessionId: session.id, message: dto.message });

    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        session_id: session.id,
        sender: 'assistant',
        content: aiResponse.reply_markdown,
        metadata: { poi_ids: aiResponse.poi_ids_referenced },
      },
    });

    await this.prisma.agentRun.create({
      data: {
        session_id: session.id,
        agent: 'CHAT',
        input: { message: dto.message },
        output: { reply: aiResponse.reply_markdown },
        evidences: {
          create: aiResponse.poi_ids_referenced.map((poi_id) => ({ poi_id })),
        },
      },
    });

    return {
      session_id: session.id,
      reply_markdown: assistantMessage.content,
      poi_ids_referenced: aiResponse.poi_ids_referenced,
    };
  }

  private async getOrCreateSession(sessionId?: string, userId?: string) {
    if (sessionId) {
      const existing = await this.prisma.chatSession.findUnique({ where: { id: sessionId } });
      if (existing) return existing;
    }
    return this.prisma.chatSession.create({
      data: {
        id: sessionId ?? randomUUID(),
        user_id: userId ?? null,
        title: null,
      },
    });
  }
}
