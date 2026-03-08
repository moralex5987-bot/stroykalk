import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { WizardStep1 } from '../components/WizardStep1';
import { WizardStep2 } from '../components/WizardStep2';
import { WizardStep3 } from '../components/WizardStep3';
import { WizardStep4 } from '../components/WizardStep4';
import { WizardStep5 } from '../components/WizardStep5';
import { CalculationItem } from '../types';
import { SECTIONS } from '../constants';
import { calcTotals, formatCurrency } from '../utils';

// ─── Custom Item Form state ────────────────────────────────────────────────────
interface CustomItemDraft {
  name: string;
  section_id: string;
  unit: string;
  quantity: number;
  material_price: number;
  work_price: number;
  delivery_price: number;
}

const emptyDraft = (): CustomItemDraft => ({
  name: '',
  section_id: SECTIONS[0]?.id ?? 'foundation',
  unit: 'м²',
  quantity: 1,
  material_price: 0,
  work_price: 0,
  delivery_price: 0,
});

// ─── Component ────────────────────────────────────────────────────────────────
export const CalculatorWizard = () => {
  const navigate = useNavigate();
  const {
    wizardData,
    updateWizardData,
    saveCalculation,
    resetWizard,
    catalogItems,
    companySettings,
    currentUser,
  } = useStore();

  // Custom positions modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDraft, setCustomDraft] = useState<CustomItemDraft>(emptyDraft());
  const [customError, setCustomError] = useState('');

  // ── Navigation ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (wizardData.step < 5) updateWizardData({ step: wizardData.step + 1 });
  };
  const handlePrev = () => {
    if (wizardData.step > 1) updateWizardData({ step: wizardData.step - 1 });
  };

  // ── Save with correct totals ─────────────────────────────────────────────────
  const handleSave = () => {
    const { total_cost, total_client_price } = calcTotals(wizardData.items, companySettings);

    const newCalc = {
      id: Date.now().toString(),
      user_id: currentUser?.id ?? '',
      client_name: wizardData.client_name,
      client_phone: wizardData.client_phone,
      client_email: wizardData.client_email,
      client_address: wizardData.client_address,
      manager_comment: wizardData.manager_comment,
      area: wizardData.area,
      floors: wizardData.floors,
      foundation_type: wizardData.foundation_type,
      readiness: wizardData.readiness,
      package: wizardData.package,
      items: wizardData.items,
      total_cost,
      total_client_price,
      status: 'draft',
      public_token: Math.random().toString(36).substring(7),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveCalculation(newCalc);
    resetWizard();
    navigate('/calculations');
  };

  // ── Custom Items ─────────────────────────────────────────────────────────────
  const openCustomModal = () => {
    setCustomDraft(emptyDraft());
    setCustomError('');
    setShowCustomModal(true);
  };

  const addCustomItem = () => {
    if (!customDraft.name.trim()) {
      setCustomError('Укажите наименование позиции');
      return;
    }
    if (customDraft.quantity <= 0) {
      setCustomError('Количество должно быть больше нуля');
      return;
    }
    const newItem: CalculationItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      catalog_item_id: '',
      section_id: customDraft.section_id,
      name: customDraft.name.trim(),
      unit: customDraft.unit.trim() || 'шт',
      quantity: customDraft.quantity,
      variant_name: 'Пользовательская',
      material_price: customDraft.material_price,
      work_price: customDraft.work_price,
      delivery_price: customDraft.delivery_price,
      is_enabled: true,
      is_custom: true,
      is_modified: false,
      sort_order: 9999,
    };
    updateWizardData({ items: [...wizardData.items, newItem] });
    setShowCustomModal(false);
  };

  const removeCustomItem = (id: string) => {
    updateWizardData({ items: wizardData.items.filter((i) => i.id !== id) });
  };

  // ── Totals for sticky footer ─────────────────────────────────────────────────
  const { total_cost, total_client_price } = calcTotals(wizardData.items, companySettings);
  const enabledCount = wizardData.items.filter((i) => i.is_enabled).length;

  // ── Custom items list (for display in step 3) ─────────────────────────────────
  const customItems = wizardData.items.filter((i) => i.is_custom);

  // ── Steps meta ───────────────────────────────────────────────────────────────
  const steps = [
    { number: 1, title: 'Параметры дома',  description: 'Площадь, этажность, фундамент' },
    { number: 2, title: 'Пакет отделки',   description: 'Выберите уровень комплектации' },
    { number: 3, title: 'Конфигуратор',    description: 'Выберите варианты материалов' },
    { number: 4, title: 'Данные клиента',  description: 'Контактная информация' },
    { number: 5, title: 'Предпросмотр',    description: 'Итоговая смета' },
  ];

  return (
    <>
      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Новый расчёт стоимости</h1>
            <p className="text-gray-600 mt-2">
              Пошаговый калькулятор для создания коммерческого предложения
            </p>
          </div>

          {/* Step tabs */}
          <div className="flex gap-2 mb-12 overflow-x-auto pb-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`min-w-max px-4 py-3 rounded-lg transition-colors ${
                  wizardData.step === step.number
                    ? 'bg-green-600 text-white'
                    : wizardData.step > step.number
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <div className="font-semibold">
                  {step.number}. {step.title}
                </div>
                <div className="text-xs opacity-80">{step.description}</div>
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="bg-white rounded-lg shadow-lg p-8 min-h-96">
            {wizardData.step === 1 && (
              <WizardStep1 data={wizardData} onChange={updateWizardData} />
            )}
            {wizardData.step === 2 && (
              <WizardStep2 data={wizardData} onChange={updateWizardData} />
            )}
            {wizardData.step === 3 && (
              <>
                <WizardStep3
                  data={wizardData}
                  catalogItems={catalogItems}
                  onChange={updateWizardData}
                />

                {/* ── Custom Positions Panel ───────────────────────────────── */}
                <div className="mt-8 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Дополнительные позиции
                      </h3>
                      <p className="text-sm text-gray-500">
                        Добавьте нестандартные работы или материалы, которых нет в каталоге
                      </p>
                    </div>
                    <button
                      onClick={openCustomModal}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить позицию
                    </button>
                  </div>

                  {customItems.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500 text-sm border border-dashed border-gray-300">
                      Нет пользовательских позиций. Нажмите «Добавить позицию» чтобы добавить.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Наименование</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Раздел</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700">Кол-во</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700">Материалы ₽</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700">Работы ₽</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700">Доставка ₽</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Удалить</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {customItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-3 py-2 text-gray-600">
                                {SECTIONS.find((s) => s.id === item.section_id)?.name ?? item.section_id}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-900">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-900">
                                {item.material_price.toLocaleString('ru-RU')}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-900">
                                {item.work_price.toLocaleString('ru-RU')}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-900">
                                {item.delivery_price.toLocaleString('ru-RU')}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  onClick={() => removeCustomItem(item.id)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
            {wizardData.step === 4 && (
              <WizardStep4 data={wizardData} onChange={updateWizardData} />
            )}
            {wizardData.step === 5 && (
              <WizardStep5
                data={wizardData}
                companySettings={companySettings}
                onSave={handleSave}
                onDownloadPDF={() => alert('PDF доступен в разделе «Все расчёты»')}
              />
            )}
          </div>

          {/* Bottom navigation */}
          <div className="flex justify-between gap-4 mt-8">
            <button
              onClick={handlePrev}
              disabled={wizardData.step === 1}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <ChevronLeft className="w-5 h-5" />
              Назад
            </button>

            <button
              onClick={() => { resetWizard(); navigate('/calculations'); }}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
            >
              Отмена
            </button>

            {wizardData.step < 5 && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Далее
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── STICKY FOOTER ───────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-green-600 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">{enabledCount}</span> позиций включено
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {/* Cost breakdown chips */}
            <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
              <span>
                Накл.{' '}
                <span className="font-medium text-gray-700">
                  {companySettings.overhead_percent}%
                </span>
              </span>
              <span>
                Резерв{' '}
                <span className="font-medium text-gray-700">
                  {companySettings.contingency_percent}%
                </span>
              </span>
              <span>
                УСН{' '}
                <span className="font-medium text-gray-700">
                  {companySettings.usn_percent}%
                </span>
              </span>
              <span>
                Маржа{' '}
                <span className="font-medium text-gray-700">
                  {companySettings.margin_percent}%
                </span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-500">Себестоимость: </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(total_cost)}
                </span>
              </div>
              <div className="text-sm font-bold">
                <span className="text-gray-500">Цена клиента: </span>
                <span className="text-xl font-extrabold text-green-600">
                  {formatCurrency(total_client_price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CUSTOM ITEM MODAL ────────────────────────────────────────────────────── */}
      {showCustomModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Добавить позицию</h2>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Наименование <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customDraft.name}
                  onChange={(e) => setCustomDraft({ ...customDraft, name: e.target.value })}
                  placeholder="Например: Демонтаж старого покрытия"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Section + Unit row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Раздел</label>
                  <select
                    value={customDraft.section_id}
                    onChange={(e) => setCustomDraft({ ...customDraft, section_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {SECTIONS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Единица</label>
                  <input
                    type="text"
                    value={customDraft.unit}
                    onChange={(e) => setCustomDraft({ ...customDraft, unit: e.target.value })}
                    placeholder="м², шт, пог.м"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Количество</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={customDraft.quantity}
                  onChange={(e) => setCustomDraft({ ...customDraft, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Prices row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Материалы, ₽/ед.
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customDraft.material_price}
                    onChange={(e) =>
                      setCustomDraft({ ...customDraft, material_price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Работы, ₽/ед.
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customDraft.work_price}
                    onChange={(e) =>
                      setCustomDraft({ ...customDraft, work_price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Доставка, ₽/ед.
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customDraft.delivery_price}
                    onChange={(e) =>
                      setCustomDraft({ ...customDraft, delivery_price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Live total preview */}
              <div className="bg-green-50 rounded-lg px-4 py-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>База (без надбавок):</span>
                  <span className="font-medium">
                    {formatCurrency(
                      (customDraft.material_price + customDraft.work_price + customDraft.delivery_price)
                      * customDraft.quantity,
                    )}
                  </span>
                </div>
              </div>

              {customError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{customError}</p>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowCustomModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
              >
                Отмена
              </button>
              <button
                onClick={addCustomItem}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
