"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAIRequest = handleAIRequest;
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const db_1 = require("../tools/db");
const maps_link_1 = require("../tools/maps_link");
const prisma = new client_1.PrismaClient();
async function handleAIRequest(input) {
    var _a;
    const sessionId = (_a = input.sessionId) !== null && _a !== void 0 ? _a : (0, crypto_1.randomUUID)();
    const pois = await (0, db_1.searchPois)(prisma, { q: input.message }, 3);
    const poiIds = pois.map((poi) => poi.id);
    const reply_markdown = buildReply(input.message, pois);
    return {
        session_id: sessionId,
        reply_markdown,
        poi_ids_referenced: poiIds,
    };
}
function buildReply(message, pois) {
    if (!pois.length) {
        return `I could not find anything relevant for "${message}" right now. Try another neighbourhood or time of day.`;
    }
    const suggestions = pois
        .map((poi) => {
        var _a, _b;
        const link = (0, maps_link_1.buildGoogleMapsLink)(poi.latitude, poi.longitude, (_a = poi.slug) !== null && _a !== void 0 ? _a : poi.name);
        return `- **${poi.name}** · rating ${(_b = poi.rating) !== null && _b !== void 0 ? _b : 'N/A'} · [Map](${link})`;
    })
        .join('\n');
    return `Here are a few ideas based on what you asked:\n${suggestions}`;
}
//# sourceMappingURL=orchestrator.js.map