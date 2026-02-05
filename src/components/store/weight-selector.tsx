"use client";

import * as React from "react";
import { calculatePriceCents, getDiscountRate } from "@/lib/discounts";
import { formatCurrencyBRL } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const presets = [100, 250, 500, 1000];

const useDebouncedValue = <T,>(value: T, delay = 250) => {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);

  return debounced;
};

type WeightSelectorProps = {
  pricePerKgCents: number;
  initialWeight?: number;
  onChange?: (weight: number, priceCents: number) => void;
};

export const WeightSelector = ({
  pricePerKgCents,
  initialWeight = 250,
  onChange,
}: WeightSelectorProps) => {
  const [weight, setWeight] = React.useState(initialWeight);
  const debouncedWeight = useDebouncedValue(weight, 240);

  const priceCents = React.useMemo(
    () => calculatePriceCents(pricePerKgCents, debouncedWeight),
    [pricePerKgCents, debouncedWeight]
  );

  React.useEffect(() => {
    onChange?.(debouncedWeight, priceCents);
  }, [debouncedWeight, priceCents, onChange]);

  const discountRate = getDiscountRate(debouncedWeight);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant={weight === preset ? "primary" : "outline"}
            onClick={() => setWeight(preset)}
            className="h-9 px-4 text-xs"
          >
            {preset}g
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Input
          type="number"
          min={100}
          step={10}
          value={weight}
          onChange={(event) => setWeight(Number(event.target.value))}
        />
        <div className="text-right">
          <div className="text-sm font-semibold text-forest">
            {formatCurrencyBRL(priceCents)}
          </div>
          <div className="text-xs text-foreground/60">
            {discountRate > 0
              ? `Desconto ${Math.round(discountRate * 100)}% aplicado`
              : "Preco base"}
          </div>
        </div>
      </div>
    </div>
  );
};
