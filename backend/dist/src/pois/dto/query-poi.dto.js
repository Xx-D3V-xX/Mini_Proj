"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPoiSchema = void 0;
const zod_1 = require("zod");
const bboxRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
exports.searchPoiSchema = zod_1.z.object({
    q: zod_1.z.string().max(160).optional(),
    category: zod_1.z.string().max(64).optional(),
    tag: zod_1.z.string().max(64).optional(),
    min_rating: zod_1.z.coerce.number().min(0).max(5).optional(),
    max_price: zod_1.z.coerce.number().min(0).max(4).optional(),
    bbox: zod_1.z
        .string()
        .regex(bboxRegex, 'bbox format must be minLat,minLon,maxLat,maxLon')
        .optional(),
    open_at: zod_1.z.string().optional(),
    weekday: zod_1.z
        .enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])
        .optional(),
    limit: zod_1.z.coerce.number().min(1).max(50).optional(),
});
//# sourceMappingURL=query-poi.dto.js.map