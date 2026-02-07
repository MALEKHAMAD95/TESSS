import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Package, 
  DollarSign,
  Plus,
  UserPlus,
  PackagePlus,
  ChevronLeft,
  ChevronRight,
  Phone
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatCard, Card, Button, Badge, EmptyState } from '../components/common';
import { dashboardService, patientService, doctorService, appointmentService, settingsService } from '../services/storage';
import type { DashboardStats, Patient, Appointment } from '../types';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const settings = settingsService.get();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStats(dashboardService.getStats());
    setRecentPatients(dashboardService.getRecentPatients(5));
    setTodayAppointments(dashboardService.getTodayAppointments());
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ${settings.currencySymbol}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const weekDays = isRTL 
    ? ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة']
    : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const getAppointmentsForDay = (day: number) => {
    if (!day) return [];
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointmentService.getByDate(dateStr);
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && 
           selectedDate.getMonth() === today.getMonth() && 
           selectedDate.getFullYear() === today.getFullYear();
  };

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('auth.welcome')}, Admin 👋
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title={t('dashboard.totalPatients')}
          value={stats.totalPatients}
          subtitle={t('patients.totalPatients')}
          icon={<Users className="w-6 h-6 text-primary-500" />}
          iconBg="bg-primary-100 dark:bg-primary-900/30"
        />
        <StatCard
          title={t('dashboard.totalDoctors')}
          value={stats.totalDoctors}
          subtitle={t('doctors.totalDoctors')}
          icon={<Stethoscope className="w-6 h-6 text-blue-500" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title={t('dashboard.todayAppointments')}
          value={stats.todayAppointments}
          subtitle={`${stats.todayAppointments} ${isRTL ? 'موعد لليوم' : 'appointments today'}`}
          icon={<Calendar className="w-6 h-6 text-green-500" />}
          iconBg="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title={t('dashboard.totalProducts')}
          value={stats.totalProducts}
          subtitle={isRTL ? 'منتج مسجل' : 'registered products'}
          icon={<Package className="w-6 h-6 text-purple-500" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
        />
        <StatCard
          title={t('dashboard.monthlyRevenue')}
          value={formatCurrency(stats.monthlyRevenue)}
          subtitle={settings.currency}
          icon={<DollarSign className="w-6 h-6 text-emerald-500" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.quickActions')}
          </h2>
          <div className="space-y-3">
            <Link to="/appointments">
              <Button variant="primary" className="w-full justify-start" icon={<Plus size={18} />}>
                {t('dashboard.newAppointment')}
              </Button>
            </Link>
            <Link to="/patients">
              <Button variant="secondary" className="w-full justify-start" icon={<UserPlus size={18} />}>
                {t('dashboard.newPatient')}
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="w-full justify-start" icon={<PackagePlus size={18} />}>
                {t('dashboard.addProduct')}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Calendar */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('menu.appointments')}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px] text-center">
                {formatDate(selectedDate)}
              </span>
              <button 
                onClick={() => changeMonth(1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(selectedDate).map((day, index) => {
              const dayAppointments = getAppointmentsForDay(day!);
              return (
                <div
                  key={index}
                  className={`
                    min-h-[60px] p-1 rounded-lg text-center
                    ${day ? 'hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer' : ''}
                    ${isToday(day) ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500' : ''}
                  `}
                >
                  {day && (
                    <>
                      <span className={`text-sm ${isToday(day) ? 'font-bold text-primary-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {day}
                      </span>
                      {dayAppointments.length > 0 && (
                        <div className="mt-1">
                          <span className="inline-block w-5 h-5 rounded-full bg-primary-500 text-white text-xs leading-5">
                            {dayAppointments.length}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Today's appointments */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
            {todayAppointments.length > 0 ? (
              <div className="space-y-2">
                {todayAppointments.slice(0, 3).map(apt => {
                  const patient = patientService.getById(apt.patientId);
                  const doctor = doctorService.getById(apt.doctorId);
                  return (
                    <div key={apt.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-dark-700">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {apt.time}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {patient?.fullName} - {doctor?.fullName}
                        </span>
                      </div>
                      <Badge 
                        variant={apt.status === 'confirmed' ? 'success' : apt.status === 'pending' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {t(`appointments.statuses.${apt.status}`)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState 
                title={t('dashboard.noAppointments')} 
              />
            )}
          </div>

          <Link to="/appointments" className="block mt-4">
            <Button variant="ghost" className="w-full">
              {t('dashboard.viewAll')}
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.recentPatients')}
          </h2>
          <Link to="/patients">
            <Button variant="ghost" size="sm">
              {t('dashboard.viewAll')}
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-700">
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('common.name')}
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('common.phone')}
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('patients.registrationDate')}
                </th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.map(patient => (
                <tr key={patient.id} className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
                        {getInitials(patient.fullName)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {patient.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Phone size={14} />
                      <span>{patient.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                    {new Date(patient.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
