import { CalculationItem, CompanySettings } from './types';

// ─── Full pricing breakdown per one CalculationItem ───────────────────────────
export interface PriceBreakdown {
  materials: number;
  work: number;
  delivery: number;
  base: number;
  overhead: number;
  contingency: number;
  usn: number;
  total_cost: number;        // Себестоимость (что платит компания)
  total_client_price: number; // Цена клиента (с маржой)
}

export const calcItemBreakdown = (
  item: CalculationItem,
  settings: CompanySettings,
): PriceBreakdown => {
  const empty: PriceBreakdown = {
    materials: 0, work: 0, delivery: 0, base: 0,
    overhead: 0, contingency: 0, usn: 0,
    total_cost: 0, total_client_price: 0,
  };
  if (!item.is_enabled) return empty;

  const materials   = item.material_price  * item.quantity;
  const work        = item.work_price      * item.quantity;
  const delivery    = item.delivery_price  * item.quantity;
  const base        = materials + work + delivery;

  const overhead    = base * (settings.overhead_percent    / 100); // 8%
  const contingency = base * (settings.contingency_percent / 100); // 5%
  const subtotal    = base + overhead + contingency;

  const usn         = subtotal * (settings.usn_percent / 100);     // 10%
  const total_cost  = subtotal + usn;

  // Цена клиента = себестоимость × (1 + маржа)
  const total_client_price = total_cost * (1 + settings.margin_percent / 100);

  return { materials, work, delivery, base, overhead, contingency, usn, total_cost, total_client_price };
};

// ─── Aggregate totals for a list of items ─────────────────────────────────────
export const calcTotals = (
  items: CalculationItem[],
  settings: CompanySettings,
): { total_cost: number; total_client_price: number } => {
  return items.reduce(
    (acc, item) => {
      const bd = calcItemBreakdown(item, settings);
      return {
        total_cost:         acc.total_cost         + bd.total_cost,
        total_client_price: acc.total_client_price + bd.total_client_price,
      };
    },
    { total_cost: 0, total_client_price: 0 },
  );
};

// ─── Formatting helpers ────────────────────────────────────────────────────────
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(num);
