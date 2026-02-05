import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Catalog } from "@/components/store/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types";

export default async function StorePage() {
  const supabase = await createSupabaseServerClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug,description,sort_order,active")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const { data: products } = await supabase
    .from("products")
    .select(
      "id,name,slug,description,category_id,price_per_kg_cents,cost_per_kg_cents,margin_pct,stock_grams,reorder_point_grams,image_url,active,categories(name)"
    )
    .eq("active", true)
    .order("name", { ascending: true });

  type ProductRow = Product & {
    categories?: { name: string } | { name: string }[] | null;
  };

  const mappedProducts: Product[] = ((products ?? []) as ProductRow[]).map(
    (product) => ({
      ...product,
      category_name: Array.isArray(product.categories)
        ? product.categories[0]?.name ?? null
        : product.categories?.name ?? null,
    })
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-14">
      <section className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <Badge>Natureza em alta performance</Badge>
          <h1 className="display-font text-4xl text-forest md:text-6xl">
            Nutallis Brasil. Nutricao premium, logistica precisa.
          </h1>
          <p className="text-base text-foreground/80 md:text-lg">
            Castanhas, mixes e sementes com curadoria rigorosa. Escolha o peso ideal,
            acompanhe o pedido em tempo real e receba com a rota mais eficiente.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <a href="#catalogo">Explorar catalogo</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#assinatura">Criar assinatura</a>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Origem rastreada",
                description: "Fornecedores premium e controle total de qualidade.",
              },
              {
                title: "Entrega inteligente",
                description: "Motor logistico com melhor rota em tempo real.",
              },
              {
                title: "Nutricao sob medida",
                description: "Peso personalizado e descontos progressivos.",
              },
            ].map((item) => (
              <Card key={item.title} className="bg-white/90">
                <CardTitle className="display-font text-xl">
                  {item.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {item.description}
                </CardDescription>
              </Card>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] bg-[radial-gradient(circle_at_top,_#fdf8ef,_#efe5d7)] p-8 shadow-[0_30px_70px_rgba(31,58,47,0.12)]">
          <div className="space-y-5 rounded-[26px] border border-forest/15 bg-white p-6">
            <div className="text-xs uppercase tracking-[0.35em] text-forest/55">
              Nutallis insights
            </div>
            <div className="display-font text-2xl text-forest">
              Um ecossistema vivo para operacao e experiencia.
            </div>
            <p className="text-sm text-foreground/75">
              Estoque em gramas, caixinhas financeiras automatizadas e logistica
              integrada com fallback inteligente.
            </p>
            <div className="rounded-2xl bg-forest/6 p-4 text-sm text-foreground/70">
              Monitoramento diario de ponto de pedido com base no consumo real.
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="grid gap-6 md:grid-cols-3">
        {[
          "Curadoria de castanhas e drageados",
          "Mixes funcionais para performance",
          "Sementes nutritivas e versateis",
        ].map((benefit) => (
          <div
            key={benefit}
            className="rounded-[26px] border border-forest/12 bg-white p-6 text-sm text-foreground/75 shadow-[0_18px_40px_rgba(26,33,27,0.08)]"
          >
            <div className="display-font text-lg text-forest">{benefit}</div>
          </div>
        ))}
      </section>

      <section id="catalogo" className="space-y-6">
        <Catalog
          categories={(categories as Category[]) ?? []}
          products={mappedProducts}
        />
      </section>

      <section
        id="assinatura"
        className="rounded-[32px] border border-forest/12 bg-white p-10 shadow-[0_24px_60px_rgba(26,33,27,0.1)]"
      >
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.35em] text-forest/55">
              Assinatura Nutallis
            </div>
            <h2 className="display-font text-3xl text-forest">
              Caixa recorrente, do seu jeito.
            </h2>
            <p className="text-sm text-foreground/75">
              Monte combinacoes, defina frequencia e ganhe desconto progressivo
              sempre que precisar reabastecer.
            </p>
          </div>
          <div className="rounded-[26px] bg-forest/6 p-6 text-sm text-foreground/75">
            Planos personalizados com alertas de reposicao e beneficios para
            membros.
          </div>
        </div>
      </section>
    </div>
  );
}
