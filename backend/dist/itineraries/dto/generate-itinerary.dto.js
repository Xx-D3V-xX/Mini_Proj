"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateItinerarySchema = exports.timeWindowSchema = exports.locationSchema = void 0;
const zod_1 = require("zod");
exports.locationSchema = zod_1.z.object({
    lat: zod_1.z.number(),
    lng: zod_1.z.number(),
});
exports.timeWindowSchema = zod_1.z.object({
    start: zod_1.z.string(),
    end: zod_1.z.string(),
});
exports.generateItinerarySchema = zod_1.z.object({
    mood: zod_1.z.string().min(3),
    start_location: exports.locationSchema,
    time_window: exports.timeWindowSchema,
    poi_ids: zod_1.z.array(zod_1.z.string()).optional(),
});
//# sourceMappingURL=generate-itinerary.dto.js.map