import { createServerClient as createServer } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServer(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items) => {
          try {
            items.forEach((item) => {
              cookieStore.set(item.name, item.value, item.options);
            });
          } catch {
            // no-op in server components
          }
        },
      },
    }
  );
};
