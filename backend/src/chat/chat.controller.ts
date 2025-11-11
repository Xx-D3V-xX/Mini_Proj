import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { ChatRequestDto, chatRequestSchema } from './chat.dto';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  chat(@Body(new ZodValidationPipe(chatRequestSchema)) dto: ChatRequestDto) {
    return this.chatService.respond(dto);
  }
}
