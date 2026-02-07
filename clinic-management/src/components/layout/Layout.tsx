import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';
import { settingsService } from '../../services/storage';

const Layout = () => {
  const { i18n } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const settings = settingsService.get();
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <Header 
        onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <main 
        className={`pt-20 pb-6 px-4 sm:px-6 transition-all duration-300 ${
          isRTL 
            ? sidebarCollapsed ? 'mr-20' : 'mr-64' 
            : sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
