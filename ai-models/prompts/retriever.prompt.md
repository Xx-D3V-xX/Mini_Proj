Return ONLY valid JSON matching poi_result.schema.json. Input includes DB rows (id, name, lat, lon, rating, price).
Select top-k by filters (category, tag, bbox, rating, price). If <3 results, set status:"insufficient_evidence". Never invent.
Each item MUST include evidence:[poi_id].
