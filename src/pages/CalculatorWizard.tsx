import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { WizardStep1 } from '../components/WizardStep1';
import { WizardStep2 } from '../components/WizardStep2';
import { WizardStep3 } from '../components/WizardStep3';
import { WizardStep4 } from '../components/WizardStep4';
import { WizardStep5 } from '../components/WizardStep5';

export const CalculatorWizard = () => {
  const navigate = useNavigate();
  const { wizardData, updateWizardData, saveCalculation, resetWizard, catalogItems, companySettings, currentUser } = useStore();

  const handleNext = () => {
    if (wizardData.step < 5) {
      updateWizardData({ step: wizardData.step + 1 });
    }
  };

  const handlePrev = () => {
    if (wizardData.step > 1) {
      updateWizardData({ step: wizardData.step - 1 });
    }
  };

  const handleSave = () => {
    const newCalc = {
      id: Date.now().toString(),
      user_id: currentUser?.id || '',
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
      total_cost: 0,
      total_client_price: 0,
      status: 'draft',
      public_token: Math.random().toString(36).substring(7),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveCalculation(newCalc);
    resetWizard();
    navigate('/calculations');
  };

  const handleDownloadPDF = () => {
    alert('Функция скачивания PDF будет реализована');
  };

  const steps = [
    { number: 1, title: 'Параметры дома', description: 'Площадь, этажность, фундамент' },
    { number: 2, title: 'Пакет отделки', description: 'Выберите уровень комплектации' },
    { number: 3, title: 'Конфигуратор', description: 'Выберите варианты материалов' },
    { number: 4, title: 'Данные клиента', description: 'Контактная информация' },
    { number: 5, title: 'Предпросмотр', description: 'Итоговая смета' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Новый расчёт стоимости</h1>
          <p className="text-gray-600 mt-2">Пошаговый калькулятор для создания коммерческого предложения</p>
        </div>

        <div className="flex gap-2 mb-12 overflow-x-auto pb-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`min-w-max px-4 py-3 rounded-lg ${
                wizardData.step === step.number
                  ? 'bg-green-600 text-white'
                  : wizardData.step > step.number
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <div className="font-semibold">{step.number}. {step.title}</div>
              <div className="text-xs opacity-80">{step.description}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 min-h-96">
          {wizardData.step === 1 && (
            <WizardStep1 data={wizardData} onChange={updateWizardData} />
          )}
          {wizardData.step === 2 && (
            <WizardStep2 data={wizardData} onChange={updateWizardData} />
          )}
          {wizardData.step === 3 && (
            <WizardStep3 data={wizardData} catalogItems={catalogItems} onChange={updateWizardData} />
          )}
          {wizardData.step === 4 && (
            <WizardStep4 data={wizardData} onChange={updateWizardData} />
          )}
          {wizardData.step === 5 && (
            <WizardStep5
              data={wizardData}
              companySettings={companySettings}
              onSave={handleSave}
              onDownloadPDF={handleDownloadPDF}
            />
          )}
        </div>

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
            onClick={() => {
              resetWizard();
              navigate('/calculations');
            }}
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
  );
};
