import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WizardData, CalculationItem, CatalogItem } from '../types';
import { SECTIONS } from '../constants';

interface WizardStep3Props {
  data: WizardData;
  catalogItems: CatalogItem[];
  onChange: (data: Partial<WizardData>) => void;
}

const calculateQty = (formula: string, area: number, floors: number): number => {
  const areaVal = area;
  const floorsVal = floors;
  try {
    return eval(formula.replace(/area/g, `${areaVal}`).replace(/floors/g, `${floorsVal}`));
  } catch {
    return 1;
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
};

export const WizardStep3 = ({ data, catalogItems, onChange }: WizardStep3Props) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId);
    } else {
      newSet.add(sectionId);
    }
    setExpandedSections(newSet);
  };

  const getItemsForSection = (sectionId: string) => {
    return catalogItems.filter((item) => item.section_id === sectionId);
  };

  const defaultVariant = (packageId: string) => {
    switch (packageId) {
      case 'economy':
        return 'economy_default';
      case 'comfort':
        return 'comfort_default';
      default:
        return 'standard_default';
    }
  };

  const initializeItems = () => {
    if (data.items.length === 0) {
      const newItems: CalculationItem[] = catalogItems.map((cat) => {
        const variantKey = defaultVariant(data.package);
        const variantName = cat[variantKey as keyof CatalogItem] as string;
        const variant = cat.variants.find((v) => v.name === variantName);

        const qty = calculateQty(cat.base_qty_formula, data.area, data.floors);

        return {
          id: `calc-${cat.id}`,
          catalog_item_id: cat.id,
          section_id: cat.section_id,
          name: cat.name,
          unit: cat.unit,
          quantity: qty,
          variant_name: variantName,
          material_price: variant?.material_price || 0,
          work_price: variant?.work_price || 0,
          delivery_price: variant?.delivery_price || 0,
          is_enabled: cat.is_required,
          is_custom: false,
          is_modified: false,
          sort_order: cat.sort_order,
        };
      });
      onChange({ items: newItems });
    }
  };

  initializeItems();

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          onChange({ items: [] });
          initializeItems();
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        ↻ Сбросить к стандартам пакета
      </button>

      {SECTIONS.map((section) => {
        const items = getItemsForSection(section.id);
        if (items.length === 0) return null;

        const isExpanded = expandedSections.has(section.id);

        return (
          <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-green-100 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">{section.name}</h3>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {isExpanded && (
              <div className="divide-y">
                {items.map((catItem) => {
                  const calcItem = data.items.find((i) => i.catalog_item_id === catItem.id);
                  if (!calcItem) return null;

                  const totalPrice =
                    (calcItem.material_price + calcItem.work_price + calcItem.delivery_price) *
                    calcItem.quantity;

                  return (
                    <div key={calcItem.id} className="p-6 bg-white">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={calcItem.is_enabled}
                          onChange={(e) => {
                            onChange({
                              items: data.items.map((item) =>
                                item.id === calcItem.id
                                  ? { ...item, is_enabled: e.target.checked }
                                  : item
                              ),
                            });
                          }}
                          className="mt-1 w-5 h-5 text-green-600 rounded"
                        />

                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{calcItem.name}</h4>

                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Вариант
                              </label>
                              <select
                                value={calcItem.variant_name}
                                onChange={(e) => {
                                  const variant = catItem.variants.find(
                                    (v) => v.name === e.target.value
                                  );
                                  if (variant) {
                                    onChange({
                                      items: data.items.map((item) =>
                                        item.id === calcItem.id
                                          ? {
                                              ...item,
                                              variant_name: e.target.value,
                                              material_price: variant.material_price,
                                              work_price: variant.work_price,
                                              delivery_price: variant.delivery_price,
                                              is_modified: true,
                                            }
                                          : item
                                      ),
                                    });
                                  }
                                }}
                                disabled={!calcItem.is_enabled}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
                              >
                                {catItem.variants.map((v) => (
                                  <option key={v.name} value={v.name}>
                                    {v.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Кол-во ({calcItem.unit})
                              </label>
                              <input
                                type="number"
                                value={calcItem.quantity}
                                onChange={(e) => {
                                  onChange({
                                    items: data.items.map((item) =>
                                      item.id === calcItem.id
                                        ? { ...item, quantity: Number(e.target.value) }
                                        : item
                                    ),
                                  });
                                }}
                                disabled={!calcItem.is_enabled}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
                              />
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                            <div>
                              <div className="font-medium">Материалы</div>
                              <div>{formatPrice(calcItem.material_price * calcItem.quantity)}</div>
                            </div>
                            <div>
                              <div className="font-medium">Работа</div>
                              <div>{formatPrice(calcItem.work_price * calcItem.quantity)}</div>
                            </div>
                            <div>
                              <div className="font-medium">Доставка</div>
                              <div>{formatPrice(calcItem.delivery_price * calcItem.quantity)}</div>
                            </div>
                            <div>
                              <div className="font-medium">Итого</div>
                              <div className="font-bold text-gray-900">{formatPrice(totalPrice)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
