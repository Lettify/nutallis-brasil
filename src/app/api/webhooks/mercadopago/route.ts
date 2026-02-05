import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { splitCaixinhas } from "@/lib/caixinhas";
import { applyOrderStockAdjustments } from "@/lib/stock";
import { createHmac } from "crypto";

const parseSignature = (header: string | null) => {
  if (!header) return null;
  const parts = header.split(",").map((part) => part.trim());
  const ts = parts.find((part) => part.startsWith("ts="))?.slice(3);
  const v1 = parts.find((part) => part.startsWith("v1="))?.slice(3);
  if (!ts || !v1) return null;
  return { ts, v1 };
};

export const POST = async (request: Request) => {
  const rawBody = await request.text();
  const signature = parseSignature(request.headers.get("x-signature"));
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (secret) {
    if (!signature) {
      return NextResponse.json({ error: "missing_signature" }, { status: 401 });
    }
    const digest = createHmac("sha256", secret)
      .update(`${signature.ts}.${rawBody}`)
      .digest("hex");
    if (digest !== signature.v1) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  }

  const payload = JSON.parse(rawBody) as {
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
