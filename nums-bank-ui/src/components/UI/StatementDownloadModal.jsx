import React, { useState } from 'react';
import { Calendar, Download, X } from 'lucide-react';
import Button from './Button';
import Input from './Input';

export const StatementDownloadModal = ({ isOpen, onClose, onDownload, accounts = [] }) => {
  const [filterType, setFilterType] = useState('all'); // all, last7, last30, last90, custom, year, month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(accounts.length > 0 ? accounts[0].accountNumber : '');
  const [loading, setLoading] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const handleDownload = async () => {
    let fromDate = null;
    let toDate = null;
    const today = new Date();

    switch (filterType) {
      case 'last7':
        const past7 = new Date();
        past7.setDate(today.getDate() - 7);
        fromDate = past7.toISOString().split('T')[0];
        toDate = today.toISOString().split('T')[0];
        break;
      case 'last30':
        const past30 = new Date();
        past30.setDate(today.getDate() - 30);
        fromDate = past30.toISOString().split('T')[0];
        toDate = today.toISOString().split('T')[0];
        break;
      case 'last90':
        const past90 = new Date();
        past90.setDate(today.getDate() - 90);
        fromDate = past90.toISOString().split('T')[0];
        toDate = today.toISOString().split('T')[0];
        break;
      case 'year':
        fromDate = `${selectedYear}-01-01`;
        toDate = `${selectedYear}-12-31`;
        break;
      case 'month':
        const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
        const monthEnd = new Date(selectedYear, selectedMonth, 0);
        fromDate = monthStart.toISOString().split('T')[0];
        toDate = monthEnd.toISOString().split('T')[0];
        break;
      case 'custom':
        if (!customFromDate || !customToDate) {
          alert('Please select both from and to dates');
          return;
        }
        fromDate = customFromDate;
        toDate = customToDate;
        break;
      case 'all':
      default:
        // No date filter
        break;
    }

    setLoading(true);
    try {
      await onDownload({
        accountNumber: selectedAccount,
        fromDate,
        toDate,
      });
      onClose();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-gold-glow p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Download className="w-5 h-5 text-[#FFD700]" />
            Download Statement
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Account Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm"
            >
              {accounts.map((acc) => (
                <option key={acc.accountNumber} value={acc.accountNumber}>
                  {acc.accountType} ({acc.accountNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Type Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Date Range Filter
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'last7', label: 'Last 7 Days' },
                { value: 'last30', label: 'Last 30 Days' },
                { value: 'last90', label: 'Last 90 Days' },
                { value: 'year', label: 'By Year' },
                { value: 'month', label: 'By Month' },
                { value: 'custom', label: 'Custom Range' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilterType(option.value)}
                  className={`px-3 py-2 text-xs font-bold rounded-md transition-all ${
                    filterType === option.value
                      ? 'bg-[#FFD700] text-slate-900 dark:text-[#0A1926] shadow-gold-glow'
                      : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Year Selection */}
          {filterType === 'year' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Month Selection */}
          {filterType === 'month' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Custom Date Range */}
          {filterType === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  From Date
                </label>
                <Input
                  type="date"
                  value={customFromDate}
                  onChange={(e) => setCustomFromDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  To Date
                </label>
                <Input
                  type="date"
                  value={customToDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Download Button */}
          <Button onClick={handleDownload} loading={loading} className="w-full mt-2">
            Download PDF Statement
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatementDownloadModal;
