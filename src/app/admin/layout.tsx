import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3efe7]">
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-6 py-10">
        <aside className="hidden w-56 flex-col gap-4 rounded-3xl border border-forest/10 bg-white/90 p-6 text-sm text-foreground/70 md:flex">
          <div className="display-font text-xl text-forest">Nutallis ERP</div>
          <Link href="/admin" className="text-forest">
            Dashboard
          </Link>
          <Link href="/admin/products">Produtos</Link>
          <Link href="/admin/categories">Categorias</Link>
          <Link href="/admin/orders">Pedidos</Link>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
