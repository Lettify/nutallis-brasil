import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const applyOrderStockAdjustments = async (orderId: string) => {
  const supabase = createSupabaseAdminClient();
  const { data: items } = await supabase
    .from("order_items")
    .select("product_id,weight_grams")
    .eq("order_id", orderId);

  if (!items) return;

  await Promise.all(
    items.map(async (item) => {
      const { data: product } = await supabase
        .from("products")
        .select("stock_grams")
        .eq("id", item.product_id)
        .single();

      if (!product) return;
      const nextStock = Math.max(0, product.stock_grams - item.weight_grams);
      await supabase
        .from("products")
        .update({ stock_grams: nextStock })
        .eq("id", item.product_id);
    })
  );
};
