import type { EstimateItem } from "./types";

export interface EstimateTotals {
  directCost: number;
  markupAmt: number;
  sellingTotal: number;
  profit: number;
  avgMarkupPct: number;
}

export function computeTotals(rows: EstimateItem[]): EstimateTotals {
  const directCost = rows.reduce(
    (s, r) => s + (r.qty || 0) * (r.cost || 0),
    0
  );
  const sellingTotal = rows.reduce(
    (s, r) => s + (r.qty || 0) * (r.cost || 0) * (1 + (r.markup || 0) / 100),
    0
  );
  const markupAmt = sellingTotal - directCost;
  const avgMarkupPct = directCost > 0 ? (markupAmt / directCost) * 100 : 0;
  return {
    directCost,
    sellingTotal,
    markupAmt,
    profit: markupAmt,
    avgMarkupPct,
  };
}

export function rowSelling(r: EstimateItem) {
  return (r.cost || 0) * (1 + (r.markup || 0) / 100);
}

export function rowTotal(r: EstimateItem) {
  return (r.qty || 0) * rowSelling(r);
}
