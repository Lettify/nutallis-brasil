"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL } from "@/lib/currency";

type Order = {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
};

export const OrdersList = ({ orders }: { orders: Order[] }) => {
  const [dispatching, setDispatching] = React.useState<string | null>(null);

  const handleDispatch = async (id: string) => {
    setDispatching(id);
    await fetch("/api/logistics/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: id }),
    });
    setDispatching(null);
  };

  return (
    <div className="rounded-3xl border border-forest/10 bg-white/90 p-6">
      <h2 className="text-lg font-semibold text-forest">Pedidos</h2>
      <div className="mt-4 space-y-3 text-sm">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex flex-col gap-2 rounded-2xl border border-forest/10 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="font-semibold text-forest">#{order.id}</div>
              <div className="text-xs text-foreground/60">
                {new Date(order.created_at).toLocaleString("pt-BR")}
              </div>
            </div>
            <div className="text-xs text-foreground/70">{order.status}</div>
            <div className="font-semibold text-forest">
              {formatCurrencyBRL(order.total_cents)}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDispatch(order.id)}
              disabled={dispatching === order.id}
            >
              {dispatching === order.id ? "Despachando..." : "Despachar"}
            </Button>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-forest/20 p-4 text-sm">
            Nenhum pedido registrado.
          </div>
        )}
      </div>
    </div>
  );
};
