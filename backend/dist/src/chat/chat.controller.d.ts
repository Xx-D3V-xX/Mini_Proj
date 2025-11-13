import { ChatRequestDto } from './chat.dto';
import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    chat(dto: ChatRequestDto): Promise<{
        session_id: string;
        reply_markdown: string;
        poi_ids_referenced: string[];
    }>;
}
