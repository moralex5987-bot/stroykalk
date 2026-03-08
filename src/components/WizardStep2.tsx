import { PACKAGES } from '../constants';
import { WizardData } from '../types';

interface WizardStep2Props {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
}

export const WizardStep2 = ({ data, onChange }: WizardStep2Props) => {
  const totalPrice = data.area *
    PACKAGES.find(p => p.id === data.package)?.pricePerSqm || 0;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Выберите пакет отделки
        </h3>
        <p className="text-gray-600 mb-6">
          При выборе пакета будут установлены рекомендуемые варианты материалов и работ
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => {
            const isSelected = data.package === pkg.id;
            const price = data.area * pkg.pricePerSqm;

            return (
              <button
                key={pkg.id}
                onClick={() => onChange({ package: pkg.id })}
                className={`relative p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg ${
                  isSelected
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                {pkg.recommended && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-bl-lg text-xs font-semibold">
                    Рекомендуем
                  </div>
                )}

                <h4 className="text-lg font-bold text-gray-900 mb-2">{pkg.name}</h4>
                <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>

                <div className="border-t border-gray-200 pt-4">
                  <div className="text-2xl font-bold text-green-600">
                    {price.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {pkg.pricePerSqm.toLocaleString('ru-RU')} ₽/м²
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 p-2 bg-green-600 text-white rounded text-sm font-medium text-center">
                    ✓ Выбран
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Ориентировочная стоимость:</strong> {totalPrice.toLocaleString('ru-RU')} ₽
        </p>
        <p className="text-xs text-blue-700 mt-2">
          Финальная цена определится после выбора вариантов в конфигураторе
        </p>
      </div>
    </div>
  );
};
