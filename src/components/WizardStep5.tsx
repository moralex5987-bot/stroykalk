import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Download, Share2, Save } from 'lucide-react';
import { WizardData, CalculationItem } from '../types';
import { SECTIONS } from '../constants';

interface WizardStep5Props {
  data: WizardData;
  companySettings: any;
  onSave: () => void;
  onDownloadPDF: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
};

const calculateItemTotal = (item: CalculationItem, overhead: number, contingency: number) => {
  const base = (item.material_price + item.work_price + item.delivery_price) * item.quantity;
  const withOverhead = base * (1 + overhead / 100);
  const withContingency = withOverhead * (1 + contingency / 100);
  return withContingency;
};

export const WizardStep5 = ({
  data,
  companySettings,
  onSave,
  onDownloadPDF,
}: WizardStep5Props) => {
  const { totalCost, totalClientPrice, breakdown } = useMemo(() => {
    let materialsCost = 0;
    let workCost = 0;
    let deliveryCost = 0;

    const enabledItems = data.items.filter((i) => i.is_enabled);

    enabledItems.forEach((item) => {
      const qty = item.quantity;
      materialsCost += item.material_price * qty;
      workCost += item.work_price * qty;
      deliveryCost += item.delivery_price * qty;
    });

    const baseCost = materialsCost + workCost + deliveryCost;
    const withOverhead = baseCost * (1 + companySettings.overhead_percent / 100);
    const withContingency = withOverhead * (1 + companySettings.contingency_percent / 100);
    const withMargin = withContingency * (1 + companySettings.margin_percent / 100);
    const finalPrice = withMargin * (1 + companySettings.usn_percent / 100);

    return {
      totalCost: withMargin,
      totalClientPrice: finalPrice,
      breakdown: [
        { name: 'Материалы', value: materialsCost, color: '#10b981' },
        { name: 'Работа', value: workCost, color: '#3b82f6' },
        { name: 'Доставка', value: deliveryCost, color: '#f59e0b' },
      ],
    };
  }, [data.items, companySettings]);

  const sectionTotals = SECTIONS.map((section) => {
    const sectionItems = data.items.filter(
      (item) => item.is_enabled && item.section_id === section.id
    );
    const total = sectionItems.reduce(
      (sum, item) =>
        sum +
        calculateItemTotal(
          item,
          companySettings.overhead_percent,
          companySettings.contingency_percent
        ),
      0
    );
    return { section, total };
  }).filter((s) => s.total > 0);

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Структура стоимости</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatPrice(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Данные клиента</div>
              <div className="font-semibold text-gray-900 text-lg">{data.client_name}</div>
              <div className="text-sm text-gray-600">{data.client_phone}</div>
              <div className="text-sm text-gray-600">{data.client_email}</div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-600">Параметры дома</div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>Площадь: {data.area} м²</div>
                <div>Этажей: {data.floors}</div>
                <div>Фундамент: {data.foundation_type}</div>
                <div>Пакет: {
                  data.package === 'economy' ? 'Эконом' :
                  data.package === 'standard' ? 'Стандарт' : 'Комфорт'
                }</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Разбивка по этапам</h3>
          <div className="space-y-2">
            {sectionTotals.map(({ section, total }) => (
              <div key={section.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{section.name}</span>
                <span className="font-medium text-gray-900">{formatPrice(total)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t mt-8 pt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">Себестоимость</div>
              <div className="text-3xl font-bold text-gray-900">{formatPrice(totalCost)}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">Цена для клиента</div>
              <div className="text-3xl font-bold text-green-600">{formatPrice(totalClientPrice)}</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-600">
            <p>Маржа: {companySettings.margin_percent}% | УСН: {companySettings.usn_percent}%</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={onDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          <Download className="w-5 h-5" />
          Скачать PDF
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          <Save className="w-5 h-5" />
          Сохранить расчёт
        </button>
        <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold">
          <Share2 className="w-5 h-5" />
          Скопировать ссылку
        </button>
      </div>
    </div>
  );
};
