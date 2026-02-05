import { createServerClient as createServer } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieItem = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  return createServer(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items: CookieItem[]) => {
          try {
            const store = cookieStore as unknown as {
              set: (name: string, value: string, options?: Record<string, unknown>) => void;
            };
            if (!store.set) return;
            items.forEach((item) => {
              store.set(item.name, item.value, item.options);
            });
          } catch {
            // no-op in server components
          }
        },
      },
    }
  );
};
