import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OrdersList } from "@/components/admin/orders-list";

export default async function OrdersPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select("id,status,total_cents,created_at")
    .order("created_at", { ascending: false });

  return (
    <OrdersList
      orders={(data ?? []) as {
        id: string;
        status: string;
        total_cents: number;
        created_at: string;
      }[]}
    />
  );
}
