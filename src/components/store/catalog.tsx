"use client";

import * as React from "react";
import type { Category, Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

type CatalogProps = {
  categories: Category[];
  products: Product[];
};

export const Catalog = ({ categories, products }: CatalogProps) => {
  const [category, setCategory] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const search = normalize(query);
    return products.filter((product) => {
      const matchesCategory =
        category === "all" || product.category_id === category;
      const matchesQuery =
        search.length === 0 ||
        normalize(product.name).includes(search) ||
        normalize(product.description ?? "").includes(search);
      return matchesCategory && matchesQuery;
    });
  }, [products, category, query]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-forest/10 bg-white/70 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="display-font text-3xl text-forest">
              Catalogo Nutallis
            </h2>
            <p className="text-sm text-foreground/60">
              Filtros rapidos, busca instantanea e peso sob medida.
            </p>
          </div>
          <Input
            placeholder="Busque por castanhas, mixes, sementes..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="md:max-w-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={category === "all" ? "primary" : "outline"}
            onClick={() => setCategory("all")}
            className="h-9"
          >
            Todos
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              type="button"
              variant={category === cat.id ? "primary" : "outline"}
              onClick={() => setCategory(cat.id)}
              className="h-9"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-forest/30 p-8 text-center text-sm text-foreground/70">
            Nenhum produto encontrado para esse filtro.
          </div>
        )}
      </div>
    </section>
  );
};
