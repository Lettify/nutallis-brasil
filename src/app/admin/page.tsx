import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCaixinhas } from "@/lib/caixinhas";
import { getSinceIsoDate } from "@/lib/analytics";
import { formatCurrencyBRL } from "@/lib/currency";

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient();
  const { data: boxes } = await supabase
    .from("finance_boxes")
    .select("box_key,amount_cents")
    .order("box_key", { ascending: true });

  const { data: lowStockData } = await supabase
    .from("products")
    .select("id,name,stock_grams,reorder_point_grams");

  const since = getSinceIsoDate(14);
  const { data: sales } = await supabase
    .from("order_items")
    .select("product_id,weight_grams,orders(created_at)")
    .gte("orders.created_at", since);

  const salesByProduct = (sales ?? []).reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.product_id] = (acc[item.product_id] ?? 0) + item.weight_grams;
      return acc;
    },
    {}
  );

  const lowStock = (lowStockData ?? []).filter((item) => {
    const avgDaily = (salesByProduct[item.id] ?? 0) / 14;
    const recommended = Math.round(avgDaily * 7);
    const point = item.reorder_point_grams ?? recommended;
    return item.stock_grams <= point;
  });

  const fallback = getCaixinhas();
  const totals = fallback.map((box) => {
    const sum = boxes
      ?.filter((item) => item.box_key === box.key)
      .reduce((acc, item) => acc + item.amount_cents, 0);
    return { ...box, amount_cents: sum ?? 0 };
  });

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-forest/10 bg-white/90 p-8">
        <div className="display-font text-3xl text-forest">
          Visao geral Nutallis
        </div>
        <p className="text-sm text-foreground/60">
          Caixinhas financeiras e alertas de estoque em tempo real.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {totals.map((box) => (
          <Card key={box.key} className="bg-white">
            <CardTitle className="display-font text-xl">
              {box.label}
            </CardTitle>
            <CardDescription className="mt-2">
              {formatCurrencyBRL(box.amount_cents)}
            </CardDescription>
          </Card>
        ))}
      </div>

      <div className="rounded-3xl border border-forest/10 bg-white/90 p-6">
        <div className="text-lg font-semibold text-forest">
          Alertas de ponto de pedido
        </div>
        <div className="mt-4 space-y-3 text-sm text-foreground/70">
          {lowStock?.length ? (
            lowStock.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-forest/10 p-4"
              >
                <div>
                  <div className="font-medium text-forest">{item.name}</div>
                  <div className="text-xs text-foreground/60">
                    {item.stock_grams}g em estoque
                  </div>
                </div>
                <button className="rounded-full border border-forest/30 px-4 py-2 text-xs text-forest">
                  Gerar pedido
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-forest/20 p-4">
              Nenhum alerta no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
