"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-context";
import { formatCurrencyBRL } from "@/lib/currency";
import { calculatePriceCents } from "@/lib/discounts";
import Link from "next/link";

export const CartDrawer = () => {
  const { state, removeItem, totals } = useCart();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <ShoppingBag size={18} />
          Carrinho ({totals.items})
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed right-4 top-4 h-[calc(100vh-2rem)] w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-forest">
              Seu carrinho
            </Dialog.Title>
            <Dialog.Close className="text-sm text-foreground/60">Fechar</Dialog.Close>
          </div>
          <div className="mt-6 space-y-4 overflow-auto pr-2">
            {state.items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-forest/20 p-6 text-sm text-foreground/70">
                Seu carrinho esta vazio.
              </div>
            )}
            {state.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between rounded-2xl border border-forest/10 p-4"
              >
                <div>
                  <div className="text-sm font-semibold text-forest">
                    {item.name}
                  </div>
                  <div className="text-xs text-foreground/60">
                    {item.weight_grams}g · {item.category_name ?? "Nutallis"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-forest">
                    {formatCurrencyBRL(
                      calculatePriceCents(item.price_per_kg_cents, item.weight_grams)
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-foreground/50 hover:text-forest"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-forest/5 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-forest">
                {formatCurrencyBRL(totals.subtotal_cents)}
              </span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" className="w-full">
                Continuar comprando
              </Button>
            </Dialog.Close>
            <Button asChild className="w-full">
              <Link href="/checkout">Finalizar</Link>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
