"use client";

import * as React from "react";
import type { ShippingQuote } from "@/lib/types";
import { formatCurrencyBRL } from "@/lib/currency";

export const ShippingSummary = ({ quote }: { quote: ShippingQuote | null }) => (
  <div className="rounded-2xl border border-forest/10 bg-white/70 p-4 text-sm">
    <div className="flex items-center justify-between">
      <span>Frete</span>
      <span className="font-semibold text-forest">
        {quote ? formatCurrencyBRL(quote.fee_cents) : "--"}
      </span>
    </div>
    {quote && (
      <div className="mt-2 text-xs text-foreground/60">
        {quote.provider === "manual"
          ? "Calculo manual com fallback automatico"
          : `Roteado por ${quote.provider}`}
        {quote.eta_minutes ? ` · ${quote.eta_minutes} min` : ""}
      </div>
    )}
  </div>
);
