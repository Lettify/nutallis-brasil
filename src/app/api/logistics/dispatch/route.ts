import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getBestQuote } from "@/lib/shipping/engine";

export const POST = async (request: Request) => {
  const { order_id } = (await request.json()) as { order_id: string };
  const supabase = createSupabaseAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id,address_json,shipping_cents")
    .eq("id", order_id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  const distanceKm = Number(order.address_json?.shipping?.distance_km ?? 0);
  const quote = await getBestQuote(distanceKm);

  await supabase
    .from("orders")
    .update({ status: "dispatched", shipping_cents: quote.fee_cents })
    .eq("id", order_id);

  return NextResponse.json({ ok: true, provider: quote.provider });
};
