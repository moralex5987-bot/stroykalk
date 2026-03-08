import { useState } from 'react';
import { CreditCard as Edit, Trash2, Plus } from 'lucide-react';
import { useStore } from '../store';
import { SECTIONS } from '../constants';

export const CatalogManager = () => {
  const { catalogItems, updateCatalogItems } = useStore();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Справочник материалов</h1>
        <p className="text-gray-600 mt-2">Управление каталогом позиций и вариантов</p>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((section) => {
          const sectionItems = catalogItems.filter((item) => item.section_id === section.id);
          const isExpanded = expandedSection === section.id;

          return (
            <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-gray-50 flex items-center justify-between hover:bg-green-100 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{section.name}</h3>
                <span className="text-sm text-gray-600">{sectionItems.length} позиций</span>
              </button>

              {isExpanded && (
                <div className="divide-y">
                  <div className="p-6 bg-blue-50 border-b border-blue-200">
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                      <Plus className="w-4 h-4" />
                      Добавить позицию
                    </button>
                  </div>

                  {sectionItems.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Ед. измерения: <span className="font-medium">{item.unit}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded text-blue-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {item.variants.map((variant) => (
                          <div key={variant.name} className="bg-gray-50 p-3 rounded text-sm">
                            <div className="font-medium text-gray-900 mb-2">{variant.name}</div>
                            <div className="space-y-1 text-gray-600">
                              <div>Материалы: {variant.material_price} ₽</div>
                              <div>Работа: {variant.work_price} ₽</div>
                              <div>Доставка: {variant.delivery_price} ₽</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
