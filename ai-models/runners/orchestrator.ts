import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

import { searchPois } from '../tools/db';
import { buildGoogleMapsLink } from '../tools/maps_link';

export type HandleAIRequestInput = {
  user?: { id?: string };
  sessionId?: string;
  message: string;
  params?: Record<string, unknown>;
};

export type HandleAIResponse = {
  session_id: string;
  reply_markdown: string;
  poi_ids_referenced: string[];
};

const prisma = new PrismaClient();

export async function handleAIRequest(input: HandleAIRequestInput): Promise<HandleAIResponse> {
  const sessionId = input.sessionId ?? randomUUID();
  const pois = await searchPois(prisma, { q: input.message }, 3);
  const poiIds = pois.map((poi) => poi.id);
  const reply_markdown = buildReply(input.message, pois);

  return {
    session_id: sessionId,
    reply_markdown,
    poi_ids_referenced: poiIds,
  };
}

function buildReply(message: string, pois: Awaited<ReturnType<typeof searchPois>>) {
  if (!pois.length) {
    return `I could not find anything relevant for "${message}" right now. Try another neighbourhood or time of day.`;
  }
  const suggestions = pois
    .map((poi) => {
      const link = buildGoogleMapsLink(poi.latitude, poi.longitude, poi.slug ?? poi.name);
      return `- **${poi.name}** · rating ${poi.rating ?? 'N/A'} · [Map](${link})`;
    })
    .join('\n');
  return `Here are a few ideas based on what you asked:\n${suggestions}`;
}
