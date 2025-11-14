"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItinerarySchema = void 0;
const zod_1 = require("zod");
const itineraryItemSchema = zod_1.z.object({
    poi_id: zod_1.z.string().uuid(),
    start_time: zod_1.z.string().optional(),
    end_time: zod_1.z.string().optional(),
    note: zod_1.z.string().max(240).optional(),
});
exports.createItinerarySchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid().optional(),
    title: zod_1.z.string().min(1).max(160),
    date: zod_1.z.string().optional(),
    mode: zod_1.z.enum(['WALK', 'METRO', 'BUS', 'CAR', 'AUTO', 'MIXED']).optional(),
    items: zod_1.z.array(itineraryItemSchema).min(1),
});
//# sourceMappingURL=create-itinerary.dto.js.map