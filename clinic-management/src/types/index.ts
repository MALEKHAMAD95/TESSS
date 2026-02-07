// ═══════════════════════════════════════════════════════════════
// أنواع البيانات - Data Types
// ═══════════════════════════════════════════════════════════════

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId?: string;
  status: 'active' | 'inactive';
  employeesCount: number;
  sales: number;
  performance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  role: 'ADMIN' | 'SALES' | 'DOCTOR' | 'RECEPTIONIST';
  branchId?: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  phone: string;
  email?: string;
  branchId?: string;
  status: 'active' | 'inactive';
  notes?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  address?: string;
  medicalNotes?: string;
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  type: 'product' | 'service';
  price: number;
  cost?: number;
  quantity: number;
  description?: string;
  status: 'active' | 'inactive';
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  validityDays?: number;
  services: { productId: string; quantity: number }[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  branchId: string;
  date: string;
  time: string;
  type?: 'new' | 'followup' | 'consultation' | 'emergency';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  branchId: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'wallet';
  date: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Settings {
  organizationName: string;
  logoUrl?: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  invoicePrefix: string;
  receiptPrefix: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  role: 'ADMIN' | 'SALES' | 'DOCTOR' | 'RECEPTIONIST';
  branchId?: string;
  avatarUrl?: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  totalProducts: number;
  monthlyRevenue: number;
}
