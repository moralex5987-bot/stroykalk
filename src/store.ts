import { create } from 'zustand';
import { User, Calculation, WizardData, CompanySettings, CatalogItem } from './types';
import { DEFAULT_COMPANY_SETTINGS, CATALOG_ITEMS } from './constants';
import { supabase } from './supabaseClient';

interface AppState {
  currentUser: User | null;
  authLoading: boolean;
  authError: string | null;
  companySettings: CompanySettings;
  calculations: Calculation[];
  catalogItems: CatalogItem[];
  wizardData: WizardData;

  // Auth
  initAuth: () => () => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Wizard
  updateWizardData: (data: Partial<WizardData>) => void;
  resetWizard: () => void;

  // Calculations
  saveCalculation: (calculation: Calculation) => void;
  deleteCalculation: (id: string) => void;
  updateCalculation: (id: string, calculation: Calculation) => void;

  // Settings & Catalog
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

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Failed to fetch profile:', error?.message);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    created_at: data.created_at,
  };
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  authLoading: true,
  authError: null,
  companySettings: DEFAULT_COMPANY_SETTINGS,
  calculations: [],
  catalogItems: CATALOG_ITEMS,
  wizardData: defaultWizardData,

  initAuth: () => {
    set({ authLoading: true });

    // Check existing session on init
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ currentUser: profile, authLoading: false });
      } else {
        set({ currentUser: null, authLoading: false });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          set({ currentUser: profile, authLoading: false });
        } else if (event === 'SIGNED_OUT') {
          set({ currentUser: null, authLoading: false });
        }
      }
    );

    // Return unsubscribe function for cleanup
    return () => {
      subscription.unsubscribe();
    };
  },

  login: async (email: string, password: string) => {
    set({ authLoading: true, authError: null });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ authLoading: false, authError: error.message });
      return false;
    }

    // Profile will be loaded by onAuthStateChange listener
    return true;
  },

  logout: async () => {
    set({ authLoading: true, authError: null });
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      set({ authError: error.message });
    }
    set({ authLoading: false });
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
