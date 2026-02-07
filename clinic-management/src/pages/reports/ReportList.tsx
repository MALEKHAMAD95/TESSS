import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, DollarSign, Calendar, Download, FileText } from 'lucide-react';
import { Card, Button, StatCard } from '../../components/common';
import { invoiceService, receiptService, settingsService } from '../../services/storage';

const ReportList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const settings = settingsService.get();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const invoices = invoiceService.getAll();
  const receipts = receiptService.getAll();

  // Filter by date range
  const filteredInvoices = invoices.filter(i => i.date >= dateRange.from && i.date <= dateRange.to);
  const filteredReceipts = receipts.filter(r => r.date >= dateRange.from && r.date <= dateRange.to);

  // Calculate stats
  const totalSales = filteredInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalCollected = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
  const totalPending = filteredInvoices.reduce((sum, i) => sum + (i.total - i.paidAmount), 0);
  const invoiceCount = filteredInvoices.length;

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} ${settings.currencySymbol}`;

  // Group receipts by payment method
  const paymentMethodStats = filteredReceipts.reduce((acc, r) => {
    acc[r.paymentMethod] = (acc[r.paymentMethod] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group sales by day
  const dailySales = filteredInvoices.reduce((acc, inv) => {
    acc[inv.date] = (acc[inv.date] || 0) + inv.total;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('reports.subtitle')}</p>
        </div>
        <Button variant="outline" icon={<Download size={18} />}>{t('common.export')}</Button>
      </div>

      {/* Date Range */}
      <Card>
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">{t('reports.dateRange')}</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-500 mb-1">{t('reports.fromDate')}</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">{t('reports.toDate')}</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          <Button icon={<BarChart3 size={18} />}>{t('reports.generateReport')}</Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isRTL ? 'إجمالي المبيعات' : 'Total Sales'}
          value={formatCurrency(totalSales)}
          icon={<DollarSign className="w-6 h-6 text-primary-500" />}
          iconBg="bg-primary-100 dark:bg-primary-900/30"
        />
        <StatCard
          title={isRTL ? 'المبالغ المحصلة' : 'Collected Amount'}
          value={formatCurrency(totalCollected)}
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          iconBg="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title={isRTL ? 'المبالغ المعلقة' : 'Pending Amount'}
          value={formatCurrency(totalPending)}
          icon={<Calendar className="w-6 h-6 text-orange-500" />}
          iconBg="bg-orange-100 dark:bg-orange-900/30"
        />
        <StatCard
          title={isRTL ? 'عدد الفواتير' : 'Invoice Count'}
          value={invoiceCount}
          icon={<FileText className="w-6 h-6 text-blue-500" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
      </div>

      {/* Payment Methods Breakdown */}
      <Card>
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          {isRTL ? 'توزيع طرق الدفع' : 'Payment Methods Breakdown'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(paymentMethodStats).map(([method, amount]) => (
            <div key={method} className="p-4 rounded-lg bg-gray-50 dark:bg-dark-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t(`receipts.methods.${method}`)}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(amount)}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Daily Sales Chart Placeholder */}
      <Card>
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          {isRTL ? 'المبيعات اليومية' : 'Daily Sales'}
        </h3>
        <div className="space-y-2">
          {Object.entries(dailySales).slice(-7).map(([date, amount]) => (
            <div key={date} className="flex items-center gap-4">
              <span className="w-24 text-sm text-gray-500">{date}</span>
              <div className="flex-1 bg-gray-200 dark:bg-dark-600 rounded-full h-6 overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${Math.min((amount / Math.max(...Object.values(dailySales))) * 100, 100)}%` }}
                >
                  <span className="text-xs text-white font-medium">{formatCurrency(amount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          {isRTL ? 'آخر الفواتير' : 'Recent Invoices'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-700">
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">{t('invoices.invoiceNumber')}</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">{t('common.date')}</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">{t('invoices.total')}</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">{t('invoices.paidAmount')}</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">{t('invoices.paymentStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.slice(-10).reverse().map(inv => (
                <tr key={inv.id} className="border-b border-gray-100 dark:border-dark-700">
                  <td className="py-2 px-4 font-medium">{inv.invoiceNumber}</td>
                  <td className="py-2 px-4 text-gray-600 dark:text-gray-300">{inv.date}</td>
                  <td className="py-2 px-4 font-medium">{formatCurrency(inv.total)}</td>
                  <td className="py-2 px-4 text-gray-600 dark:text-gray-300">{formatCurrency(inv.paidAmount)}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      inv.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      inv.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {t(`invoices.statuses.${inv.paymentStatus}`)}
                    </span>
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

export default ReportList;
