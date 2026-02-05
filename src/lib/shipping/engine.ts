import type { ShippingQuote } from "@/lib/types";

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getManualQuote = (distanceKm: number): ShippingQuote => {
  const base = parseNumber(process.env.SHIPPING_BASE_FEE, 1090);
  const perKm = parseNumber(process.env.SHIPPING_PER_KM, 290);
  const fee = Math.round(base + perKm * distanceKm);
  return {
    provider: "manual",
    fee_cents: fee,
    eta_minutes: null,
    distance_km: distanceKm,
  };
};

const getUberDirectClient = async () => {
  const clientId = process.env.UBER_DIRECT_CLIENT_ID;
  const clientSecret = process.env.UBER_DIRECT_CLIENT_SECRET;
  const customerId = process.env.UBER_DIRECT_CUSTOMER_ID;

  if (!clientId || !clientSecret || !customerId) return null;

  const sdk = (await import("uber-direct")) as unknown as {
    UberDirect?: new (args: {
      clientId: string;
      clientSecret: string;
      customerId: string;
    }) => unknown;
    default?: new (args: {
      clientId: string;
      clientSecret: string;
      customerId: string;
    }) => unknown;
    Client?: new (args: {
      clientId: string;
      clientSecret: string;
      customerId: string;
    }) => unknown;
  };

  const Client = sdk.UberDirect ?? sdk.default ?? sdk.Client;
  if (!Client) return null;

  return new Client({ clientId, clientSecret, customerId }) as {
    createQuote?: (payload: { distance_km: number }) => Promise<unknown>;
    quote?: (payload: { distance_km: number }) => Promise<unknown>;
    getQuote?: (payload: { distance_km: number }) => Promise<unknown>;
  };
};

const parseUberQuote = (data: unknown, distanceKm: number): ShippingQuote | null => {
  if (!data || typeof data !== "object") return null;
  const payload = data as {
    fee_cents?: number;
    fee?: number;
    total_fee?: number;
    eta_minutes?: number | null;
    eta?: number | null;
  };
  const feeCents =
    typeof payload.fee_cents === "number"
      ? payload.fee_cents
      : typeof payload.fee === "number"
      ? Math.round(payload.fee * 100)
      : typeof payload.total_fee === "number"
      ? Math.round(payload.total_fee * 100)
      : null;

  if (feeCents === null) return null;

  return {
    provider: "uber",
    fee_cents: feeCents,
    eta_minutes: payload.eta_minutes ?? payload.eta ?? null,
    distance_km: distanceKm,
  };
};

const fetchUberQuote = async (
  distanceKm: number
): Promise<ShippingQuote | null> => {
  const client = await getUberDirectClient();
  if (client) {
    const result =
      (client.createQuote &&
        (await client.createQuote({ distance_km: distanceKm }))) ||
      (client.quote && (await client.quote({ distance_km: distanceKm }))) ||
      (client.getQuote && (await client.getQuote({ distance_km: distanceKm })));

    const quote = parseUberQuote(result, distanceKm);
    if (quote) return quote;
  }

  const url = process.env.UBER_DIRECT_API_URL;
  const token = process.env.UBER_DIRECT_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ distance_km: distanceKm }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    fee_cents: number;
    eta_minutes: number | null;
  };

  return {
    provider: "uber",
    fee_cents: data.fee_cents,
    eta_minutes: data.eta_minutes ?? null,
    distance_km: distanceKm,
  };
};

const fetchIfoodQuote = async (
  distanceKm: number
): Promise<ShippingQuote | null> => {
  const url = process.env.IFOOD_API_URL;
  const token = process.env.IFOOD_API_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ distance_km: distanceKm }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    fee_cents: number;
    eta_minutes: number | null;
  };

  return {
    provider: "ifood",
    fee_cents: data.fee_cents,
    eta_minutes: data.eta_minutes ?? null,
    distance_km: distanceKm,
  };
};

export const getBestQuote = async (distanceKm: number) => {
  const uber = await fetchUberQuote(distanceKm);
  if (uber) return uber;

  const ifood = await fetchIfoodQuote(distanceKm);
  if (ifood) return ifood;

  return getManualQuote(distanceKm);
};
