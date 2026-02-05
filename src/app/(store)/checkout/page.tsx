"use client";

import * as React from "react";
import { useCart } from "@/components/store/cart-context";
import { AddressAutocomplete } from "@/components/store/checkout/address-autocomplete";
import { ShippingSummary } from "@/components/store/checkout/shipping-summary";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL } from "@/lib/currency";
import { calculatePriceCents } from "@/lib/discounts";
import type { ShippingQuote } from "@/lib/types";

export default function CheckoutPage() {
  const { state, totals, clear } = useCart();
  const [quote, setQuote] = React.useState<ShippingQuote | null>(null);
  const [address, setAddress] = React.useState<string>("");
  const [payment, setPayment] = React.useState<"pix" | "card">("pix");
  const [loading, setLoading] = React.useState(false);

  const total = quote ? totals.subtotal_cents + quote.fee_cents : null;

  const requestQuote = async (nextAddress: string, location: {
    lat: number;
    lng: number;
  }) => {
    const response = await fetch("/api/shipping/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: nextAddress, location }),
    });
    if (!response.ok) return;
    const data = (await response.json()) as ShippingQuote;
    setQuote(data);
  };

  const handlePayment = async () => {
    setLoading(true);
    const response = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: state.items,
        address,
        shipping: quote,
        payment_method: payment,
      }),
    });
    setLoading(false);
    if (!response.ok) return;
    const data = (await response.json()) as { redirect_url?: string };
    if (data.redirect_url) {
      window.location.href = data.redirect_url;
      return;
    }
    clear();
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12">
      <h1 className="display-font text-3xl text-forest">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-forest/10 bg-white/80 p-6">
            <h2 className="text-lg font-semibold text-forest">Endereco</h2>
            <p className="text-sm text-foreground/60">
              Autocomplete com Google Maps e calculo de frete em tempo real.
            </p>
            <div className="mt-4">
              <AddressAutocomplete
                onPlaceSelected={(place) => {
                  setAddress(place.address);
                  void requestQuote(place.address, place.location);
                }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-forest/10 bg-white/80 p-6">
            <h2 className="text-lg font-semibold text-forest">Pagamento</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { key: "pix", label: "Pix (Mercado Pago)" },
                { key: "card", label: "Cartao (EfI)" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setPayment(option.key as "pix" | "card")}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${
                    payment === option.key
                      ? "border-forest bg-forest text-cream"
                      : "border-forest/20 text-forest"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-forest/10 bg-white/80 p-6">
            <h2 className="text-lg font-semibold text-forest">Resumo</h2>
            <div className="mt-4 space-y-3 text-sm">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-forest">{item.name}</div>
                    <div className="text-xs text-foreground/60">
                      {item.weight_grams}g
                    </div>
                  </div>
                  <div className="font-semibold text-forest">
                    {formatCurrencyBRL(
                      calculatePriceCents(
                        item.price_per_kg_cents,
                        item.weight_grams
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-forest/5 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-forest">
                  {formatCurrencyBRL(totals.subtotal_cents)}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <ShippingSummary quote={quote} />
            </div>
            <div className="mt-4 flex items-center justify-between text-base font-semibold text-forest">
              <span>Total</span>
              <span>{total ? formatCurrencyBRL(total) : "--"}</span>
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => void handlePayment()}
              disabled={!address || !quote || loading}
            >
              {loading ? "Processando..." : "Confirmar e pagar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
