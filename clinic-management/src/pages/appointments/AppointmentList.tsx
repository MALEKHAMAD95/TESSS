import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, MoreVertical, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, EmptyState, Select } from '../../components/common';
import { appointmentService, patientService, doctorService, branchService } from '../../services/storage';
import type { Appointment, Patient, Doctor, Branch } from '../../types';

const AppointmentList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    branchId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'new' as Appointment['type'],
    status: 'pending' as Appointment['status'],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAppointments(appointmentService.getAll());
    setPatients(patientService.getAll());
    setDoctors(doctorService.getAll());
    setBranches(branchService.getAll());
  };

  const filteredAppointments = appointments.filter(apt => {
    const patient = patients.find(p => p.id === apt.patientId);
    const matchesSearch = patient?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.fullName || '';
  const getDoctorName = (id: string) => doctors.find(d => d.id === id)?.fullName || '';
  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || '';

  const getStatusBadge = (status: Appointment['status']) => {
    const variants: Record<string, 'warning' | 'success' | 'info' | 'danger'> = {
      pending: 'warning',
      confirmed: 'success',
      completed: 'info',
      cancelled: 'danger'
    };
    return <Badge variant={variants[status]}>{t(`appointments.statuses.${status}`)}</Badge>;
  };

  const openAddModal = () => {
    setEditingAppointment(null);
    setFormData({
      patientId: '',
      doctorId: '',
      branchId: branches[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      type: 'new',
      status: 'pending',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setFormData({
      patientId: apt.patientId,
      doctorId: apt.doctorId,
      branchId: apt.branchId,
      date: apt.date,
      time: apt.time,
      type: apt.type || 'new',
      status: apt.status,
      notes: apt.notes || ''
    });
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAppointment) {
      appointmentService.update(editingAppointment.id, formData);
    } else {
      appointmentService.create(formData);
    }
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      appointmentService.delete(id);
      loadData();
    }
    setActiveMenu(null);
  };

  const updateStatus = (id: string, status: Appointment['status']) => {
    appointmentService.update(id, { status });
    loadData();
    setActiveMenu(null);
  };

  const patientOptions = [
    { value: '', label: isRTL ? 'اختر المريض' : 'Select Patient' },
    ...patients.map(p => ({ value: p.id, label: p.fullName }))
  ];

  const doctorOptions = [
    { value: '', label: isRTL ? 'اختر الطبيب' : 'Select Doctor' },
    ...doctors.filter(d => d.status === 'active').map(d => ({ value: d.id, label: d.fullName }))
  ];

  const branchOptions = branches.map(b => ({ value: b.id, label: b.name }));

  const typeOptions = [
    { value: 'new', label: t('appointments.types.new') },
    { value: 'followup', label: t('appointments.types.followup') },
    { value: 'consultation', label: t('appointments.types.consultation') },
    { value: 'emergency', label: t('appointments.types.emergency') }
  ];

  const statusOptions = [
    { value: 'pending', label: t('appointments.statuses.pending') },
    { value: 'confirmed', label: t('appointments.statuses.confirmed') },
    { value: 'completed', label: t('appointments.statuses.completed') },
    { value: 'cancelled', label: t('appointments.statuses.cancelled') }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('appointments.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('appointments.subtitle')}</p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />}>{t('appointments.addAppointment')}</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? t('common.all') : t(`appointments.statuses.${status}`)}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
            size="sm"
            icon={<CalendarIcon size={16} />}
            onClick={() => setViewMode('calendar')}
          >
            {t('appointments.calendarView')}
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            icon={<List size={16} />}
            onClick={() => setViewMode('list')}
          >
            {t('appointments.listView')}
          </Button>
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder={isRTL ? 'البحث بالاسم...' : 'Search by name...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      <Card padding="none">
        {filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('appointments.patient')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('appointments.doctor')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('common.date')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('common.time')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('employees.branch')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('common.status')}</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(apt => (
                  <tr key={apt.id} className="border-t border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{getPatientName(apt.patientId)}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{getDoctorName(apt.doctorId)}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{apt.date}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{apt.time}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{getBranchName(apt.branchId)}</td>
                    <td className="py-3 px-4">{getStatusBadge(apt.status)}</td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button onClick={() => setActiveMenu(activeMenu === apt.id ? null : apt.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600">
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>
                        {activeMenu === apt.id && (
                          <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 w-40 bg-white dark:bg-dark-700 rounded-lg shadow-lg border dark:border-dark-600 py-1 z-10`}>
                            <button onClick={() => openEditModal(apt)} className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-2">
                              <Edit2 size={14} />{t('common.edit')}
                            </button>
                            {apt.status === 'pending' && (
                              <button onClick={() => updateStatus(apt.id, 'confirmed')} className="w-full px-4 py-2 text-right text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                                ✓ {t('appointments.statuses.confirmed')}
                              </button>
                            )}
                            {apt.status === 'confirmed' && (
                              <button onClick={() => updateStatus(apt.id, 'completed')} className="w-full px-4 py-2 text-right text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                ✓ {t('appointments.statuses.completed')}
                              </button>
                            )}
                            <button onClick={() => updateStatus(apt.id, 'cancelled')} className="w-full px-4 py-2 text-right text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                              ✗ {t('appointments.statuses.cancelled')}
                            </button>
                            <button onClick={() => handleDelete(apt.id)} className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                              <Trash2 size={14} />{t('common.delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title={t('common.noData')} action={<Button onClick={openAddModal} icon={<Plus size={18} />}>{t('appointments.addAppointment')}</Button>} />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAppointment ? t('appointments.editAppointment') : t('appointments.addAppointment')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label={t('appointments.patient')} value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} options={patientOptions} required />
            <Select label={t('appointments.doctor')} value={formData.doctorId} onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })} options={doctorOptions} required />
            <Input label={t('common.date')} type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            <Input label={t('common.time')} type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
            <Select label={t('employees.branch')} value={formData.branchId} onChange={(e) => setFormData({ ...formData, branchId: e.target.value })} options={branchOptions} required />
            <Select label={t('appointments.appointmentType')} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Appointment['type'] })} options={typeOptions} />
            {editingAppointment && (
              <Select label={t('common.status')} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Appointment['status'] })} options={statusOptions} />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">{t('common.notes')}</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" className="flex-1">{t('common.save')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AppointmentList;
