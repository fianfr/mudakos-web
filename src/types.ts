export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'boarding_house' | 'micro_apartment' | 'villa';
}

export interface Room {
  id: string;
  propertyId: string; // foreign key to Property.id
  number: string;
  floor: number;
  type: 'standard' | 'deluxe' | 'suite';
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  tenantId: string | null;
  facilities: string[];
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomId: string;
  rentStart: string;
  rentUntil: string;
}

export type TransactionType = 'income' | 'expense' | 'wage';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description: string;
  propertyId?: string; // e.g. propertyId linked to this transaction
  referenceId?: string; // e.g. tenantId or roomId
}

export interface WageConfig {
  baseSalary: number;
  bonusPerRoom: number;
}

export interface Complaint {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'solved';
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  tenantName: string;
  roomNumber: string;
  amount: number;
  date: string;
  paymentMethod: 'bank_transfer' | 'cash' | 'e_wallet';
  rentPeriodStart: string;
  rentPeriodEnd: string;
  notes?: string;
  adminName: string;
}

export interface TrialState {
  startDate: string;
  daysRemaining: number;
  isActive: boolean;
}
