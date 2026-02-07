import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, MoreVertical, Download, Stethoscope, Phone, Mail } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, EmptyState, Select } from '../../components/common';
import { doctorService, branchService } from '../../services/storage';
import type { Doctor, Branch } from '../../types';

const DoctorList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    phone: '',
    email: '',
    branchId: '',
    status: 'active' as 'active' | 'inactive',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setDoctors(doctorService.getAll());
    setBranches(branchService.getAll());
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = 
      doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = doctors.filter(d => d.status === 'active').length;

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData({ fullName: '', specialization: '', phone: '', email: '', branchId: '', status: 'active', notes: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      fullName: doctor.fullName,
      specialization: doctor.specialization,
      phone: doctor.phone,
      email: doctor.email || '',
      branchId: doctor.branchId || '',
      status: doctor.status,
      notes: doctor.notes || ''
    });
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctor) {
      doctorService.update(editingDoctor.id, formData);
    } else {
      doctorService.create(formData);
    }
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      doctorService.delete(id);
      loadData();
    }
    setActiveMenu(null);
  };

  const getBranchName = (branchId?: string) => {
    if (!branchId) return '';
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || '';
  };

  const branchOptions = [
    { value: '', label: isRTL ? 'اختر الفرع' : 'Select Branch' },
    ...branches.map(b => ({ value: b.id, label: b.name }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('doctors.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('doctors.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Download size={18} />}>{t('common.export')}</Button>
          <Button onClick={openAddModal} icon={<Plus size={18} />}>{t('doctors.addDoctor')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Stethoscope className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{doctors.length}</p>
            <p className="text-sm text-gray-500">{t('doctors.totalDoctors')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
            <Stethoscope className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
            <p className="text-sm text-gray-500">{isRTL ? 'نشط حالياً' : 'Active'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
            <Stethoscope className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{doctors.length - activeCount}</p>
            <p className="text-sm text-gray-500">{isRTL ? 'غير نشط' : 'Inactive'}</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder={isRTL ? 'البحث بالاسم أو التخصص...' : 'Search by name or specialization...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus(status as typeof filterStatus)}
            >
              {status === 'all' ? t('common.all') : status === 'active' ? t('common.active') : t('common.inactive')}
            </Button>
          ))}
        </div>
      </div>

      <Card padding="none">
        {filteredDoctors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{isRTL ? 'الطبيب' : 'Doctor'}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('doctors.specialization')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('common.phone')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('employees.branch')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('common.status')}</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map(doctor => (
                  <tr key={doctor.id} className="border-t border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{doctor.fullName}</p>
                          {doctor.email && <p className="text-sm text-gray-500">{doctor.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{doctor.specialization}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Phone size={14} />
                        <span dir="ltr">{doctor.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{getBranchName(doctor.branchId)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={doctor.status === 'active' ? 'success' : 'danger'}>
                        {doctor.status === 'active' ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button onClick={() => setActiveMenu(activeMenu === doctor.id ? null : doctor.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600">
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>
                        {activeMenu === doctor.id && (
                          <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 w-32 bg-white dark:bg-dark-700 rounded-lg shadow-lg border dark:border-dark-600 py-1 z-10`}>
                            <button onClick={() => openEditModal(doctor)} className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-2">
                              <Edit2 size={14} />{t('common.edit')}
                            </button>
                            <button onClick={() => handleDelete(doctor.id)} className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
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
          <EmptyState title={t('common.noData')} action={<Button onClick={openAddModal} icon={<Plus size={18} />}>{t('doctors.addDoctor')}</Button>} />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDoctor ? t('doctors.editDoctor') : t('doctors.addDoctor')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('employees.fullName')} value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            <Input label={t('doctors.specialization')} value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} required />
            <Input label={t('common.phone')} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required dir="ltr" />
            <Input label={t('common.email')} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Select label={t('employees.branch')} value={formData.branchId} onChange={(e) => setFormData({ ...formData, branchId: e.target.value })} options={branchOptions} />
            <Select label={t('common.status')} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })} options={[{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }]} />
          </div>
          <Input label={t('common.notes')} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" className="flex-1">{t('common.save')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorList;
