import { ConstructionItem, CostBreakdown } from './types';

export const calculateItemCost = (
  item: ConstructionItem,
  area: number
): CostBreakdown => {
  if (!item.enabled) {
    return { work: 0, materials: 0, transport: 0, total: 0 };
  }

  const selectedOption = item.options.find(
    (opt) => opt.id === item.selectedOptionId
  );

  if (!selectedOption) {
    return { work: 0, materials: 0, transport: 0, total: 0 };
  }

  const total = selectedOption.pricePerSqm * area;
  const work = total * 0.35;
  const materials = total * 0.55;
  const transport = total * 0.1;

  return { work, materials, transport, total };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(num);
};
