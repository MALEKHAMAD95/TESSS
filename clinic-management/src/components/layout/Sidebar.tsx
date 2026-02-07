import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Stethoscope,
  UserRound,
  Package,
  Layers,
  Calendar,
  FileText,
  Receipt,
  ShoppingCart,
  BarChart3,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isRTL = i18n.language === 'ar';

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: t('menu.dashboard') },
    { path: '/branches', icon: Building2, label: t('menu.branches') },
    { path: '/employees', icon: Users, label: t('menu.employees') },
    { path: '/doctors', icon: Stethoscope, label: t('menu.doctors') },
    { path: '/patients', icon: UserRound, label: t('menu.patients') },
    { path: '/products', icon: Package, label: t('menu.products') },
    { path: '/packages', icon: Layers, label: t('menu.packages') },
    { path: '/appointments', icon: Calendar, label: t('menu.appointments') },
    { path: '/invoices', icon: FileText, label: t('menu.invoices') },
    { path: '/receipts', icon: Receipt, label: t('menu.receipts') },
    { path: '/product-invoices', icon: ShoppingCart, label: t('menu.productInvoices') },
    { path: '/reports', icon: BarChart3, label: t('menu.reports') },
    { path: '/profile', icon: User, label: t('menu.profile') },
    { path: '/settings', icon: Settings, label: t('menu.settings') },
  ];

  return (
    <aside
      className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full bg-dark-800 text-white transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-dark-700">
        {!isCollapsed && (
          <span className="text-lg font-bold text-primary-500 truncate">
            {t('app.title')}
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
        >
          {isCollapsed ? (
            isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />
          ) : (
            isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 px-2 pb-4 h-[calc(100vh-5rem)] overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-dark-900 font-semibold shadow-lg'
                  : 'text-gray-300 hover:bg-dark-700 hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={22} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
