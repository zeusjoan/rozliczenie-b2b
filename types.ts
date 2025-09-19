
export enum OrderItemType {
  CONSULTATIONS = 'Konsultacje telefoniczne',
  OPEX = 'Prace podstawowe OPEX',
  CAPEX = 'Prace podstawowe CAPEX',
}

export enum OrderStatus {
  ACTIVE = 'aktywne',
  INACTIVE = 'nieaktywne',
  ARCHIVED = 'archiwalne',
}

export interface OrderItem {
  type: OrderItemType;
  hours: number;
  rate: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileContent: string; // base64 data URI
}

export interface Order {
  id: string;
  clientId: string;
  orderNumber: string;
  supplierNumber: string;
  documentDate: string;
  deliveryDate: string;
  contractNumber: string;
  orderingPerson: string;
  items: OrderItem[];
  status: OrderStatus;
  attachments?: Attachment[];
}

export interface Client {
  id: string;
  name: string;
  nip: string;
  phone: string;
  emails: string[];
}

export interface SettlementItem {
  id: string;
  orderId: string;
  itemType: OrderItemType;
  hours: number;
  rate: number;
}

export interface Settlement {
  id: string; // e.g., "2024-01"
  month: number; // 1-12
  year: number;
  date: string;
  items: SettlementItem[];
}

export interface MonthlyDocument {
  id: string; // year-month, e.g., "2024-07"
  year: number;
  month: number;
  pozPdf?: string; // base64 encoded
  invoicePdf?: string; // base64 encoded
}

export type Page = 'dashboard' | 'clients' | 'orders' | 'settlements';