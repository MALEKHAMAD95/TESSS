import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, MoreVertical, Package, Layers } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, EmptyState, Select } from '../../components/common';
import { productService } from '../../services/storage';
import type { Product } from '../../types';

const ProductList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'product' | 'service'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    type: 'service' as 'product' | 'service',
    price: 0,
    cost: 0,
    quantity: 0,
    description: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(productService.getAll());
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const productCount = products.filter(p => p.type === 'product').length;
  const serviceCount = products.filter(p => p.type === 'service').length;

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', sku: '', type: 'service', price: 0, cost: 0, quantity: 0, description: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      type: product.type,
      price: product.price,
      cost: product.cost || 0,
      quantity: product.quantity,
      description: product.description || '',
      status: product.status
    });
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      productService.update(editingProduct.id, formData);
    } else {
      productService.create(formData);
    }
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      productService.delete(id);
      loadData();
    }
    setActiveMenu(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('products.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('products.subtitle')}</p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />}>{t('products.addProduct')}</Button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-dark-700">
        {[
          { key: 'all', label: t('common.all'), count: products.length },
          { key: 'product', label: t('products.products'), count: productCount },
          { key: 'service', label: t('products.services'), count: serviceCount }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key as typeof filterType)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              filterType === tab.key
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="max-w-md">
        <Input
          placeholder={isRTL ? 'البحث عن منتج...' : 'Search products...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      <Card padding="none">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('products.productName')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('products.sku')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('products.type')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('products.price')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('products.cost')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('products.quantity')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('common.status')}</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-t border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${product.type === 'product' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                          {product.type === 'product' ? <Package className="w-5 h-5 text-purple-500" /> : <Layers className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                          {product.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{product.sku || '-'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={product.type === 'product' ? 'info' : 'success'}>
                        {product.type === 'product' ? t('products.product') : t('products.service')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{product.price.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{product.cost?.toLocaleString() || '-'}</td>
                    <td className="py-3 px-4">
                      {product.type === 'product' ? (
                        <Badge variant={product.quantity > 0 ? 'success' : 'danger'}>
                          {product.quantity > 0 ? product.quantity : t('products.outOfStock')}
                        </Badge>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={product.status === 'active' ? 'success' : 'danger'}>
                        {product.status === 'active' ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button onClick={() => setActiveMenu(activeMenu === product.id ? null : product.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600">
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>
                        {activeMenu === product.id && (
                          <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 w-32 bg-white dark:bg-dark-700 rounded-lg shadow-lg border dark:border-dark-600 py-1 z-10`}>
                            <button onClick={() => openEditModal(product)} className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-2">
                              <Edit2 size={14} />{t('common.edit')}
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
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
          <EmptyState title={t('common.noData')} action={<Button onClick={openAddModal} icon={<Plus size={18} />}>{t('products.addProduct')}</Button>} />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? t('products.editProduct') : t('products.addProduct')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('products.productName')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label={t('products.sku')} value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
            <Select
              label={t('products.type')}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'product' | 'service' })}
              options={[
                { value: 'product', label: t('products.product') },
                { value: 'service', label: t('products.service') }
              ]}
              required
            />
            <Input label={t('products.price')} type="number" value={formData.price.toString()} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required />
            {formData.type === 'product' && (
              <>
                <Input label={t('products.cost')} type="number" value={formData.cost.toString()} onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })} />
                <Input label={t('products.quantity')} type="number" value={formData.quantity.toString()} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} />
              </>
            )}
            <Select
              label={t('common.status')}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              options={[
                { value: 'active', label: t('common.active') },
                { value: 'inactive', label: t('common.inactive') }
              ]}
            />
          </div>
          <Input label={t('products.description')} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" className="flex-1">{t('common.save')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductList;
