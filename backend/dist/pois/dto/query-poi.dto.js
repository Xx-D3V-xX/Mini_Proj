"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poiQuerySchema = void 0;
const zod_1 = require("zod");
exports.poiQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.string().optional(),
    rating_min: zod_1.z.coerce.number().min(0).max(5).optional(),
    price_level: zod_1.z.coerce.number().min(0).max(4).optional(),
    bbox: zod_1.z.string().optional(),
    sort: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().min(1).optional(),
});
//# sourceMappingURL=query-poi.dto.js.map