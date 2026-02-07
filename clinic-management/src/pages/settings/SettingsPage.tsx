import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Globe, Palette, FileText, Building2, Save } from 'lucide-react';
import { Card, Button, Input, Select } from '../../components/common';
import { settingsService } from '../../services/storage';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [settings, setSettings] = useState(settingsService.get());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    settingsService.update(settings);
    
    // Apply language change
    if (settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language);
      document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = settings.language;
    }
    
    // Apply theme change
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const languageOptions = [
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' }
  ];

  const themeOptions = [
    { value: 'light', label: t('settings.lightMode') },
    { value: 'dark', label: t('settings.darkMode') }
  ];

  const currencyOptions = [
    { value: 'SAR', label: isRTL ? 'ريال سعودي (SAR)' : 'Saudi Riyal (SAR)' },
    { value: 'AED', label: isRTL ? 'درهم إماراتي (AED)' : 'UAE Dirham (AED)' },
    { value: 'USD', label: isRTL ? 'دولار أمريكي (USD)' : 'US Dollar (USD)' },
    { value: 'EUR', label: isRTL ? 'يورو (EUR)' : 'Euro (EUR)' }
  ];

  const timezoneOptions = [
    { value: 'Asia/Riyadh', label: isRTL ? 'توقيت الرياض (GMT+3)' : 'Riyadh Time (GMT+3)' },
    { value: 'Asia/Dubai', label: isRTL ? 'توقيت دبي (GMT+4)' : 'Dubai Time (GMT+4)' },
    { value: 'UTC', label: 'UTC' }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('settings.general')}</p>
        </div>
        <Button onClick={handleSave} icon={<Save size={18} />}>
          {saved ? (isRTL ? '✓ تم الحفظ' : '✓ Saved') : t('common.save')}
        </Button>
      </div>

      {/* Organization Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Building2 className="w-5 h-5 text-primary-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isRTL ? 'معلومات المؤسسة' : 'Organization Info'}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('settings.organizationName')}
            value={settings.organizationName}
            onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              {t('settings.logo')}
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-dark-700 flex items-center justify-center text-2xl">
                🏥
              </div>
              <Button variant="outline" size="sm">
                {isRTL ? 'تغيير الشعار' : 'Change Logo'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Language & Theme */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isRTL ? 'اللغة والمظهر' : 'Language & Appearance'}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={t('settings.language')}
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value as 'ar' | 'en' })}
            options={languageOptions}
          />
          <Select
            label={t('settings.theme')}
            value={settings.theme}
            onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })}
            options={themeOptions}
          />
        </div>
        
        {/* Theme Preview */}
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => setSettings({ ...settings, theme: 'light' })}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              settings.theme === 'light' 
                ? 'border-primary-500 bg-white' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="h-20 bg-gradient-to-br from-gray-100 to-white rounded-lg mb-2"></div>
            <p className="text-sm font-medium text-gray-900">{t('settings.lightMode')}</p>
          </button>
          <button
            onClick={() => setSettings({ ...settings, theme: 'dark' })}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              settings.theme === 'dark' 
                ? 'border-primary-500 bg-dark-800' 
                : 'border-gray-200 bg-dark-800 hover:border-gray-300'
            }`}
          >
            <div className="h-20 bg-gradient-to-br from-dark-700 to-dark-900 rounded-lg mb-2"></div>
            <p className="text-sm font-medium text-white">{t('settings.darkMode')}</p>
          </button>
        </div>
      </Card>

      {/* Regional Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <Settings className="w-5 h-5 text-green-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isRTL ? 'الإعدادات الإقليمية' : 'Regional Settings'}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={t('settings.currency')}
            value={settings.currency}
            onChange={(e) => {
              const curr = e.target.value;
              const symbols: Record<string, string> = { SAR: 'ريال', AED: 'درهم', USD: '$', EUR: '€' };
              setSettings({ ...settings, currency: curr, currencySymbol: symbols[curr] || curr });
            }}
            options={currencyOptions}
          />
          <Select
            label={t('settings.timezone')}
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            options={timezoneOptions}
          />
        </div>
      </Card>

      {/* Invoice Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <FileText className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.invoiceSettings')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('settings.invoicePrefix')}
            value={settings.invoicePrefix}
            onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
            placeholder="INV-"
          />
          <Input
            label={t('settings.receiptPrefix')}
            value={settings.receiptPrefix}
            onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })}
            placeholder="RCP-"
          />
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
