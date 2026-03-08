import { FOUNDATIONS, READINESS_OPTIONS } from '../constants';
import { WizardData } from '../types';

interface WizardStep1Props {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
}

export const WizardStep1 = ({ data, onChange }: WizardStep1Props) => {
  return (
    <div className="space-y-8">
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Площадь дома: {data.area} м²
        </label>
        <input
          type="range"
          min="100"
          max="600"
          value={data.area}
          onChange={(e) => onChange({ area: Number(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
        />
        <div className="flex gap-4 mt-4">
          <input
            type="number"
            min="100"
            max="600"
            value={data.area}
            onChange={(e) => onChange({ area: Number(e.target.value) })}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          <span className="text-gray-600">м²</span>
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">Этажность</label>
        <div className="flex gap-4">
          {[1, 2, 3].map((floor) => (
            <button
              key={floor}
              onClick={() => onChange({ floors: floor })}
              className={`px-6 py-3 rounded-lg border-2 font-semibold transition-all ${
                data.floors === floor
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {floor} этаж{floor > 1 ? 'а' : ''}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">Тип фундамента</label>
        <select
          value={data.foundation_type}
          onChange={(e) => onChange({ foundation_type: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
        >
          {FOUNDATIONS.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name} — {f.pricePerSqm.toLocaleString('ru-RU')} ₽/м²
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">Степень готовности</label>
        <div className="grid grid-cols-1 gap-3">
          {READINESS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ readiness: opt.value })}
              className={`px-4 py-3 rounded-lg border-2 text-left font-medium transition-all ${
                data.readiness === opt.value
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
