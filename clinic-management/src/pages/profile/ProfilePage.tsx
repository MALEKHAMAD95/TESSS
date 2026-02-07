import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Lock, Save, Camera } from 'lucide-react';
import { Card, Button, Input } from '../../components/common';

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [profile, setProfile] = useState({
    fullName: 'أحمد محمد',
    username: 'admin',
    email: 'admin@clinic.com',
    phone: '0501234567'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [saved, setSaved] = useState(false);

  const handleSaveProfile = () => {
    // Save profile logic here
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    // Change password logic here
    setPasswords({ current: '', new: '', confirm: '' });
    alert(isRTL ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('profile.personalInfo')}</p>
      </div>

      {/* Profile Photo */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold">
              أ
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-dark-700 shadow-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600">
              <Camera size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="text-center sm:text-right">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{profile.fullName}</h2>
            <p className="text-gray-500">@{profile.username}</p>
            <p className="text-sm text-primary-500 mt-1">{isRTL ? 'مدير النظام' : 'System Admin'}</p>
          </div>
        </div>
      </Card>

      {/* Personal Info */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <User className="w-5 h-5 text-primary-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('profile.personalInfo')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('employees.fullName')}
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            icon={<User size={18} />}
          />
          <Input
            label={t('employees.username')}
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          />
          <Input
            label={t('common.email')}
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            icon={<Mail size={18} />}
          />
          <Input
            label={t('common.phone')}
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            icon={<Phone size={18} />}
            dir="ltr"
          />
        </div>

        <div className="mt-6">
          <Button onClick={handleSaveProfile} icon={<Save size={18} />}>
            {saved ? (isRTL ? '✓ تم الحفظ' : '✓ Saved') : t('common.save')}
          </Button>
        </div>
      </Card>

      {/* Change Password */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <Lock className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('profile.changePassword')}
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label={t('profile.currentPassword')}
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            required
          />
          <Input
            label={t('profile.newPassword')}
            type="password"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            required
          />
          <Input
            label={t('profile.confirmPassword')}
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            required
          />
          <Button type="submit" variant="danger">
            {t('profile.changePassword')}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
