"use client";

import * as React from "react";
import type { Product } from "@/lib/types";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeightSelector } from "@/components/store/weight-selector";
import { useCart } from "@/components/store/cart-context";

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const [weight, setWeight] = React.useState(250);
  const [priceCents, setPriceCents] = React.useState(0);

  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="rounded-2xl bg-forest/10 p-6">
        <div className="text-sm uppercase tracking-[0.2em] text-forest/60">
          {product.category_name ?? "Selecao Nutallis"}
        </div>
        <CardTitle className="display-font mt-3 text-2xl">
          {product.name}
        </CardTitle>
        <CardDescription className="mt-2">
          {product.description ?? "Blend premium Nutallis."}
        </CardDescription>
      </div>
      <WeightSelector
        pricePerKgCents={product.price_per_kg_cents}
        onChange={(nextWeight, nextPrice) => {
          setWeight(nextWeight);
          setPriceCents(nextPrice);
        }}
      />
      <Button
        type="button"
        onClick={() =>
          addItem({
            id: product.id,
            name: product.name,
            image_url: product.image_url,
            price_per_kg_cents: product.price_per_kg_cents,
            weight_grams: weight,
            category_name: product.category_name ?? null,
          })
        }
        className="mt-auto"
      >
        Adicionar ao carrinho
      </Button>
      <div className="text-xs text-foreground/60">
        Preco atual: {priceCents > 0 ? `R$ ${(priceCents / 100).toFixed(2)}` : "--"}
      </div>
    </Card>
  );
};
