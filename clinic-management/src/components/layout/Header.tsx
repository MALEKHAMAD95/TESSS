import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Moon, 
  Sun, 
  LogOut, 
  Building2,
  ChevronDown,
  Menu,
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { settingsService, branchService } from '../../services/storage';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

const Header = ({ onMenuClick, sidebarCollapsed }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const settings = settingsService.get();
  const branches = branchService.getAll();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [isDarkMode, setIsDarkMode] = useState(settings.theme === 'dark');
  const isRTL = i18n.language === 'ar';

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    settingsService.update({ theme: newTheme });
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const changeLanguage = (lang: 'ar' | 'en') => {
    i18n.changeLanguage(lang);
    settingsService.update({ language: lang });
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    setShowLangDropdown(false);
  };

  return (
    <header className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-16 bg-white dark:bg-dark-800 shadow-sm z-30 transition-all duration-300`}
      style={{ width: `calc(100% - ${sidebarCollapsed ? '5rem' : '16rem'})` }}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Menu toggle & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 lg:hidden"
          >
            <Menu size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">
            {t('app.title')}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Branch Selector */}
          <div className="relative">
            <button
              onClick={() => setShowBranchDropdown(!showBranchDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
            >
              <Building2 size={18} className="text-primary-500" />
              <span className="text-sm text-gray-700 dark:text-gray-200 hidden sm:block">
                {selectedBranch === 'all' ? t('header.allBranches') : branches.find(b => b.id === selectedBranch)?.name}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            
            {showBranchDropdown && (
              <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-48 bg-white dark:bg-dark-700 rounded-lg shadow-lg border dark:border-dark-600 py-1 z-50`}>
                <button
                  onClick={() => { setSelectedBranch('all'); setShowBranchDropdown(false); }}
                  className={`w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-dark-600 ${selectedBranch === 'all' ? 'text-primary-500 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  {t('header.allBranches')}
                </button>
                {branches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => { setSelectedBranch(branch.id); setShowBranchDropdown(false); }}
                    className={`w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-dark-600 ${selectedBranch === branch.id ? 'text-primary-500 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                  >
                    {branch.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              title={t('settings.language')}
            >
              <Globe size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            
            {showLangDropdown && (
              <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-32 bg-white dark:bg-dark-700 rounded-lg shadow-lg border dark:border-dark-600 py-1 z-50`}>
                <button
                  onClick={() => changeLanguage('ar')}
                  className={`w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-dark-600 ${i18n.language === 'ar' ? 'text-primary-500 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  العربية
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-dark-600 ${i18n.language === 'en' ? 'text-primary-500 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  English
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button 
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            title={t('header.notifications')}
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            title={isDarkMode ? t('settings.lightMode') : t('settings.darkMode')}
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-700">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
              أ
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800 dark:text-white">Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('header.systemAdmin')}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            title={t('auth.logout')}
          >
            <LogOut size={20} className="text-red-500 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
