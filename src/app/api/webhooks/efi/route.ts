import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { splitCaixinhas } from "@/lib/caixinhas";
import { applyOrderStockAdjustments } from "@/lib/stock";

export const POST = async (request: Request) => {
  const payload = (await request.json()) as {
    order_id?: string;
    net_value_cents?: number;
  };

  if (!payload.order_id) return NextResponse.json({ ok: true });

  const supabase = createSupabaseAdminClient();
  await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", payload.order_id);

  await applyOrderStockAdjustments(payload.order_id);

  const boxes = splitCaixinhas(payload.net_value_cents ?? 0);
  await supabase.from("finance_boxes").insert(
    boxes.map((box) => ({
      order_id: payload.order_id,
      box_key: box.key,
      amount_cents: box.amount_cents,
    }))
  );

  return NextResponse.json({ ok: true });
};
