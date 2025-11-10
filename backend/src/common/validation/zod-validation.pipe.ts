import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodTypeAny } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema?: ZodTypeAny) {}

  transform(value: unknown) {
    if (!this.schema) {
      return value;
    }
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          issues: err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
        });
      }
      throw err;
    }
  }
}
