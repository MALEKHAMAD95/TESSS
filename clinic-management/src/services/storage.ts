// ═══════════════════════════════════════════════════════════════
// خدمة التخزين المحلي - Local Storage Service
// ═══════════════════════════════════════════════════════════════

import { 
  Branch, Employee, Doctor, Patient, Product, Package, 
  Appointment, Invoice, Receipt, Settings 
} from '../types';
import { 
  initialBranches, initialEmployees, initialDoctors, initialPatients,
  initialProducts, initialPackages, initialAppointments, initialInvoices,
  initialReceipts, initialSettings 
} from '../data/initialData';

const STORAGE_KEYS = {
  BRANCHES: 'clinic_branches',
  EMPLOYEES: 'clinic_employees',
  DOCTORS: 'clinic_doctors',
  PATIENTS: 'clinic_patients',
  PRODUCTS: 'clinic_products',
  PACKAGES: 'clinic_packages',
  APPOINTMENTS: 'clinic_appointments',
  INVOICES: 'clinic_invoices',
  RECEIPTS: 'clinic_receipts',
  SETTINGS: 'clinic_settings',
  CURRENT_USER: 'clinic_current_user'
};

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

// ═══════════════════════════════════════════════════════════════
// Initialize data
// ═══════════════════════════════════════════════════════════════
export const initializeData = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.BRANCHES)) {
    setItem(STORAGE_KEYS.BRANCHES, initialBranches);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    setItem(STORAGE_KEYS.EMPLOYEES, initialEmployees);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
    setItem(STORAGE_KEYS.DOCTORS, initialDoctors);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    setItem(STORAGE_KEYS.PATIENTS, initialPatients);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setItem(STORAGE_KEYS.PRODUCTS, initialProducts);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PACKAGES)) {
    setItem(STORAGE_KEYS.PACKAGES, initialPackages);
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    setItem(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
    setItem(STORAGE_KEYS.INVOICES, initialInvoices);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RECEIPTS)) {
    setItem(STORAGE_KEYS.RECEIPTS, initialReceipts);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setItem(STORAGE_KEYS.SETTINGS, initialSettings);
  }
};

// ═══════════════════════════════════════════════════════════════
// Branches CRUD
// ═══════════════════════════════════════════════════════════════
export const branchService = {
  getAll: (): Branch[] => getItem(STORAGE_KEYS.BRANCHES, initialBranches),
  
  getById: (id: string): Branch | undefined => {
    const branches = branchService.getAll();
    return branches.find(b => b.id === id);
  },
  
  create: (data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt' | 'employeesCount' | 'sales' | 'performance'>): Branch => {
    const branches = branchService.getAll();
    const newBranch: Branch = {
      ...data,
      id: generateId(),
      employeesCount: 0,
      sales: 0,
      performance: 0,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    branches.push(newBranch);
    setItem(STORAGE_KEYS.BRANCHES, branches);
    return newBranch;
  },
  
  update: (id: string, data: Partial<Branch>): Branch | undefined => {
    const branches = branchService.getAll();
    const index = branches.findIndex(b => b.id === id);
    if (index !== -1) {
      branches[index] = { ...branches[index], ...data, updatedAt: getCurrentTimestamp() };
      setItem(STORAGE_KEYS.BRANCHES, branches);
      return branches[index];
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const branches = branchService.getAll();
    const filtered = branches.filter(b => b.id !== id);
    if (filtered.length !== branches.length) {
      setItem(STORAGE_KEYS.BRANCHES, filtered);
      return true;
    }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// Employees CRUD
// ═══════════════════════════════════════════════════════════════
export const employeeService = {
  getAll: (): Employee[] => getItem(STORAGE_KEYS.EMPLOYEES, initialEmployees),
  
  getById: (id: string): Employee | undefined => {
    const employees = employeeService.getAll();
    return employees.find(e => e.id === id);
  },
  
  getByBranch: (branchId: string): Employee[] => {
    const employees = employeeService.getAll();
    return employees.filter(e => e.branchId === branchId);
  },
  
  create: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee => {
    const employees = employeeService.getAll();
    const newEmployee: Employee = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    employees.push(newEmployee);
    setItem(STORAGE_KEYS.EMPLOYEES, employees);
    return newEmployee;
  },
  
  update: (id: string, data: Partial<Employee>): Employee | undefined => {
    const employees = employeeService.getAll();
    const index = employees.findIndex(e => e.id === id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...data, updatedAt: getCurrentTimestamp() };
      setItem(STORAGE_KEYS.EMPLOYEES, employees);
      return employees[index];
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const employees = employeeService.getAll();
    const filtered = employees.filter(e => e.id !== id);
    if (filtered.length !== employees.length) {
      setItem(STORAGE_KEYS.EMPLOYEES, filtered);
      return true;
    }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// Doctors CRUD
// ═══════════════════════════════════════════════════════════════
export const doctorService = {
  getAll: (): Doctor[] => getItem(STORAGE_KEYS.DOCTORS, initialDoctors),
  
  getById: (id: string): Doctor | undefined => {
    const doctors = doctorService.getAll();
    return doctors.find(d => d.id === id);
  },
  
  create: (data: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Doctor => {
    const doctors = doctorService.getAll();
    const newDoctor: Doctor = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    doctors.push(newDoctor);
    setItem(STORAGE_KEYS.DOCTORS, doctors);
    return newDoctor;
  },
  
  update: (id: string, data: Partial<Doctor>): Doctor | undefined => {
    const doctors = doctorService.getAll();
    const index = doctors.findIndex(d => d.id === id);
    if (index !== -1) {
      doctors[index] = { ...doctors[index], ...data, updatedAt: getCurrentTimestamp() };
      setItem(STORAGE_KEYS.DOCTORS, doctors);
      return doctors[index];
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const doctors = doctorService.getAll();
    const filtered = doctors.filter(d => d.id !== id);
    if (filtered.length !== doctors.length) {
      setItem(STORAGE_KEYS.DOCTORS, filtered);
      return true;
    }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// Patients CRUD
// ═══════════════════════════════════════════════════════════════
export const patientService = {
  getAll: (): Patient[] => getItem(STORAGE_KEYS.PATIENTS, initialPatients),
  
  getById: (id: string): Patient | undefined => {
    const patients = patientService.getAll();
    return patients.find(p => p.id === id);
  },
  
  create: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient => {
    const patients = patientService.getAll();
    const newPatient: Patient = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    patients.push(newPatient);
    setItem(STORAGE_KEYS.PATIENTS, patients);
    return newPatient;
  },
  
  update: (id: string, data: Partial<Patient>): Patient | undefined => {
    const patients = patientService.getAll();
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients[index] = { ...patients[index], ...data, updatedAt: getCurrentTimestamp() };
      setItem(STORAGE_KEYS.PATIENTS, patients);
      return patients[index];
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const patients = patientService.getAll();
    const filtered = patients.filter(p => p.id !== id);
    if (filtered.length !== patients.length) {
      setItem(STORAGE_KEYS.PATIENTS, filtered);
      return true;
    }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// Products CRUD
// ═══════════════════════════════════════════════════════════════
export const productService = {
  getAll: (): Product[] => getItem(STORAGE_KEYS.PRODUCTS, initialProducts),
  
  getById: (id: string): Product | undefined => {
    const products = productService.getAll();
    return products.find(p => p.id === id);
  },
  
  getByType: (type: 'product' | 'service'): Product[] => {
    const products = productService.getAll();
    return products.filter(p => p.type === type);
  },
  
  create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const products = productService.getAll();
    const newProduct: Product = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    products.push(newProduct);
    setItem(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },
  
  update: (id: string, data: Partial<Product>): Product | undefined => {
    const products = productService.getAll();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...data, updatedAt: getCurrentTimestamp() };
      setItem(STORAGE_KEYS.PRODUCTS, products);
      return products[index];
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const products = productService.getAll();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length !== products.length) {
      setItem(STORAGE_KEYS.PRODUCTS, filtered);
      return true;
    }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// Packages CRUD
// ═══════════════════════════════════════════════════════════════
export const packageService = {
  getAll: (): Package[] => getItem(STORAGE_KEYS.PACKAGES, initialPackages),
  
  getById: (id: string): Package | undefined => {
    const packages = packageService.getAll();
    return packages.find(p => p.id === id);
  },
  
  create: (data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Package => {
    const packages = packageService.getAll();
    const newPackage: Package = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    packages.push(newPackage);
    setItem(STORAGE_KEYS.PACKAGES, packages);
    return newPackage;
  },
  
  update: (id: string, data: Partial<Package>): Package | undefined => {
    const packages = packageService.getAll();
    const index = packages.findIndex(p => p.id === id);
    if (index !== -1) {
      packages[index] = { ...packages[index], ...data, updatedAt: getCurrentTimestamp() };
      setItem(STORAGE_KEYS.PACKAGES, packages);
      return packages[index];
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const packages = packageService.getAll();
    const filtered = packages.filter(p => p.id !== id);
    if (filtered.length !== packages.length) {
      setItem(STORAGE_KEYS.PACKAGES, filtered);
      return true;
    }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// Appointments CRUD
// ═══════════════════════════════════════════════════════════════
export const appointmentService = {
  getAll: (): Appointment[] => getItem(STORAGE_KEYS.APPOINTMENTS, initialAppointments),
  
  getById: (id: string): Appointment | undefined => {
    const appointments = appointmentService.getAll();
    return appointments.find(a => a.id === id);
  },
  
  getByDate: (date: string): Appointment[] => {
    const appointments = appointmentService.getAll();
    return appointments.filter(a => a.date === date);
  },
  
  getByPatient: (patientId: string): Appointment[] => {
    const appointments = appointmentService.getAll();
    return appointments.filter(a => a.patientId === patientId);
  },
  
  getByDoctor: (doctorId: string): Appointment[] => {
    const appointments = appointmentService.getAll();
    return appointments.filter(a => a.doctorId === doctorId);
  },
  
  create: (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment => {
    const appointments = appointmentService.getAll();
    const newAppointment: Appointment = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    appointments.push(newAppointment);
    setItem(STORAGE_KEYS.APPOINTMENTS, appointments);
    return newAppointment;
  },
  
  update: (id: string, data: Partial<Appointment>): Appointment | undefined => {
    const appointments = appointmentService.getAll();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...data, updatedAt: getCurrentTimestamp() };
      setItem(STORAGE_KEYS.APPOINTMENTS, appointments);
      return appointments[index];
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const appointments = appointmentService.getAll();
    const filtered = appointments.filter(a => a.id !== id);
    if (filtered.length !== appointments.length) {
      setItem(STORAGE_KEYS.APPOINTMENTS, filtered);
      return true;
    }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// Invoices CRUD
// ═══════════════════════════════════════════════════════════════
export const invoiceService = {
  getAll: (): Invoice[] => getItem(STORAGE_KEYS.INVOICES, initialInvoices),
  
  getById: (id: string): Invoice | undefined => {
    const invoices = invoiceService.getAll();
    return invoices.find(i => i.id === id);
  },
  
  getByPatient: (patientId: string): Invoice[] => {
    const invoices = invoiceService.getAll();
    return invoices.filter(i => i.patientId === patientId);
  },
  
  getNextNumber: (): string => {
    const settings = settingsService.get();
    const invoices = invoiceService.getAll();
    const lastNumber = invoices.length > 0 
      ? Math.max(...invoices.map(i => parseInt(i.invoiceNumber.replace(settings.invoicePrefix, '')) || 0))
      : 0;
    return `${settings.invoicePrefix}${String(lastNumber + 1).padStart(3, '0')}`;
  },
  
  create: (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>): Invoice => {
    const invoices = invoiceService.getAll();
    const newInvoice: Invoice = {
      ...data,
      id: generateId(),
      invoiceNumber: invoiceService.getNextNumber(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    invoices.push(newInvoice);
    setItem(STORAGE_KEYS.INVOICES, invoices);
    return newInvoice;
  },
  
  update: (id: string, data: Partial<Invoice>): Invoice | undefined => {
    const invoices = invoiceService.getAll();
    const index = invoices.findIndex(i => i.id === id);
    if (index !== -1) {
      invoices[index] = { ...invoices[index], ...data, updatedAt: getCurrentTimestamp() };
      setItem(STORAGE_KEYS.INVOICES, invoices);
      return invoices[index];
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const invoices = invoiceService.getAll();
    const filtered = invoices.filter(i => i.id !== id);
    if (filtered.length !== invoices.length) {
      setItem(STORAGE_KEYS.INVOICES, filtered);
      return true;
    }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// Receipts CRUD
// ═══════════════════════════════════════════════════════════════
export const receiptService = {
  getAll: (): Receipt[] => getItem(STORAGE_KEYS.RECEIPTS, initialReceipts),
  
  getById: (id: string): Receipt | undefined => {
    const receipts = receiptService.getAll();
    return receipts.find(r => r.id === id);
  },
  
  getByInvoice: (invoiceId: string): Receipt[] => {
    const receipts = receiptService.getAll();
    return receipts.filter(r => r.invoiceId === invoiceId);
  },
  
  getNextNumber: (): string => {
    const settings = settingsService.get();
    const receipts = receiptService.getAll();
    const lastNumber = receipts.length > 0 
      ? Math.max(...receipts.map(r => parseInt(r.receiptNumber.replace(settings.receiptPrefix, '')) || 0))
      : 0;
    return `${settings.receiptPrefix}${String(lastNumber + 1).padStart(3, '0')}`;
  },
  
  create: (data: Omit<Receipt, 'id' | 'receiptNumber' | 'createdAt'>): Receipt => {
    const receipts = receiptService.getAll();
    const newReceipt: Receipt = {
      ...data,
      id: generateId(),
      receiptNumber: receiptService.getNextNumber(),
      createdAt: getCurrentTimestamp()
    };
    receipts.push(newReceipt);
    setItem(STORAGE_KEYS.RECEIPTS, receipts);
    
    // Update invoice paid amount
    const invoice = invoiceService.getById(data.invoiceId);
    if (invoice) {
      const newPaidAmount = invoice.paidAmount + data.amount;
      let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
      if (newPaidAmount >= invoice.total) {
        paymentStatus = 'paid';
      } else if (newPaidAmount > 0) {
        paymentStatus = 'partial';
      }
      invoiceService.update(invoice.id, { paidAmount: newPaidAmount, paymentStatus });
    }
    
    return newReceipt;
  },
  
  delete: (id: string): boolean => {
    const receipts = receiptService.getAll();
    const filtered = receipts.filter(r => r.id !== id);
    if (filtered.length !== receipts.length) {
      setItem(STORAGE_KEYS.RECEIPTS, filtered);
      return true;
    }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// Settings
// ═══════════════════════════════════════════════════════════════
export const settingsService = {
  get: (): Settings => getItem(STORAGE_KEYS.SETTINGS, initialSettings),
  
  update: (data: Partial<Settings>): Settings => {
    const settings = settingsService.get();
    const updatedSettings = { ...settings, ...data };
    setItem(STORAGE_KEYS.SETTINGS, updatedSettings);
    return updatedSettings;
  }
};

// ═══════════════════════════════════════════════════════════════
// Dashboard Stats
// ═══════════════════════════════════════════════════════════════
export const dashboardService = {
  getStats: () => {
    const patients = patientService.getAll();
    const doctors = doctorService.getAll();
    const appointments = appointmentService.getAll();
    const products = productService.getAll();
    const invoices = invoiceService.getAll();
    
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyInvoices = invoices.filter(i => {
      const invoiceDate = new Date(i.date);
      return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
    });
    const monthlyRevenue = monthlyInvoices.reduce((sum, i) => sum + i.total, 0);
    
    return {
      totalPatients: patients.length,
      totalDoctors: doctors.filter(d => d.status === 'active').length,
      todayAppointments: todayAppointments.length,
      totalProducts: products.length,
      monthlyRevenue
    };
  },
  
  getRecentPatients: (limit: number = 5): Patient[] => {
    const patients = patientService.getAll();
    return patients
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
  
  getTodayAppointments: (): Appointment[] => {
    const today = new Date().toISOString().split('T')[0];
    return appointmentService.getByDate(today);
  }
};
