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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-12">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Badge>Natureza em alta performance</Badge>
          <h1 className="display-font text-4xl text-forest md:text-5xl">
            Nutallis Brasil: blends premium que elevam sua rotina.
          </h1>
          <p className="text-base text-foreground/70">
            Castanhas selecionadas, mixes funcionais e sementes para nutrir seu dia
            com sabor e qualidade. Monte seu peso ideal, receba rapido e acompanhe
            cada pedido no nosso ecossistema inteligente.
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
        <div className="rounded-[32px] bg-gradient-to-br from-[#efe7d8] via-[#f7f1e6] to-[#e3d6c5] p-8 shadow-[0_30px_70px_rgba(31,58,47,0.15)]">
          <div className="space-y-4 rounded-3xl border border-forest/15 bg-white/90 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-forest/50">
              Nutallis insights
            </div>
            <div className="display-font text-2xl text-forest">
              Mais do que e-commerce: um ecossistema vivo.
            </div>
            <p className="text-sm text-foreground/70">
              Controle de estoque em gramas, caixinhas financeiras automatizadas e
              logistica conectada a Uber Direct e iFood Sob Demanda.
            </p>
            <div className="rounded-2xl bg-forest/5 p-4 text-sm text-foreground/70">
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
            className="rounded-3xl border border-forest/10 bg-white/70 p-6 text-sm text-foreground/70"
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
        className="rounded-4xl border border-forest/10 bg-white/80 p-10"
      >
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.3em] text-forest/50">
              Assinatura Nutallis
            </div>
            <h2 className="display-font text-3xl text-forest">
              Monte sua caixa recorrente.
            </h2>
            <p className="text-sm text-foreground/70">
              Combine categorias, defina frequencia e garanta descontos progressivos
              sempre que precisar reabastecer.
            </p>
          </div>
          <div className="rounded-3xl bg-forest/5 p-6 text-sm text-foreground/70">
            Planos personalizados com alertas de reposicao e beneficios para
            membros.
          </div>
        </div>
      </section>
    </div>
  );
}
