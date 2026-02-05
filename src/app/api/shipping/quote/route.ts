import { NextResponse } from "next/server";
import { getBestQuote, getManualQuote } from "@/lib/shipping/engine";

const parseCoord = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const POST = async (request: Request) => {
  const { address, location } = (await request.json()) as {
    address: string;
    location: { lat: number; lng: number };
  };

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(getManualQuote(0));
  }

  const originLat = parseCoord(process.env.STORE_LAT, -23.561684);
  const originLng = parseCoord(process.env.STORE_LNG, -46.625378);

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", `${originLat},${originLng}`);
  url.searchParams.set("destinations", `${location.lat},${location.lng}`);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json(getManualQuote(0));
  }

  const data = (await response.json()) as {
    rows: { elements: { distance?: { value: number } }[] }[];
  };

  const meters = data.rows?.[0]?.elements?.[0]?.distance?.value ?? 0;
  const distanceKm = meters / 1000;

  const quote = await getBestQuote(distanceKm);
  return NextResponse.json({ ...quote, address });
};
