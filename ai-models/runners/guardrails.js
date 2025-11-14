"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureEvidence = ensureEvidence;
exports.ensurePoiReferences = ensurePoiReferences;
function ensureEvidence(items) {
    return items.filter((item) => Array.isArray(item.evidence) && item.evidence.length > 0);
}
function ensurePoiReferences(mentioned, allowed) {
    return mentioned.filter((id) => allowed.has(id));
}
//# sourceMappingURL=guardrails.js.map