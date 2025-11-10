import { z } from 'zod';
import { createPoiSchema } from './create-poi.dto';

export const updatePoiSchema = createPoiSchema.partial();
export type UpdatePoiDto = z.infer<typeof updatePoiSchema>;
