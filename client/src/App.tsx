import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

// Account Pages
import Account from "./pages/account/Account";
import Orders from "./pages/account/Orders";
import Wishlist from "./pages/account/Wishlist";
import Addresses from "./pages/account/Addresses";
import Payments from "./pages/account/Payments";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminFinancial from "./pages/admin/Financial";
import AdminContent from "./pages/admin/Content";
import AdminSettings from "./pages/admin/Settings";
import AdminCoupons from "./pages/admin/Coupons";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/produto/:slug" component={ProductDetail} />
      <Route path="/sobre" component={About} />
      <Route path="/contato" component={Contact} />
      <Route path="/carrinho" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      
      {/* Account Pages */}
      <Route path="/conta" component={Account} />
      <Route path="/conta/pedidos" component={Orders} />
      <Route path="/conta/favoritos" component={Wishlist} />
      <Route path="/conta/enderecos" component={Addresses} />
      <Route path="/conta/pagamentos" component={Payments} />
      
      {/* Admin Pages */}
      <Route path="/admin" component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/produtos" component={() => <AdminLayout><AdminProducts /></AdminLayout>} />
      <Route path="/admin/pedidos" component={() => <AdminLayout><AdminOrders /></AdminLayout>} />
      <Route path="/admin/financeiro" component={() => <AdminLayout><AdminFinancial /></AdminLayout>} />
      <Route path="/admin/conteudo" component={() => <AdminLayout><AdminContent /></AdminLayout>} />
      <Route path="/admin/cupons" component={() => <AdminLayout><AdminCoupons /></AdminLayout>} />
      <Route path="/admin/configuracoes" component={() => <AdminLayout><AdminSettings /></AdminLayout>} />
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
