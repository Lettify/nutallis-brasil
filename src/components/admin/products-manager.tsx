"use client";

import * as React from "react";
import type { Category, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { upsertProduct, deleteProduct } from "@/app/admin/actions";

const uploadImage = async (file: File) => {
  const supabase = createSupabaseBrowserClient();
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "product-images";
  const path = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const ProductsManager = ({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) => {
  const [form, setForm] = React.useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    category_id: categories[0]?.id ?? "",
    price_per_kg_cents: 0,
    cost_per_kg_cents: 0,
    margin_pct: 0,
    stock_grams: 0,
    reorder_point_grams: 0,
    image_url: "",
    active: true,
  });

  const submit = async () => {
    await upsertProduct({
      ...form,
      id: form.id || undefined,
      price_per_kg_cents: Number(form.price_per_kg_cents),
      cost_per_kg_cents: Number(form.cost_per_kg_cents) || undefined,
      margin_pct: Number(form.margin_pct) || undefined,
      stock_grams: Number(form.stock_grams),
      reorder_point_grams: Number(form.reorder_point_grams) || undefined,
      image_url: form.image_url || undefined,
    });
    setForm({
      id: "",
      name: "",
      slug: "",
      description: "",
      category_id: categories[0]?.id ?? "",
      price_per_kg_cents: 0,
      cost_per_kg_cents: 0,
      margin_pct: 0,
      stock_grams: 0,
      reorder_point_grams: 0,
      image_url: "",
      active: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-forest/10 bg-white/90 p-6">
        <h2 className="text-lg font-semibold text-forest">Novo produto</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Nome"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Input
            placeholder="Slug"
            value={form.slug}
            onChange={(event) => setForm({ ...form, slug: event.target.value })}
          />
          <Input
            placeholder="Descricao"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
          <select
            value={form.category_id}
            onChange={(event) =>
              setForm({ ...form, category_id: event.target.value })
            }
            className="h-11 rounded-2xl border border-forest/20 bg-cream px-4 text-sm"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Preco por kg (centavos)"
            value={form.price_per_kg_cents}
            onChange={(event) =>
              setForm({ ...form, price_per_kg_cents: Number(event.target.value) })
            }
          />
          <Input
            type="number"
            placeholder="Custo por kg (centavos)"
            value={form.cost_per_kg_cents}
            onChange={(event) =>
              setForm({ ...form, cost_per_kg_cents: Number(event.target.value) })
            }
          />
          <Input
            type="number"
            placeholder="Margem %"
            value={form.margin_pct}
            onChange={(event) =>
              setForm({ ...form, margin_pct: Number(event.target.value) })
            }
          />
          <Input
            type="number"
            placeholder="Estoque (g)"
            value={form.stock_grams}
            onChange={(event) =>
              setForm({ ...form, stock_grams: Number(event.target.value) })
            }
          />
          <Input
            type="number"
            placeholder="Ponto de pedido (g)"
            value={form.reorder_point_grams}
            onChange={(event) =>
              setForm({ ...form, reorder_point_grams: Number(event.target.value) })
            }
          />
          <Input
            placeholder="URL da imagem"
            value={form.image_url}
            onChange={(event) => setForm({ ...form, image_url: event.target.value })}
          />
          <Input
            type="file"
            accept="image/*"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const url = await uploadImage(file);
              setForm({ ...form, image_url: url });
            }}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm({ ...form, active: event.target.checked })
              }
            />
            Ativo
          </label>
          <Button type="button" onClick={() => void submit()}>
            Salvar
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-forest/10 bg-white/90 p-6">
        <h2 className="text-lg font-semibold text-forest">Produtos</h2>
        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-2 rounded-2xl border border-forest/10 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-semibold text-forest">{product.name}</div>
                <div className="text-xs text-foreground/60">
                  {product.category_name ?? "Sem categoria"}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      description: product.description ?? "",
                      category_id: product.category_id,
                      price_per_kg_cents: product.price_per_kg_cents,
                      cost_per_kg_cents: product.cost_per_kg_cents ?? 0,
                      margin_pct: product.margin_pct ?? 0,
                      stock_grams: product.stock_grams,
                      reorder_point_grams: product.reorder_point_grams ?? 0,
                      image_url: product.image_url ?? "",
                      active: product.active,
                    })
                  }
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void deleteProduct(product.id)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
