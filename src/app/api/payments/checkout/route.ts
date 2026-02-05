import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculatePriceCents } from "@/lib/discounts";
import type { CartItem, ShippingQuote } from "@/lib/types";

export const POST = async (request: Request) => {
  const body = (await request.json()) as {
    items: CartItem[];
    address: string;
    shipping: ShippingQuote | null;
    payment_method: "pix" | "card";
  };

  const subtotal = body.items.reduce(
    (acc, item) =>
      acc + calculatePriceCents(item.price_per_kg_cents, item.weight_grams),
    0
  );
  const shippingFee = body.shipping?.fee_cents ?? 0;
  const total = subtotal + shippingFee;

  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      status: "pending",
      subtotal_cents: subtotal,
      shipping_cents: shippingFee,
      total_cents: total,
      address_json: { address: body.address, shipping: body.shipping },
    })
    .select("id")
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "order_failed" }, { status: 500 });
  }

  const orderItems = body.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    weight_grams: item.weight_grams,
    unit_price_cents: calculatePriceCents(item.price_per_kg_cents, item.weight_grams),
    line_total_cents: calculatePriceCents(item.price_per_kg_cents, item.weight_grams),
  }));

  await supabase.from("order_items").insert(orderItems);

  if (body.payment_method === "pix") {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (token) {
      const response = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_amount: total / 100,
          description: "Nutallis Brasil",
          payment_method_id: "pix",
          external_reference: order.id,
          notification_url: process.env.MERCADOPAGO_WEBHOOK_URL,
        }),
      });

      const data = (await response.json()) as {
        point_of_interaction?: { transaction_data?: { ticket_url?: string } };
      };
      return NextResponse.json({
        redirect_url: data.point_of_interaction?.transaction_data?.ticket_url,
      });
    }
  }

  if (body.payment_method === "card") {
    const url = process.env.EFI_CHECKOUT_URL;
    if (url) {
      return NextResponse.json({ redirect_url: url });
    }
  }

  return NextResponse.json({ redirect_url: "/checkout?status=pending" });
};
