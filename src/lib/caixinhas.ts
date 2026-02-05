import type { FinanceBox } from "@/lib/types";

const BOXES = [
  { key: "restock", label: "Reposicao de Estoque", pct: 0.53 },
  { key: "marketing", label: "Marketing/Ads", pct: 0.15 },
  { key: "expansion", label: "Escala/Expansao", pct: 0.17 },
  { key: "inputs", label: "Insumos", pct: 0.05 },
  { key: "reserve", label: "Reserva/MEI", pct: 0.1 },
] as const;

export const splitCaixinhas = (netValueCents: number): FinanceBox[] =>
  BOXES.map((box) => ({
    ...box,
    amount_cents: Math.round(netValueCents * box.pct),
  }));

export const getCaixinhas = () =>
  BOXES.map((box) => ({
    ...box,
    amount_cents: 0,
  }));
