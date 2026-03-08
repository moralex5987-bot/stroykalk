import { WizardData } from '../types';

interface WizardStep4Props {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
}

export const WizardStep4 = ({ data, onChange }: WizardStep4Props) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Имя клиента *
        </label>
        <input
          type="text"
          value={data.client_name}
          onChange={(e) => onChange({ client_name: e.target.value })}
          placeholder="ООО Примерная компания"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Телефон *
        </label>
        <input
          type="tel"
          value={data.client_phone}
          onChange={(e) => onChange({ client_phone: e.target.value })}
          placeholder="+7 (999) 123-45-67"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Email *
        </label>
        <input
          type="email"
          value={data.client_email}
          onChange={(e) => onChange({ client_email: e.target.value })}
          placeholder="client@example.ru"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Адрес объекта
        </label>
        <input
          type="text"
          value={data.client_address}
          onChange={(e) => onChange({ client_address: e.target.value })}
          placeholder="г. Москва, ул. Примерная, д. 1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Комментарий менеджера
        </label>
        <textarea
          value={data.manager_comment}
          onChange={(e) => onChange({ manager_comment: e.target.value })}
          placeholder="Особые пожелания, сроки, ограничения..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>
    </div>
  );
};
