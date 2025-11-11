import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { CreateFeedbackDto, createFeedbackSchema } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(204)
  async create(@Body(new ZodValidationPipe(createFeedbackSchema)) dto: CreateFeedbackDto) {
    await this.feedbackService.create(dto);
  }
}
