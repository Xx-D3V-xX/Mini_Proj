"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeedbackSchema = void 0;
const zod_1 = require("zod");
exports.createFeedbackSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    poi_id: zod_1.z.string().uuid(),
    signal: zod_1.z.enum(['LIKE', 'DISLIKE', 'SAVE', 'REPORT', 'NOT_RELEVANT']),
    reason: zod_1.z.string().max(280).optional(),
});
//# sourceMappingURL=create-feedback.dto.js.map