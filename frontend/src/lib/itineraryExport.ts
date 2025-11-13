import jsPDF from "jspdf";

import type { Itinerary } from "@/lib/types";

export function exportItineraryToPdf(itinerary: Itinerary) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 40;

  const lineHeight = 18;
  const maxWidth = 515; // A4 width (595pt) - margins

  const addLine = (text: string, opts?: { bold?: boolean }) => {
    if (y > 780) {
      doc.addPage();
      y = 40;
    }
    if (opts?.bold) {
      doc.setFont(undefined, "bold");
    } else {
      doc.setFont(undefined, "normal");
    }
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line) => {
      doc.text(line, marginX, y);
      y += lineHeight;
    });
  };

  doc.setFontSize(18);
  addLine(itinerary.title || "Your MumbAI Trails Itinerary", { bold: true });

  doc.setFontSize(11);
  const date = itinerary.date || itinerary.created_at;
  if (date) {
    addLine(`Date: ${new Date(date).toLocaleDateString()}`);
  }
  if (typeof itinerary.total_distance_km === "number" || typeof itinerary.total_time_min === "number") {
    const parts: string[] = [];
    if (typeof itinerary.total_distance_km === "number") {
      parts.push(`${itinerary.total_distance_km.toFixed(1)} km total`);
    }
    if (typeof itinerary.total_time_min === "number") {
      parts.push(`${itinerary.total_time_min} min travel`);
    }
    if (parts.length) {
      addLine(`Summary: ${parts.join(" · ")}`);
    }
  }

  y += 10;
  addLine("Stops:", { bold: true });

  itinerary.items.forEach((item, index) => {
    y += 6;
    addLine(`${index + 1}. ${item.name ?? item.poi_id}`, { bold: true });

    const timeParts: string[] = [];
    if (item.start_time) {
      const start = new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (item.end_time) {
        const end = new Date(item.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        timeParts.push(`${start} – ${end}`);
      } else {
        timeParts.push(start);
      }
    }
    if (typeof item.leg_distance_km === "number") {
      timeParts.push(`${item.leg_distance_km.toFixed(1)} km hop`);
    } else if (typeof item.distance_km === "number") {
      timeParts.push(`${item.distance_km.toFixed(1)} km hop`);
    }
    if (typeof item.leg_time_min === "number") {
      timeParts.push(`${item.leg_time_min} min travel`);
    }
    if (timeParts.length) {
      addLine(`   ${timeParts.join(" · ")}`);
    }

    if (item.note) {
      addLine(`   Notes: ${item.note}`);
    }
  });

  const filenameSafeTitle = (itinerary.title || "itinerary").replace(/[^a-z0-9]+/gi, "-").replace(/-+/g, "-");
  doc.save(`${filenameSafeTitle}.pdf`);
}
