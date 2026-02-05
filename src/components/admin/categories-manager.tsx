"use client";

import * as React from "react";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertCategory, deleteCategory } from "@/app/admin/actions";

export const CategoriesManager = ({ categories }: { categories: Category[] }) => {
  const [form, setForm] = React.useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
    active: true,
  });

  const submit = async () => {
    await upsertCategory({
      ...form,
      id: form.id || undefined,
      sort_order: Number(form.sort_order),
    });
    setForm({ id: "", name: "", slug: "", description: "", sort_order: 0, active: true });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-forest/10 bg-white/90 p-6">
        <h2 className="text-lg font-semibold text-forest">Nova categoria</h2>
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
          <Input
            type="number"
            placeholder="Ordem"
            value={form.sort_order}
            onChange={(event) =>
              setForm({ ...form, sort_order: Number(event.target.value) })
            }
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
            Ativa
          </label>
          <Button type="button" onClick={() => void submit()}>
            Salvar
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-forest/10 bg-white/90 p-6">
        <h2 className="text-lg font-semibold text-forest">Categorias</h2>
        <div className="mt-4 space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col gap-2 rounded-2xl border border-forest/10 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-semibold text-forest">{category.name}</div>
                <div className="text-xs text-foreground/60">{category.slug}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      id: category.id,
                      name: category.name,
                      slug: category.slug,
                      description: category.description ?? "",
                      sort_order: category.sort_order ?? 0,
                      active: category.active,
                    })
                  }
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void deleteCategory(category.id)}
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
