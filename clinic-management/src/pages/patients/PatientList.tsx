import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, MoreVertical, Download, UserRound, Phone, Mail, Calendar, Eye } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, EmptyState, Select } from '../../components/common';
import { patientService, branchService } from '../../services/storage';
import type { Patient, Branch } from '../../types';

const PatientList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [patients, setPatients] = useState<Patient[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: '' as '' | 'male' | 'female',
    address: '',
    medicalNotes: '',
    branchId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPatients(patientService.getAll());
    setBranches(branchService.getAll());
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const openAddModal = () => {
    setEditingPatient(null);
    setFormData({ fullName: '', phone: '', email: '', birthDate: '', gender: '', address: '', medicalNotes: '', branchId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      fullName: patient.fullName,
      phone: patient.phone,
      email: patient.email || '',
      birthDate: patient.birthDate || '',
      gender: patient.gender || '',
      address: patient.address || '',
      medicalNotes: patient.medicalNotes || '',
      branchId: patient.branchId || ''
    });
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      gender: formData.gender || undefined
    };
    if (editingPatient) {
      patientService.update(editingPatient.id, data);
    } else {
      patientService.create(data as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>);
    }
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      patientService.delete(id);
      loadData();
    }
    setActiveMenu(null);
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const branchOptions = [
    { value: '', label: isRTL ? 'اختر الفرع' : 'Select Branch' },
    ...branches.map(b => ({ value: b.id, label: b.name }))
  ];

  const genderOptions = [
    { value: '', label: isRTL ? 'اختر الجنس' : 'Select Gender' },
    { value: 'male', label: t('patients.male') },
    { value: 'female', label: t('patients.female') }
  ];

  // Calculate stats
  const today = new Date();
  const thisMonth = today.getMonth();
  const newThisMonth = patients.filter(p => new Date(p.createdAt).getMonth() === thisMonth).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('patients.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('patients.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Download size={18} />}>{t('common.export')}</Button>
          <Button onClick={openAddModal} icon={<Plus size={18} />}>{t('patients.addPatient')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
            <UserRound className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.length}</p>
            <p className="text-sm text-gray-500">{t('patients.totalPatients')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
            <Plus className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{newThisMonth}</p>
            <p className="text-sm text-gray-500">{t('patients.newPatients')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.length}</p>
            <p className="text-sm text-gray-500">{t('patients.activePatients')}</p>
          </div>
        </Card>
      </div>

      <div className="max-w-md">
        <Input
          placeholder={isRTL ? 'البحث بالاسم أو رقم الهاتف...' : 'Search by name or phone...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      <Card padding="none">
        {filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{isRTL ? 'المريض' : 'Patient'}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('common.phone')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('common.email')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('patients.registrationDate')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('patients.lastVisit')}</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.id} className="border-t border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
                          {getInitials(patient.fullName)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{patient.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Phone size={14} />
                        <span dir="ltr">{patient.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{patient.email || '-'}</td>
                    <td className="py-3 px-4 text-gray-500">{new Date(patient.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</td>
                    <td className="py-3 px-4 text-gray-500">{new Date(patient.updatedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button onClick={() => setActiveMenu(activeMenu === patient.id ? null : patient.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600">
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>
                        {activeMenu === patient.id && (
                          <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 w-36 bg-white dark:bg-dark-700 rounded-lg shadow-lg border dark:border-dark-600 py-1 z-10`}>
                            <button className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-2">
                              <Eye size={14} />{t('patients.viewPatient')}
                            </button>
                            <button onClick={() => openEditModal(patient)} className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-2">
                              <Edit2 size={14} />{t('common.edit')}
                            </button>
                            <button className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-2">
                              <Calendar size={14} />{t('appointments.addAppointment')}
                            </button>
                            <button onClick={() => handleDelete(patient.id)} className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
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
          <EmptyState title={t('common.noData')} action={<Button onClick={openAddModal} icon={<Plus size={18} />}>{t('patients.addPatient')}</Button>} />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPatient ? t('patients.editPatient') : t('patients.addPatient')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('employees.fullName')} value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            <Input label={t('common.phone')} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required dir="ltr" />
            <Input label={t('common.email')} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label={t('patients.birthDate')} type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
            <Select label={t('patients.gender')} value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as '' | 'male' | 'female' })} options={genderOptions} />
            <Select label={t('employees.branch')} value={formData.branchId} onChange={(e) => setFormData({ ...formData, branchId: e.target.value })} options={branchOptions} />
          </div>
          <Input label={t('common.address')} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">{t('patients.medicalNotes')}</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
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

export default PatientList;
