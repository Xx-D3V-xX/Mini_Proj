"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGoogleMapsLink = buildGoogleMapsLink;
function buildGoogleMapsLink(lat, lon, label) {
    const encoded = encodeURIComponent(label);
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encoded}`;
}
//# sourceMappingURL=maps_link.js.map