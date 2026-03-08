import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../store';

export const CalculationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { calculations } = useStore();

  const calculation = calculations.find((c) => c.id === id);

  if (!calculation) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate('/calculations')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к расчётам
        </button>
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">Расчёт не найден</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/calculations')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к расчётам
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{calculation.client_name}</h1>
            <div className="mt-4 space-y-2 text-gray-600">
              <p>Телефон: {calculation.client_phone}</p>
              <p>Email: {calculation.client_email}</p>
              <p>Адрес: {calculation.client_address}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600 mb-2">Цена для клиента</div>
            <div className="text-4xl font-bold text-green-600">
              {formatPrice(calculation.total_client_price)}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Себестоимость: {formatPrice(calculation.total_cost)}
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Параметры дома</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600">Площадь</div>
              <div className="text-lg font-semibold text-gray-900">{calculation.area} м²</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600">Этажи</div>
              <div className="text-lg font-semibold text-gray-900">{calculation.floors}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600">Фундамент</div>
              <div className="text-lg font-semibold text-gray-900">{calculation.foundation_type}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600">Пакет</div>
              <div className="text-lg font-semibold text-gray-900">
                {calculation.package === 'economy' ? 'Эконом' :
                 calculation.package === 'standard' ? 'Стандарт' : 'Комфорт'}
              </div>
            </div>
          </div>
        </div>

        {calculation.manager_comment && (
          <div className="border-t mt-8 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Комментарий менеджера</h2>
            <p className="text-gray-700">{calculation.manager_comment}</p>
          </div>
        )}

        <div className="border-t mt-8 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Позиции сметы</h2>
          {calculation.items.length === 0 ? (
            <p className="text-gray-600">Позиции не добавлены</p>
          ) : (
            <div className="bg-gray-50 rounded overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Наименование</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">Кол-во</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {calculation.items.filter(i => i.is_enabled).map((item) => {
                    const total = (item.material_price + item.work_price + item.delivery_price) * item.quantity;
                    return (
                      <tr key={item.id} className="border-b hover:bg-gray-100">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-600">{item.variant_name}</div>
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-900">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-semibold text-gray-900">
                          {formatPrice(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
