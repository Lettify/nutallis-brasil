import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { splitCaixinhas } from "@/lib/caixinhas";
import { applyOrderStockAdjustments } from "@/lib/stock";

export const POST = async (request: Request) => {
  const payload = (await request.json()) as {
    data?: { id?: string };
    order_id?: string;
    net_value_cents?: number;
  };

  const orderId = payload.order_id;
  const netValue = payload.net_value_cents ?? 0;
  if (!orderId) return NextResponse.json({ ok: true });

  const supabase = createSupabaseAdminClient();
  await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);

  await applyOrderStockAdjustments(orderId);

  const boxes = splitCaixinhas(netValue);
  await supabase.from("finance_boxes").insert(
    boxes.map((box) => ({
      order_id: orderId,
      box_key: box.key,
      amount_cents: box.amount_cents,
    }))
  );

  return NextResponse.json({ ok: true });
};
