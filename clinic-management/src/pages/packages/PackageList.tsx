import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, MoreVertical, Layers } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, EmptyState, Select } from '../../components/common';
import { packageService, productService, settingsService } from '../../services/storage';
import type { Package, Product } from '../../types';

const PackageList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const settings = settingsService.get();
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    validityDays: 30,
    services: [] as { productId: string; quantity: number }[],
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPackages(packageService.getAll());
    setProducts(productService.getAll().filter(p => p.type === 'service' && p.status === 'active'));
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} ${settings.currencySymbol}`;

  const getServiceName = (productId: string) => products.find(p => p.id === productId)?.name || '';

  const openAddModal = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      validityDays: 30,
      services: [{ productId: '', quantity: 1 }],
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price,
      validityDays: pkg.validityDays || 30,
      services: pkg.services.length > 0 ? pkg.services : [{ productId: '', quantity: 1 }],
      status: pkg.status
    });
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { productId: '', quantity: 1 }]
    });
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    });
  };

  const updateService = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    setFormData({
      ...formData,
      services: formData.services.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validServices = formData.services.filter(s => s.productId);
    if (editingPackage) {
      packageService.update(editingPackage.id, { ...formData, services: validServices });
    } else {
      packageService.create({ ...formData, services: validServices });
    }
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      packageService.delete(id);
      loadData();
    }
    setActiveMenu(null);
  };

  const serviceOptions = [
    { value: '', label: isRTL ? 'اختر الخدمة' : 'Select Service' },
    ...products.map(p => ({ value: p.id, label: `${p.name} - ${formatCurrency(p.price)}` }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('packages.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('packages.subtitle')}</p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />}>{t('packages.addPackage')}</Button>
      </div>

      <div className="max-w-md">
        <Input
          placeholder={isRTL ? 'البحث...' : 'Search...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map(pkg => (
            <Card key={pkg.id} hover className="relative">
              <div className="absolute top-4 left-4">
                <button
                  onClick={() => setActiveMenu(activeMenu === pkg.id ? null : pkg.id)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                >
                  <MoreVertical size={18} className="text-gray-500" />
                </button>
                {activeMenu === pkg.id && (
                  <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-dark-700 rounded-lg shadow-lg border dark:border-dark-600 py-1 z-10">
                    <button onClick={() => openEditModal(pkg)} className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-2">
                      <Edit2 size={14} />{t('common.edit')}
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                      <Trash2 size={14} />{t('common.delete')}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Layers className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{pkg.name}</h3>
                  <Badge variant={pkg.status === 'active' ? 'success' : 'danger'} size="sm">
                    {pkg.status === 'active' ? t('common.active') : t('common.inactive')}
                  </Badge>
                </div>
              </div>

              {pkg.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{pkg.description}</p>
              )}

              <div className="text-2xl font-bold text-primary-500 mb-3">
                {formatCurrency(pkg.price)}
              </div>

              <div className="text-sm text-gray-500 mb-3">
                {t('packages.validityDays')}: {pkg.validityDays} {isRTL ? 'يوم' : 'days'}
              </div>

              <div className="border-t border-gray-100 dark:border-dark-700 pt-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('packages.includedServices')}:</p>
                <ul className="space-y-1">
                  {pkg.services.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                      {getServiceName(s.productId)} × {s.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState title={t('common.noData')} action={<Button onClick={openAddModal} icon={<Plus size={18} />}>{t('packages.addPackage')}</Button>} />
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPackage ? t('packages.editPackage') : t('packages.addPackage')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('packages.packageName')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">{t('products.description')}</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('products.price')} type="number" value={formData.price.toString()} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required />
            <Input label={t('packages.validityDays')} type="number" value={formData.validityDays.toString()} onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 30 })} />
          </div>

          <div className="border-t border-b border-gray-200 dark:border-dark-700 py-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">{t('packages.includedServices')}</h4>
            <div className="space-y-2">
              {formData.services.map((service, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      value={service.productId}
                      onChange={(e) => updateService(index, 'productId', e.target.value)}
                      options={serviceOptions}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      value={service.quantity.toString()}
                      onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  {formData.services.length > 1 && (
                    <Button type="button" variant="danger" size="sm" onClick={() => removeService(index)}>✕</Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={addService} icon={<Plus size={16} />}>
              {isRTL ? 'إضافة خدمة' : 'Add Service'}
            </Button>
          </div>

          <Select
            label={t('common.status')}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            options={[
              { value: 'active', label: t('common.active') },
              { value: 'inactive', label: t('common.inactive') }
            ]}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" className="flex-1">{t('common.save')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PackageList;
