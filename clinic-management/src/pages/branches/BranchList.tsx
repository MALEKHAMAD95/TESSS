import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Building2, Phone, MapPin, Users, TrendingUp, MoreVertical } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, EmptyState } from '../../components/common';
import { branchService } from '../../services/storage';
import type { Branch } from '../../types';

const BranchList = () => {
  const { t } = useTranslation();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = () => {
    setBranches(branchService.getAll());
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingBranch(null);
    setFormData({ name: '', address: '', phone: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      status: branch.status
    });
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      branchService.update(editingBranch.id, formData);
    } else {
      branchService.create(formData);
    }
    loadBranches();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      branchService.delete(id);
      loadBranches();
    }
    setActiveMenu(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('branches.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('branches.subtitle')} ({branches.length} {isNaN(branches.length) ? '' : t('menu.branches').toLowerCase()})
          </p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />}>
          {t('branches.addBranch')}
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder={`${t('common.search')}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      {/* Branches Grid */}
      {filteredBranches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBranches.map(branch => (
            <Card key={branch.id} hover className="relative">
              {/* Menu Button */}
              <div className="absolute top-4 left-4">
                <button
                  onClick={() => setActiveMenu(activeMenu === branch.id ? null : branch.id)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                >
                  <MoreVertical size={18} className="text-gray-500" />
                </button>
                {activeMenu === branch.id && (
                  <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-dark-700 rounded-lg shadow-lg border dark:border-dark-600 py-1 z-10">
                    <button
                      onClick={() => openEditModal(branch)}
                      className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id)}
                      className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      {t('common.delete')}
                    </button>
                  </div>
                )}
              </div>

              {/* Branch Icon & Status */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                  <Building2 className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {branch.name}
                  </h3>
                  <Badge variant={branch.status === 'active' ? 'success' : 'danger'} size="sm">
                    {branch.status === 'active' ? t('common.active') : t('common.inactive')}
                  </Badge>
                </div>
              </div>

              {/* Branch Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Phone size={14} className="text-gray-400" />
                  <span dir="ltr">{branch.phone}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-dark-700">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {t('branches.employeesCount')}: {branch.employeesCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {t('branches.sales')}: {branch.sales}
                  </span>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">{t('branches.performance')}</span>
                  <span className="text-gray-700 dark:text-gray-300">{branch.performance}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${branch.performance}%` }}
                  />
                </div>
              </div>

              {/* Manager */}
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {t('branches.manager')}: {branch.managerId || (t('common.noData') === 'No data available' ? 'Not assigned' : 'غير محدد')}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title={t('common.noData')}
            action={
              <Button onClick={openAddModal} icon={<Plus size={18} />}>
                {t('branches.addBranch')}
              </Button>
            }
          />
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? t('branches.editBranch') : t('branches.addBranch')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
              <Building2 className="w-8 h-8 text-primary-500" />
            </div>
          </div>

          <Input
            label={t('branches.branchName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label={t('branches.branchAddress')}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <Input
            label={t('branches.branchPhone')}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            dir="ltr"
          />

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

export default BranchList;
