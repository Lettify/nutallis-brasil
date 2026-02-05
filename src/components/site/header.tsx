import Link from "next/link";
import { CartDrawer } from "@/components/store/cart-drawer";

export const Header = () => (
  <header className="sticky top-0 z-20 border-b border-forest/10 bg-cream/90 backdrop-blur">
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
      <Link href="/" className="display-font text-2xl text-forest">
        Nutallis Brasil
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-foreground/70 md:flex">
        <Link href="#beneficios">Beneficios</Link>
        <Link href="#catalogo">Catalogo</Link>
        <Link href="#assinatura">Assinatura</Link>
      </nav>
      <CartDrawer />
    </div>
  </header>
);
