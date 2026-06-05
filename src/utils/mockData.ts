import { Property, Room, Tenant, Transaction, Complaint, PaymentReceipt, WageConfig } from '../types';

export const INITIAL_PROPERTIES: Property[] = [
  { id: 'p1', name: 'MudaKost Senayan', address: 'Kemanggisan No. 24, Palmerah, Jakarta Barat', type: 'boarding_house' },
  { id: 'p2', name: 'MudaKost Kemang', address: 'Lt. Agung No. 12, Mampang, Jakarta Selatan', type: 'micro_apartment' }
];

export const INITIAL_ROOMS: Room[] = [
  { id: 'r101', propertyId: 'p1', number: '101', floor: 1, type: 'standard', price: 1500000, status: 'occupied', tenantId: 't1', facilities: ['Single Bed', 'AC', 'Shared Bathroom', 'WiFi', 'Desk'] },
  { id: 'r102', propertyId: 'p1', number: '102', floor: 1, type: 'standard', price: 1500000, status: 'occupied', tenantId: 't2', facilities: ['Single Bed', 'AC', 'Shared Bathroom', 'WiFi', 'Desk'] },
  { id: 'r103', propertyId: 'p1', number: '103', floor: 1, type: 'deluxe', price: 2200000, status: 'occupied', tenantId: 't3', facilities: ['Queen Bed', 'AC', 'Private Bathroom', 'WiFi', 'Desk', 'Hot Water'] },
  { id: 'r104', propertyId: 'p1', number: '104', floor: 1, type: 'deluxe', price: 2200000, status: 'available', tenantId: null, facilities: ['Queen Bed', 'AC', 'Private Bathroom', 'WiFi', 'Desk', 'Hot Water'] },
  { id: 'r201', propertyId: 'p2', number: '201', floor: 2, type: 'standard', price: 1600000, status: 'occupied', tenantId: 't4', facilities: ['Single Bed', 'AC', 'Shared Bathroom', 'WiFi', 'Desk', 'Balcony'] },
  { id: 'r202', propertyId: 'p2', number: '202', floor: 2, type: 'deluxe', price: 2300000, status: 'maintenance', tenantId: null, facilities: ['Queen Bed', 'AC', 'Private Bathroom', 'WiFi', 'Desk', 'Hot Water', 'Balcony'] },
  { id: 'r203', propertyId: 'p2', number: '203', floor: 2, type: 'suite', price: 3200000, status: 'occupied', tenantId: 't5', facilities: ['King Bed', 'AC', 'Private Bathroom', 'WiFi', 'Tv', 'Smart Fridge', 'Bathtub', 'Balcony'] },
  { id: 'r204', propertyId: 'p2', number: '204', floor: 2, type: 'suite', price: 3200000, status: 'available', tenantId: null, facilities: ['King Bed', 'AC', 'Private Bathroom', 'WiFi', 'Tv', 'Smart Fridge', 'Bathtub', 'Balcony'] },
];

export const INITIAL_TENANTS: Tenant[] = [
  { id: 't1', name: 'Andi Pratama', phone: '+6281234567890', email: 'andi.pratama@gmail.com', roomId: 'r101', rentStart: '2026-01-10', rentUntil: '2026-06-10' }, // Rent almost due
  { id: 't2', name: 'Siti Rahma', phone: '+6287877665544', email: 'siti.rahma@yahoo.com', roomId: 'r102', rentStart: '2026-02-15', rentUntil: '2026-06-15' },
  { id: 't3', name: 'Budi Santoso', phone: '+6281122334455', email: 'budi.s@outlook.com', roomId: 'r103', rentStart: '2025-11-01', rentUntil: '2026-06-01' }, // Overdue
  { id: 't4', name: 'Clara Michelle', phone: '+6281909887766', email: 'clara.mich@gmail.com', roomId: 'r201', rentStart: '2026-04-05', rentUntil: '2026-07-05' },
  { id: 't5', name: 'Devon Wijaya', phone: '+6285211223399', email: 'devon.wijaya@gmail.com', roomId: 'r203', rentStart: '2026-03-20', rentUntil: '2026-06-20' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Income
  { id: 'tx1', type: 'income', category: 'Room Rent', amount: 1500000, date: '2026-05-10', description: 'Andi Room 101 Rent', propertyId: 'p1' },
  { id: 'tx2', type: 'income', category: 'Room Rent', amount: 1500000, date: '2026-05-15', description: 'Siti Room 102 Rent', propertyId: 'p1' },
  { id: 'tx3', type: 'income', category: 'Room Rent', amount: 2200000, date: '2026-05-01', description: 'Budi Room 103 Rent', propertyId: 'p1' },
  { id: 'tx4', type: 'income', category: 'Room Rent', amount: 1600000, date: '2026-05-05', description: 'Clara Room 201 Rent', propertyId: 'p2' },
  { id: 'tx5', type: 'income', category: 'Room Rent', amount: 3200000, date: '2026-05-20', description: 'Devon Room 203 Rent', propertyId: 'p2' },
  { id: 'tx6', type: 'income', category: 'Other Income', amount: 250000, date: '2026-05-22', description: 'Laundry service partnerships share', propertyId: 'p1' },
  
  // Expenses
  { id: 'tx7', type: 'expense', category: 'Utilities', amount: 1450000, date: '2026-05-25', description: 'PLN Token & WiFi Monthly Subscription', propertyId: 'p1' },
  { id: 'tx8', type: 'expense', category: 'Repairs', amount: 350000, date: '2026-05-18', description: 'Plumbing leak fix Room 202', propertyId: 'p2' },
  { id: 'tx9', type: 'expense', category: 'Marketing', amount: 200000, date: '2026-05-03', description: 'Mamikos Premium ads booster package', propertyId: 'p1' },

  // Admin Wages
  { id: 'tx10', type: 'wage', category: 'Admin Wage', amount: 2000000, date: '2026-05-28', description: 'Monthly wage for administrator (Rini)' },
];

export const INITIAL_WAGE_CONFIG: WageConfig = {
  baseSalary: 1500000,
  bonusPerRoom: 100000, // IDR 100,000 extra per occupied room
};

export const INITIAL_COMPLAINTS: Complaint[] = [
  { id: 'c1', tenantId: 't3', tenantName: 'Budi Santoso', roomNumber: '103', title: 'AC leaking water', description: 'The air conditioner in Room 103 is leaking and dripping water on the bedside table.', status: 'pending', date: '2026-06-02', priority: 'high' },
  { id: 'c2', tenantId: 't5', tenantName: 'Devon Wijaya', roomNumber: '203', title: 'WiFi slow during evening', description: 'The peak evening WiFi connection speeds drop significantly, lagging during zoom calls.', status: 'in_progress', date: '2026-06-01', priority: 'medium' },
  { id: 'c3', tenantId: 't1', tenantName: 'Andi Pratama', roomNumber: '101', title: 'Bathroom knob loose', description: 'The door knob inside the bathroom is unstable and frequently gets stuck.', status: 'solved', date: '2026-05-28', priority: 'low' },
];

export const INITIAL_RECEIPTS: PaymentReceipt[] = [
  {
    id: 'rc1',
    receiptNumber: 'MK-REC-2026-05-001',
    tenantName: 'Devon Wijaya',
    roomNumber: '203',
    amount: 3200000,
    date: '2026-05-20',
    paymentMethod: 'bank_transfer',
    rentPeriodStart: '2026-05-20',
    rentPeriodEnd: '2026-06-20',
    notes: 'Paid in full via Bank Mandiri',
    adminName: 'Rini (Admin)'
  }
];

// Utility functions to fetch and persist data safely using localStorage
export const getLocalStorageData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(`mudakost_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading Key mudakost_${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const setLocalStorageData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`mudakost_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing Key mudakost_${key} to localStorage:`, error);
  }
};
