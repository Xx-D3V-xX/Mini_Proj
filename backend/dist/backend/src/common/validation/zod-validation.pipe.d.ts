import { PipeTransform } from '@nestjs/common';
import { ZodTypeAny } from 'zod';
export declare class ZodValidationPipe implements PipeTransform {
    private readonly schema?;
    constructor(schema?: ZodTypeAny);
    transform(value: unknown): unknown;
}
