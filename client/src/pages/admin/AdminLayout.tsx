import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  Settings,
  Tag,
  Menu,
  LogOut,
  User,
  Home,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Produtos", href: "/admin/produtos" },
  { icon: ShoppingCart, label: "Pedidos", href: "/admin/pedidos" },
  { icon: DollarSign, label: "Financeiro", href: "/admin/financeiro" },
  { icon: FileText, label: "Conteúdo", href: "/admin/conteudo" },
  { icon: Tag, label: "Cupons", href: "/admin/cupons" },
  { icon: Settings, label: "Configurações", href: "/admin/configuracoes" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-serif font-bold text-cacau mb-4">
            Acesso Restrito
          </h1>
          <p className="text-muted-foreground mb-8">
            Faça login para acessar o painel administrativo.
          </p>
          <Button className="btn-gold" onClick={() => void startLogin("/admin")}>
            Entrar na Conta
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <User className="h-16 w-16 mx-auto text-destructive mb-6" />
          <h1 className="text-2xl font-serif font-bold text-cacau mb-4">
            Acesso Negado
          </h1>
          <p className="text-muted-foreground mb-8">
            Você não tem permissão para acessar esta área.
          </p>
          <Link href="/">
            <Button className="btn-gold">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/">
          <h2 className="text-xl font-serif font-bold text-cacau">
            Nutallis <span className="text-ouro">Admin</span>
          </h2>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-ouro text-cacau font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-cacau"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-ouro/10 flex items-center justify-center">
            <User className="h-5 w-5 text-ouro" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-cacau truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            logout();
            setIsMobileMenuOpen(false);
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h2 className="text-lg font-serif font-bold text-cacau">
                Nutallis <span className="text-ouro">Admin</span>
              </h2>
            </Link>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
