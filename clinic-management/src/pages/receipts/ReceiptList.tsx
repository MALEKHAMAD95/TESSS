import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Receipt, Printer, Trash2, MoreVertical, CreditCard, Banknote, Wallet } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, EmptyState, Select } from '../../components/common';
import { receiptService, invoiceService, patientService, settingsService } from '../../services/storage';
import type { Receipt as ReceiptType, Invoice } from '../../types';

const ReceiptList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const settings = settingsService.get();
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: 0,
    paymentMethod: 'cash' as ReceiptType['paymentMethod'],
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setReceipts(receiptService.getAll());
    setInvoices(invoiceService.getAll());
  };

  const filteredReceipts = receipts.filter(r =>
    r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} ${settings.currencySymbol}`;

  const getInvoiceInfo = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return { number: '', patient: '' };
    const patient = patientService.getById(invoice.patientId);
    return { number: invoice.invoiceNumber, patient: patient?.fullName || '' };
  };

  const getMethodIcon = (method: ReceiptType['paymentMethod']) => {
    const icons = {
      cash: <Banknote size={16} className="text-green-500" />,
      card: <CreditCard size={16} className="text-blue-500" />,
      transfer: <Receipt size={16} className="text-purple-500" />,
      wallet: <Wallet size={16} className="text-orange-500" />
    };
    return icons[method];
  };

  const openAddModal = () => {
    setFormData({
      invoiceId: '',
      amount: 0,
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    receiptService.create(formData);
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      receiptService.delete(id);
      loadData();
    }
    setActiveMenu(null);
  };

  const unpaidInvoices = invoices.filter(i => i.paymentStatus !== 'paid');
  const invoiceOptions = [
    { value: '', label: isRTL ? 'اختر الفاتورة' : 'Select Invoice' },
    ...unpaidInvoices.map(i => {
      const patient = patientService.getById(i.patientId);
      const remaining = i.total - i.paidAmount;
      return { 
        value: i.id, 
        label: `${i.invoiceNumber} - ${patient?.fullName || ''} (${formatCurrency(remaining)} ${isRTL ? 'متبقي' : 'remaining'})` 
      };
    })
  ];

  const methodOptions = [
    { value: 'cash', label: t('receipts.methods.cash') },
    { value: 'card', label: t('receipts.methods.card') },
    { value: 'transfer', label: t('receipts.methods.transfer') },
    { value: 'wallet', label: t('receipts.methods.wallet') }
  ];

  const selectedInvoice = invoices.find(i => i.id === formData.invoiceId);
  const maxAmount = selectedInvoice ? selectedInvoice.total - selectedInvoice.paidAmount : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('receipts.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('receipts.subtitle')}</p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />}>{t('receipts.addReceipt')}</Button>
      </div>

      <div className="max-w-md">
        <Input
          placeholder={isRTL ? 'البحث برقم الإيصال...' : 'Search by receipt number...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      <Card padding="none">
        {filteredReceipts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('receipts.receiptNumber')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('invoices.invoiceNumber')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('invoices.customer')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('receipts.amount')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('receipts.paymentMethod')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('common.date')}</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map(receipt => {
                  const invoiceInfo = getInvoiceInfo(receipt.invoiceId);
                  return (
                    <tr key={receipt.id} className="border-t border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Receipt size={16} className="text-green-500" />
                          <span className="font-medium text-gray-900 dark:text-white">{receipt.receiptNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{invoiceInfo.number}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{invoiceInfo.patient}</td>
                      <td className="py-3 px-4 font-medium text-green-600">{formatCurrency(receipt.amount)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(receipt.paymentMethod)}
                          <span className="text-gray-600 dark:text-gray-300">{t(`receipts.methods.${receipt.paymentMethod}`)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{receipt.date}</td>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <button onClick={() => setActiveMenu(activeMenu === receipt.id ? null : receipt.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600">
                            <MoreVertical size={18} className="text-gray-500" />
                          </button>
                          {activeMenu === receipt.id && (
                            <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 w-32 bg-white dark:bg-dark-700 rounded-lg shadow-lg border dark:border-dark-600 py-1 z-10`}>
                              <button className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-2">
                                <Printer size={14} />{t('common.print')}
                              </button>
                              <button onClick={() => handleDelete(receipt.id)} className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                <Trash2 size={14} />{t('common.delete')}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title={t('common.noData')} action={<Button onClick={openAddModal} icon={<Plus size={18} />}>{t('receipts.addReceipt')}</Button>} />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('receipts.addReceipt')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label={t('invoices.invoiceNumber')}
            value={formData.invoiceId}
            onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
            options={invoiceOptions}
            required
          />
          
          {selectedInvoice && (
            <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('invoices.total')}:</span>
                <span>{formatCurrency(selectedInvoice.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('invoices.paidAmount')}:</span>
                <span>{formatCurrency(selectedInvoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-medium text-primary-500">
                <span>{t('invoices.remaining')}:</span>
                <span>{formatCurrency(maxAmount)}</span>
              </div>
            </div>
          )}

          <Input
            label={t('receipts.amount')}
            type="number"
            value={formData.amount.toString()}
            onChange={(e) => setFormData({ ...formData, amount: Math.min(parseFloat(e.target.value) || 0, maxAmount) })}
            max={maxAmount}
            required
          />

          <Select
            label={t('receipts.paymentMethod')}
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as ReceiptType['paymentMethod'] })}
            options={methodOptions}
            required
          />

          <Input
            label={t('common.date')}
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Input
            label={t('common.notes')}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

export default ReceiptList;
