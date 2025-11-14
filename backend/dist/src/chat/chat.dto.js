"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRequestSchema = void 0;
const zod_1 = require("zod");
exports.chatRequestSchema = zod_1.z.object({
    session_id: zod_1.z.string().uuid().optional(),
    user_id: zod_1.z.string().uuid().optional(),
    message: zod_1.z.string().min(1),
});
//# sourceMappingURL=chat.dto.js.map