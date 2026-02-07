// ═══════════════════════════════════════════════════════════════
// البيانات الافتراضية - Initial Data
// ═══════════════════════════════════════════════════════════════

import { Branch, Employee, Doctor, Patient, Product, Package, Appointment, Invoice, Receipt, Settings } from '../types';

export const initialBranches: Branch[] = [
  {
    id: '1',
    name: 'الفرع الرئيسي',
    address: 'شارع الملك فهد، الرياض',
    phone: '0512345678',
    status: 'active',
    employeesCount: 5,
    sales: 25000,
    performance: 85,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'فرع جدة',
    address: 'شارع التحلية، جدة',
    phone: '0523456789',
    status: 'active',
    employeesCount: 3,
    sales: 18000,
    performance: 75,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  }
];

export const initialEmployees: Employee[] = [
  {
    id: '1',
    fullName: 'أحمد محمد',
    username: 'admin',
    email: 'admin@clinic.com',
    phone: '0501234567',
    role: 'ADMIN',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: '2',
    fullName: 'سارة علي',
    username: 'sara',
    email: 'sara@clinic.com',
    phone: '0502345678',
    role: 'SALES',
    branchId: '1',
    status: 'active',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  }
];

export const initialDoctors: Doctor[] = [
  {
    id: '1',
    fullName: 'د. محمد العلي',
    specialization: 'طب عام',
    phone: '0511234567',
    email: 'dr.mohammed@clinic.com',
    branchId: '1',
    status: 'active',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z'
  },
  {
    id: '2',
    fullName: 'د. نورة السالم',
    specialization: 'طب أسنان',
    phone: '0512345678',
    email: 'dr.noura@clinic.com',
    branchId: '1',
    status: 'active',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: '3',
    fullName: 'د. خالد الأحمد',
    specialization: 'جلدية',
    phone: '0513456789',
    branchId: '2',
    status: 'active',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  }
];

export const initialPatients: Patient[] = [
  {
    id: '1',
    fullName: 'عبدالله محمد',
    phone: '0551234567',
    email: 'abdullah@email.com',
    birthDate: '1990-05-15',
    gender: 'male',
    address: 'الرياض، حي النزهة',
    branchId: '1',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z'
  },
  {
    id: '2',
    fullName: 'فاطمة أحمد',
    phone: '0552345678',
    email: 'fatima@email.com',
    birthDate: '1985-08-20',
    gender: 'female',
    address: 'الرياض، حي العليا',
    branchId: '1',
    createdAt: '2026-02-02T00:00:00Z',
    updatedAt: '2026-02-02T00:00:00Z'
  },
  {
    id: '3',
    fullName: 'محمد عبدالرحمن',
    phone: '0553456789',
    gender: 'male',
    branchId: '2',
    createdAt: '2026-02-03T00:00:00Z',
    updatedAt: '2026-02-03T00:00:00Z'
  }
];

export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'فحص طبي شامل',
    sku: 'SRV001',
    type: 'service',
    price: 500,
    quantity: 0,
    status: 'active',
    description: 'فحص طبي شامل يتضمن جميع الفحوصات الأساسية',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'تنظيف الأسنان',
    sku: 'SRV002',
    type: 'service',
    price: 200,
    quantity: 0,
    status: 'active',
    description: 'جلسة تنظيف أسنان احترافية',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'كريم مرطب طبي',
    sku: 'PRD001',
    type: 'product',
    price: 75,
    cost: 40,
    quantity: 50,
    status: 'active',
    description: 'كريم مرطب للبشرة الحساسة',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'فيتامينات متعددة',
    sku: 'PRD002',
    type: 'product',
    price: 120,
    cost: 60,
    quantity: 100,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

export const initialPackages: Package[] = [
  {
    id: '1',
    name: 'باقة العناية الشاملة',
    description: 'باقة شاملة للعناية بالصحة العامة',
    price: 800,
    validityDays: 30,
    services: [
      { productId: '1', quantity: 1 },
      { productId: '2', quantity: 2 }
    ],
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    branchId: '1',
    date: '2026-02-07',
    time: '10:00',
    type: 'new',
    status: 'confirmed',
    createdAt: '2026-02-06T00:00:00Z',
    updatedAt: '2026-02-06T00:00:00Z'
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '2',
    branchId: '1',
    date: '2026-02-07',
    time: '11:30',
    type: 'followup',
    status: 'pending',
    createdAt: '2026-02-06T00:00:00Z',
    updatedAt: '2026-02-06T00:00:00Z'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    patientId: '1',
    branchId: '1',
    date: '2026-02-06',
    items: [
      { id: '1', productId: '1', productName: 'فحص طبي شامل', quantity: 1, unitPrice: 500, total: 500 }
    ],
    subtotal: 500,
    discountPercentage: 10,
    discountAmount: 50,
    total: 450,
    paidAmount: 450,
    paymentStatus: 'paid',
    createdAt: '2026-02-06T00:00:00Z',
    updatedAt: '2026-02-06T00:00:00Z'
  }
];

export const initialReceipts: Receipt[] = [
  {
    id: '1',
    receiptNumber: 'RCP-001',
    invoiceId: '1',
    amount: 450,
    paymentMethod: 'cash',
    date: '2026-02-06',
    createdAt: '2026-02-06T00:00:00Z'
  }
];

export const initialSettings: Settings = {
  organizationName: 'نظام إدارة العيادات المتكامل',
  currency: 'SAR',
  currencySymbol: 'ريال',
  timezone: 'Asia/Riyadh',
  invoicePrefix: 'INV-',
  receiptPrefix: 'RCP-',
  language: 'ar',
  theme: 'light'
};
