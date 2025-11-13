"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreferencesSchema = void 0;
const zod_1 = require("zod");
exports.updatePreferencesSchema = zod_1.z.object({
    preferences: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
//# sourceMappingURL=update-preferences.dto.js.map