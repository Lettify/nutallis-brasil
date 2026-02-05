export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number | null;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  category_name?: string | null;
  price_per_kg_cents: number;
  cost_per_kg_cents: number | null;
  margin_pct: number | null;
  stock_grams: number;
  reorder_point_grams: number | null;
  image_url: string | null;
  active: boolean;
};

export type CartItem = {
  id: string;
  name: string;
  image_url: string | null;
  price_per_kg_cents: number;
  weight_grams: number;
  category_name?: string | null;
};

export type ShippingQuote = {
  provider: "uber" | "ifood" | "manual";
  fee_cents: number;
  eta_minutes: number | null;
  distance_km: number;
};

export type FinanceBoxKey =
  | "restock"
  | "marketing"
  | "expansion"
  | "inputs"
  | "reserve";

export type FinanceBox = {
  key: FinanceBoxKey;
  label: string;
  pct: number;
  amount_cents: number;
};
