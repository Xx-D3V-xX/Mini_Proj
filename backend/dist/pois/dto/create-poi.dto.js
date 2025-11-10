"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPoiSchema = void 0;
const zod_1 = require("zod");
const hoursSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.tuple([zod_1.z.string(), zod_1.z.string()])));
exports.createPoiSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    description: zod_1.z.string().min(10),
    category: zod_1.z.string(),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
    rating: zod_1.z.number().min(0).max(5).optional(),
    price_level: zod_1.z.number().min(0).max(4).optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    opening_hours: hoursSchema.optional(),
    image_url: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
});
//# sourceMappingURL=create-poi.dto.js.map