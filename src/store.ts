import { create } from 'zustand';
import { User, Calculation, WizardData, CompanySettings, CatalogItem } from './types';
import { DEFAULT_USERS, DEFAULT_COMPANY_SETTINGS, CATALOG_ITEMS, SECTIONS } from './constants';

interface AppState {
  currentUser: User | null;
  companySettings: CompanySettings;
  calculations: Calculation[];
  catalogItems: CatalogItem[];
  wizardData: WizardData;

  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateWizardData: (data: Partial<WizardData>) => void;
  saveCalculation: (calculation: Calculation) => void;
  deleteCalculation: (id: string) => void;
  updateCalculation: (id: string, calculation: Calculation) => void;
  resetWizard: () => void;
  updateCompanySettings: (settings: CompanySettings) => void;
  updateCatalogItems: (items: CatalogItem[]) => void;
}

const defaultWizardData: WizardData = {
  step: 1,
  area: 200,
  floors: 1,
  foundation_type: 'Ленточный',
  readiness: 'turnkey',
  package: 'standard',
  client_name: '',
  client_phone: '',
  client_email: '',
  client_address: '',
  manager_comment: '',
  items: [],
};

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  companySettings: DEFAULT_COMPANY_SETTINGS,
  calculations: [
    {
      id: '1',
      user_id: '2',
      client_name: 'ООО "Примерная компания"',
      client_phone: '+7 (999) 111-22-33',
      client_email: 'client@example.ru',
      client_address: 'г. Москва, ул. Тестовая, д. 5',
      manager_comment: 'VIP клиент, срочно',
      area: 250,
      floors: 2,
      foundation_type: 'Ленточный',
      readiness: 'turnkey',
      package: 'standard',
      items: [],
      total_cost: 7500000,
      total_client_price: 9187500,
      status: 'draft',
      public_token: 'abc123def456',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  catalogItems: CATALOG_ITEMS,
  wizardData: defaultWizardData,

  login: (email: string, password: string) => {
    const user = DEFAULT_USERS.find((u) => u.email === email && u.password === password);
    if (user) {
      set({ currentUser: user as User });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentUser: null });
  },

  updateWizardData: (data: Partial<WizardData>) => {
    set((state) => ({
      wizardData: { ...state.wizardData, ...data },
    }));
  },

  saveCalculation: (calculation: Calculation) => {
    set((state) => ({
      calculations: [...state.calculations, calculation],
      wizardData: defaultWizardData,
    }));
  },

  deleteCalculation: (id: string) => {
    set((state) => ({
      calculations: state.calculations.filter((c) => c.id !== id),
    }));
  },

  updateCalculation: (id: string, calculation: Calculation) => {
    set((state) => ({
      calculations: state.calculations.map((c) => (c.id === id ? calculation : c)),
    }));
  },

  resetWizard: () => {
    set({ wizardData: defaultWizardData });
  },

  updateCompanySettings: (settings: CompanySettings) => {
    set({ companySettings: settings });
  },

  updateCatalogItems: (items: CatalogItem[]) => {
    set({ catalogItems: items });
  },
}));
