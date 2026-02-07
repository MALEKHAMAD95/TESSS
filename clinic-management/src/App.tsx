import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './i18n';
import './index.css';
import { initializeData } from './services/storage';
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import BranchList from './pages/branches/BranchList';
import EmployeeList from './pages/employees/EmployeeList';
import DoctorList from './pages/doctors/DoctorList';
import PatientList from './pages/patients/PatientList';
import ProductList from './pages/products/ProductList';
import PackageList from './pages/packages/PackageList';
import AppointmentList from './pages/appointments/AppointmentList';
import InvoiceList from './pages/invoices/InvoiceList';
import ReceiptList from './pages/receipts/ReceiptList';
import ReportList from './pages/reports/ReportList';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';

function App() {
  useEffect(() => {
    // Initialize data on first load
    initializeData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="branches" element={<BranchList />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="doctors" element={<DoctorList />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="products" element={<ProductList />} />
          <Route path="packages" element={<PackageList />} />
          <Route path="appointments" element={<AppointmentList />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="receipts" element={<ReceiptList />} />
          <Route path="product-invoices" element={<InvoiceList />} />
          <Route path="reports" element={<ReportList />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
