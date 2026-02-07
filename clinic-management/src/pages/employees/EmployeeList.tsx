import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, MoreVertical, Download, Users } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, EmptyState, Select } from '../../components/common';
import { employeeService, branchService } from '../../services/storage';
import type { Employee, Branch } from '../../types';

const EmployeeList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    role: 'SALES' as Employee['role'],
    branchId: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEmployees(employeeService.getAll());
    setBranches(branchService.getAll());
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = employees.filter(e => e.status === 'active').length;
  const inactiveCount = employees.filter(e => e.status === 'inactive').length;

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({ fullName: '', username: '', email: '', phone: '', role: 'SALES', branchId: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      fullName: employee.fullName,
      username: employee.username,
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role,
      branchId: employee.branchId || '',
      status: employee.status
    });
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      employeeService.update(editingEmployee.id, formData);
    } else {
      employeeService.create(formData);
    }
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      employeeService.delete(id);
      loadData();
    }
    setActiveMenu(null);
  };

  const getBranchName = (branchId?: string) => {
    if (!branchId) return isRTL ? 'بدون فرع' : 'No Branch';
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || '';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const roleOptions = [
    { value: 'ADMIN', label: t('employees.roles.ADMIN') },
    { value: 'SALES', label: t('employees.roles.SALES') },
    { value: 'DOCTOR', label: t('employees.roles.DOCTOR') },
    { value: 'RECEPTIONIST', label: t('employees.roles.RECEPTIONIST') }
  ];

  const branchOptions = [
    { value: '', label: isRTL ? 'بدون فرع' : 'No Branch' },
    ...branches.map(b => ({ value: b.id, label: b.name }))
  ];

  const statusOptions = [
    { value: 'active', label: t('common.active') },
    { value: 'inactive', label: t('common.inactive') }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('employees.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('employees.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Download size={18} />}>
            {t('common.export')}
          </Button>
          <Button onClick={openAddModal} icon={<Plus size={18} />}>
            {t('employees.addEmployee')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
            <p className="text-sm text-gray-500">{isRTL ? 'إجمالي موظفي الفرع' : 'Total Branch Employees'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
            <Users className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
            <p className="text-sm text-gray-500">{isRTL ? 'نشط حالياً' : 'Currently Active'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
            <Users className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveCount}</p>
            <p className="text-sm text-gray-500">{isRTL ? 'غير نشط' : 'Inactive'}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder={isRTL ? 'البحث بالاسم أو اسم المستخدم...' : 'Search by name or username...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            {t('common.all')}
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            {t('common.active')}
          </Button>
          <Button
            variant={filterStatus === 'inactive' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilterStatus('inactive')}
          >
            {t('common.inactive')}
          </Button>
        </div>
      </div>

      {/* Employees Table */}
      <Card padding="none">
        {filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? 'الموظف' : 'Employee'}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('employees.role')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('employees.branch')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('common.status')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('employees.joinDate')}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 w-12">
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(employee => (
                  <tr key={employee.id} className="border-t border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                          {getInitials(employee.fullName)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{employee.fullName}</p>
                          <p className="text-sm text-gray-500">{employee.username}@</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={employee.role === 'ADMIN' ? 'info' : 'default'}>
                        {t(`employees.roles.${employee.role}`)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {getBranchName(employee.branchId)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={employee.status === 'active' ? 'success' : 'danger'}>
                        {employee.status === 'active' ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {new Date(employee.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === employee.id ? null : employee.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600"
                        >
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>
                        {activeMenu === employee.id && (
                          <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 w-32 bg-white dark:bg-dark-700 rounded-lg shadow-lg border dark:border-dark-600 py-1 z-10`}>
                            <button
                              onClick={() => openEditModal(employee)}
                              className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-2"
                            >
                              <Edit2 size={14} />
                              {t('common.edit')}
                            </button>
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              {t('common.delete')}
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
          <EmptyState
            title={t('common.noData')}
            action={
              <Button onClick={openAddModal} icon={<Plus size={18} />}>
                {t('employees.addEmployee')}
              </Button>
            }
          />
        )}
        
        {filteredEmployees.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-700 text-sm text-gray-500 text-center">
            {isRTL 
              ? `عرض ${filteredEmployees.length} موظف من إجمالي ${employees.length}`
              : `Showing ${filteredEmployees.length} of ${employees.length} employees`
            }
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? t('employees.editEmployee') : t('employees.addEmployee')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('employees.fullName')}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              label={t('employees.username')}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <Input
              label={t('common.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label={t('common.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              dir="ltr"
            />
            <Select
              label={t('employees.role')}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Employee['role'] })}
              options={roleOptions}
              required
            />
            <Select
              label={t('employees.branch')}
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              options={branchOptions}
            />
            <Select
              label={t('common.status')}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              options={statusOptions}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeList;
