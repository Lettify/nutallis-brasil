"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const assertAdmin = async () => {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user?.user_metadata?.role !== "admin") {
    throw new Error("Acesso negado");
  }
};

export const upsertCategory = async (form: {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
  active: boolean;
}) => {
  await assertAdmin();
  const supabase = createSupabaseAdminClient();
  const payload = {
    id: form.id,
    name: form.name,
    slug: form.slug,
    description: form.description ?? null,
    sort_order: form.sort_order ?? 0,
    active: form.active,
  };
  const { error } = await supabase.from("categories").upsert(payload);
  if (error) throw error;
  revalidatePath("/admin/categories");
};

export const deleteCategory = async (id: string) => {
  await assertAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/categories");
};

export const upsertProduct = async (form: {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  category_id: string;
  price_per_kg_cents: number;
  cost_per_kg_cents?: number;
  margin_pct?: number;
  stock_grams: number;
  reorder_point_grams?: number;
  image_url?: string | null;
  active: boolean;
}) => {
  await assertAdmin();
  const supabase = createSupabaseAdminClient();
  const payload = {
    ...form,
    description: form.description ?? null,
    cost_per_kg_cents: form.cost_per_kg_cents ?? null,
    margin_pct: form.margin_pct ?? null,
    reorder_point_grams: form.reorder_point_grams ?? null,
    image_url: form.image_url ?? null,
  };
  const { error } = await supabase.from("products").upsert(payload);
  if (error) throw error;
  revalidatePath("/admin/products");
};

export const deleteProduct = async (id: string) => {
  await assertAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/products");
};
