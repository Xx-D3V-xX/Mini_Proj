"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const orchestrator_1 = require("../../../ai-models/runners/orchestrator");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async respond(dto) {
        const user = dto.user_id ? await this.prisma.user.findUnique({ where: { id: dto.user_id } }) : null;
        if (dto.user_id && !user) {
            throw new common_1.NotFoundException('User not found');
        }
        const session = await this.getOrCreateSession(dto.session_id, dto.user_id);
        await this.prisma.chatMessage.create({
            data: {
                session_id: session.id,
                sender: 'user',
                content: dto.message,
            },
        });
        const aiResponse = await (0, orchestrator_1.handleAIRequest)({ user, sessionId: session.id, message: dto.message });
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
    async getOrCreateSession(sessionId, userId) {
        if (sessionId) {
            const existing = await this.prisma.chatSession.findUnique({ where: { id: sessionId } });
            if (existing)
                return existing;
        }
        return this.prisma.chatSession.create({
            data: {
                id: sessionId !== null && sessionId !== void 0 ? sessionId : (0, crypto_1.randomUUID)(),
                user_id: userId !== null && userId !== void 0 ? userId : null,
                title: null,
            },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map