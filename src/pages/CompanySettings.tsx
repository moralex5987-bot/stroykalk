import { useState } from 'react';
import { Save } from 'lucide-react';
import { useStore } from '../store';

export const CompanySettings = () => {
  const { companySettings, updateCompanySettings } = useStore();
  const [settings, setSettings] = useState(companySettings);

  const handleSave = () => {
    updateCompanySettings(settings);
    alert('Настройки сохранены');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Настройки компании</h1>
        <p className="text-gray-600 mt-2">Управление информацией о компании и расчётными коэффициентами</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">Информация компании</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Название компании</label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Телефон</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Адрес</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Реквизиты</label>
            <textarea
              value={settings.requisites}
              onChange={(e) => setSettings({ ...settings, requisites: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">Расчётные коэффициенты</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Накладные расходы (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.overhead_percent}
              onChange={(e) =>
                setSettings({ ...settings, overhead_percent: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-600 mt-1">Прибавляется к себестоимости для покрытия управленческих расходов</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Резерв (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.contingency_percent}
              onChange={(e) =>
                setSettings({ ...settings, contingency_percent: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-600 mt-1">Резерв на непредвиденные расходы</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Маржа компании (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.margin_percent}
              onChange={(e) =>
                setSettings({ ...settings, margin_percent: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-600 mt-1">Прибыль компании</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              УСН (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.usn_percent}
              onChange={(e) =>
                setSettings({ ...settings, usn_percent: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-600 mt-1">Налог упрощённой системы налогообложения</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-2">Формула расчёта:</p>
            <p>Цена = Себестоимость × (1 + Маржа) × (1 + УСН)</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          <Save className="w-5 h-5" />
          Сохранить изменения
        </button>
      </div>
    </div>
  );
};
