import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, MoreVertical, FileText, Printer, DollarSign } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, EmptyState, Select } from '../../components/common';
import { invoiceService, patientService, productService, branchService, settingsService } from '../../services/storage';
import type { Invoice, Patient, Product, InvoiceItem } from '../../types';

const InvoiceList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const settings = settingsService.get();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientId: '',
    branchId: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as InvoiceItem[],
    discountPercentage: 0,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setInvoices(invoiceService.getAll());
    setPatients(patientService.getAll());
    setProducts(productService.getAll());
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.fullName || '';

  const getStatusBadge = (status: Invoice['paymentStatus']) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      paid: 'success',
      partial: 'warning',
      unpaid: 'danger'
    };
    return <Badge variant={variants[status]}>{t(`invoices.statuses.${status}`)}</Badge>;
  };

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} ${settings.currencySymbol}`;

  const openAddModal = () => {
    setEditingInvoice(null);
    setFormData({
      patientId: '',
      branchId: branchService.getAll()[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      items: [{ id: Date.now().toString(), productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }],
      discountPercentage: 0,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now().toString(), productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }]
    });
  };

  const removeItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setFormData({
      ...formData,
      items: formData.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
              updated.productName = product.name;
              updated.unitPrice = product.price;
              updated.total = product.price * updated.quantity;
            }
          }
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = subtotal * (formData.discountPercentage / 100);
    const total = subtotal - discountAmount;
    return { subtotal, discountAmount, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, discountAmount, total } = calculateTotals();
    const invoiceData = {
      patientId: formData.patientId,
      branchId: formData.branchId,
      date: formData.date,
      items: formData.items,
      subtotal,
      discountPercentage: formData.discountPercentage,
      discountAmount,
      total,
      paidAmount: 0,
      paymentStatus: 'unpaid' as const,
      notes: formData.notes
    };
    invoiceService.create(invoiceData);
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      invoiceService.delete(id);
      loadData();
    }
    setActiveMenu(null);
  };

  const patientOptions = [
    { value: '', label: isRTL ? 'اختر العميل' : 'Select Customer' },
    ...patients.map(p => ({ value: p.id, label: p.fullName }))
  ];

  const productOptions = [
    { value: '', label: isRTL ? 'اختر المنتج/الخدمة' : 'Select Product/Service' },
    ...products.filter(p => p.status === 'active').map(p => ({ value: p.id, label: `${p.name} - ${formatCurrency(p.price)}` }))
  ];

  const { subtotal, discountAmount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('invoices.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('invoices.subtitle')}</p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />}>{t('invoices.addInvoice')}</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'paid', 'partial', 'unpaid'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilterStatus(status)}
          >
            {status === 'all' ? t('common.all') : t(`invoices.statuses.${status}`)}
          </Button>
        ))}
      </div>

      <div className="max-w-md">
        <Input
          placeholder={isRTL ? 'البحث برقم الفاتورة...' : 'Search by invoice number...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      <Card padding="none">
        {filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('invoices.invoiceNumber')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('invoices.customer')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('common.date')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('invoices.total')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('invoices.paidAmount')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('invoices.paymentStatus')}</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="border-t border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-primary-500" />
                        <span className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{getPatientName(invoice.patientId)}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{invoice.date}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{formatCurrency(invoice.total)}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{formatCurrency(invoice.paidAmount)}</td>
                    <td className="py-3 px-4">{getStatusBadge(invoice.paymentStatus)}</td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button onClick={() => setActiveMenu(activeMenu === invoice.id ? null : invoice.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600">
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>
                        {activeMenu === invoice.id && (
                          <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 w-40 bg-white dark:bg-dark-700 rounded-lg shadow-lg border dark:border-dark-600 py-1 z-10`}>
                            <button className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-2">
                              <Printer size={14} />{t('common.print')}
                            </button>
                            <button className="w-full px-4 py-2 text-right text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2">
                              <DollarSign size={14} />{isRTL ? 'تسجيل دفعة' : 'Add Payment'}
                            </button>
                            <button onClick={() => handleDelete(invoice.id)} className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
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
          <EmptyState title={t('common.noData')} action={<Button onClick={openAddModal} icon={<Plus size={18} />}>{t('invoices.addInvoice')}</Button>} />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('invoices.addInvoice')} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label={t('invoices.customer')} value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} options={patientOptions} required />
            <Input label={t('common.date')} type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          </div>

          <div className="border-t border-b border-gray-200 dark:border-dark-700 py-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t('invoices.items')}</h3>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Select
                      label={index === 0 ? (isRTL ? 'المنتج/الخدمة' : 'Product/Service') : undefined}
                      value={item.productId}
                      onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                      options={productOptions}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? t('products.quantity') : undefined}
                      type="number"
                      min="1"
                      value={item.quantity.toString()}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? t('products.price') : undefined}
                      type="number"
                      value={item.unitPrice.toString()}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? t('invoices.total') : undefined}
                      type="number"
                      value={item.total.toString()}
                      disabled
                    />
                  </div>
                  <div className="col-span-1">
                    {formData.items.length > 1 && (
                      <Button type="button" variant="danger" size="sm" onClick={() => removeItem(item.id)}>✕</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={addItem} icon={<Plus size={16} />}>
              {t('invoices.addItem')}
            </Button>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('invoices.subtotal')}:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{t('invoices.discount')} (%):</span>
                <input
                  type="number"
                  className="w-20 px-2 py-1 text-center border rounded-lg dark:bg-dark-700 dark:border-dark-600"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex justify-between text-sm text-red-500">
                <span>{t('invoices.discount')}:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 dark:border-dark-700">
                <span>{t('invoices.total')}:</span>
                <span className="text-primary-500">{formatCurrency(total)}</span>
              </div>
            </div>
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

export default InvoiceList;
