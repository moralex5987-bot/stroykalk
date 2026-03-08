import { useNavigate } from 'react-router-dom';
import { Trash2, Eye } from 'lucide-react';
import { useStore } from '../store';

export const CalculationsList = () => {
  const navigate = useNavigate();
  const { calculations, deleteCalculation } = useStore();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Все расчёты</h1>
        <p className="text-gray-600 mt-2">Управление смётами и коммерческими предложениями</p>
      </div>

      {calculations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">Расчётов пока нет</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Клиент</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Площадь</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Пакет</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Сумма</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Дата</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {calculations.map((calc) => (
                <tr key={calc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{calc.client_name}</div>
                    <div className="text-gray-600 text-xs">{calc.client_phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{calc.area} м²</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {calc.package === 'economy' && 'Эконом'}
                      {calc.package === 'standard' && 'Стандарт'}
                      {calc.package === 'comfort' && 'Комфорт'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    {formatPrice(calc.total_client_price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(calc.created_at)}</td>
                  <td className="px-6 py-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigate(`/calculations/${calc.id}`)}
                      className="p-2 hover:bg-gray-100 rounded text-blue-600"
                      title="Просмотр"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCalculation(calc.id)}
                      className="p-2 hover:bg-gray-100 rounded text-red-600"
                      title="Удалить"
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
  );
};
