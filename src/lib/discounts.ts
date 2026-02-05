export const getDiscountRate = (weightGrams: number) => {
  if (weightGrams >= 1000) return 0.1;
  if (weightGrams >= 500) return 0.06;
  if (weightGrams >= 250) return 0.03;
  return 0;
};

export const calculatePriceCents = (
  pricePerKgCents: number,
  weightGrams: number
) => {
  const base = Math.round((pricePerKgCents * weightGrams) / 1000);
  const discount = Math.round(base * getDiscountRate(weightGrams));
  return base - discount;
};
