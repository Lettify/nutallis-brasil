import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default async function CategoriesPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("id,name,slug,description,sort_order,active")
    .order("sort_order", { ascending: true });

  return <CategoriesManager categories={(data as Category[]) ?? []} />;
}
