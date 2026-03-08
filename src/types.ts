export type UserRole = 'admin' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface CompanySettings {
  company_name: string;
  logo_url: string;
  phone: string;
  email: string;
  address: string;
  requisites: string;
  overhead_percent: number;
  contingency_percent: number;
  margin_percent: number;
  usn_percent: number;
}

export interface Section {
  id: string;
  name: string;
  sort_order: number;
}

export interface CatalogItemVariant {
  name: string;
  material_price: number;
  work_price: number;
  delivery_price: number;
}

export interface CatalogItem {
  id: string;
  section_id: string;
  name: string;
  unit: string;
  base_qty_formula: string;
  variants: CatalogItemVariant[];
  is_required: boolean;
  economy_default: string;
  standard_default: string;
  comfort_default: string;
  sort_order: number;
}

export interface CalculationItem {
  id: string;
  catalog_item_id: string;
  section_id: string;
  name: string;
  unit: string;
  quantity: number;
  variant_name: string;
  material_price: number;
  work_price: number;
  delivery_price: number;
  is_enabled: boolean;
  is_custom: boolean;
  is_modified: boolean;
  sort_order: number;
}

export interface Calculation {
  id: string;
  user_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  client_address: string;
  manager_comment: string;
  area: number;
  floors: number;
  foundation_type: string;
  readiness: string;
  package: string;
  items: CalculationItem[];
  total_cost: number;
  total_client_price: number;
  status: string;
  public_token: string;
  created_at: string;
  updated_at: string;
}

export interface WizardData {
  step: number;
  area: number;
  floors: number;
  foundation_type: string;
  readiness: string;
  package: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  client_address: string;
  manager_comment: string;
  items: CalculationItem[];
}
