import { PrismaService } from '../prisma/prisma.service';
import { ChatRequestDto } from './chat.dto';
export declare class ChatService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    respond(dto: ChatRequestDto): Promise<{
        session_id: string;
        reply_markdown: string;
        poi_ids_referenced: string[];
    }>;
    private getOrCreateSession;
}
