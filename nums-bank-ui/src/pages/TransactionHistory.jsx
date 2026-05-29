import React, { useState, useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import StatementDownloadModal from '../components/UI/StatementDownloadModal';
import toast from 'react-hot-toast';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import jsPDF from 'jspdf';

export const TransactionHistory = () => {
  const { user } = useAuth();
  const { getAccountSummary, getTransactionHistory, loading } = useTransactions();

  // Core Data States
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL'); // ALL, CREDIT, DEBIT
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // ALL, SUCCESS, PENDING, FAILED
  const [dateFilter, setDateFilter] = useState('30'); // 7, 30, 90, year, month, custom, all
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Statement Download Modal
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  // Expandable Row State (Store ID of expanded transaction)
  const [expandedTxnId, setExpandedTxnId] = useState(null);

  // Financial aggregates state
  const [aggregates, setAggregates] = useState({ credit: 0, debit: 0 });

  // Load accounts once on mount
  useEffect(() => {
    const loadAccounts = async () => {
      const summaryRes = await getAccountSummary();
      if (summaryRes.success) {
        setAccounts(summaryRes.data.accounts || []);
      }
    };
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTransactions = async () => {
    let fromDate = null;
    let toDate = null;

    const today = new Date();
    if (dateFilter === '7') {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 7);
      fromDate = pastDate.toISOString().split('T')[0];
      toDate = today.toISOString().split('T')[0];
    } else if (dateFilter === '30') {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 30);
      fromDate = pastDate.toISOString().split('T')[0];
      toDate = today.toISOString().split('T')[0];
    } else if (dateFilter === '90') {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 90);
      fromDate = pastDate.toISOString().split('T')[0];
      toDate = today.toISOString().split('T')[0];
    } else if (dateFilter === 'year') {
      fromDate = `${selectedYear}-01-01`;
      toDate = `${selectedYear}-12-31`;
    } else if (dateFilter === 'month') {
      const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
      const monthEnd = new Date(selectedYear, selectedMonth, 0);
      fromDate = monthStart.toISOString().split('T')[0];
      toDate = monthEnd.toISOString().split('T')[0];
    } else if (dateFilter === 'custom' && customFromDate && customToDate) {
      fromDate = customFromDate;
      toDate = customToDate;
    }
    // dateFilter === 'all' → fromDate and toDate remain null → backend returns all

    const payload = {
      page: currentPage,
      size: pageSize,
      fromDate,
      toDate,
      type: selectedType,
      status: selectedStatus,
    };

    const historyRes = await getTransactionHistory(payload);

    if (historyRes.success) {
      const content = historyRes.data.content || [];
      setTransactions(content);
      setTotalPages(historyRes.data.totalPages || 1);
      setTotalElements(historyRes.data.totalElements || 0);

      // Recalculate aggregates from current page
      const accNumbers = accounts.map(a => a.accountNumber);
      let totalCredit = 0;
      let totalDebit = 0;
      content.forEach(t => {
        if (t.status === 'SUCCESS') {
          const isDebit = t.fromAccount && accNumbers.includes(t.fromAccount.accountNumber);
          if (isDebit) totalDebit += parseFloat(t.amount);
          else totalCredit += parseFloat(t.amount);
        }
      });
      setAggregates({ credit: totalCredit, debit: totalDebit });
    }
  };

  useEffect(() => {
    if (accounts.length > 0 || dateFilter || selectedType || selectedStatus) {
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, selectedType, selectedStatus, dateFilter, customFromDate, customToDate, selectedYear, selectedMonth, accounts]);

  const handleRowClick = (txnId) => {
    setExpandedTxnId(expandedTxnId === txnId ? null : txnId);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      Toast.error('No transaction records available to export.');
      return;
    }

    try {
      const accNumbers = accounts.map(a => a.accountNumber);
      const headers = ['Transaction ID', 'Timestamp', 'Remarks', 'Type', 'Amount (INR)', 'Status'];
      const rows = transactions.map(t => {
        const isDebit = t.fromAccount && accNumbers.includes(t.fromAccount.accountNumber);
        return [
          t.transactionId,
          new Date(t.createdAt).toLocaleString('en-IN'),
          t.remarks || 'NetBanking Outbound Transfer',
          isDebit ? 'DEBIT' : 'CREDIT',
          t.amount,
          t.status,
        ];
      });

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `NumsBank_Statement_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Toast.success('CSV Statement exported successfully.');
    } catch (err) {
      Toast.error('CSV export failed.');
    }
  };

  // PDF Exporter with filtering
  const handleExportPDF = async ({ accountNumber, fromDate, toDate }) => {
    if (accounts.length === 0) {
      Toast.error('No accounts available.');
      return;
    }

    try {
      const loadingToast = Toast.loading('Fetching transactions for statement...');
      
      // Fetch all transactions for the selected account and date range
      const payload = {
        page: 0,
        size: 1000, // Fetch all transactions
        fromDate,
        toDate,
        accountNumber,
      };
      
      const historyResult = await getTransactionHistory(payload);
      const allTransactions = historyResult.success ? (historyResult.data.content || []) : [];
      
      toast.dismiss(loadingToast);
      
      if (allTransactions.length === 0) {
        Toast.error('No transactions found for the selected period.');
        return;
      }

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.text('NUMS BANK LTD.', 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Statement for: ${user?.fullName}`, 14, 30);
      doc.text(`Email: ${user?.email}`, 14, 36);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, 14, 42);
      
      if (fromDate && toDate) {
        doc.text(`Period: ${new Date(fromDate).toLocaleDateString('en-IN')} to ${new Date(toDate).toLocaleDateString('en-IN')}`, 14, 48);
      } else {
        doc.text('Period: All Time', 14, 48);
      }
      
      // Account Summary
      doc.setFontSize(12);
      doc.text('Account Summary:', 14, 60);
      
      let y = 68;
      accounts.forEach((acc) => {
        doc.setFontSize(10);
        doc.text(`${acc.accountType} (${acc.accountNumber}): Rs. ${parseFloat(acc.balance).toLocaleString('en-IN')}`, 14, y);
        y += 7;
      });
      
      // Table Header
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      // Draw table header background
      doc.setFillColor(200, 200, 200);
      doc.rect(14, y - 5, 182, 10, 'F');
      
      // Table headers
      doc.text('Date', 16, y);
      doc.text('Transaction ID', 50, y);
      doc.text('Description', 100, y);
      doc.text('Type', 150, y);
      doc.text('Amount', 175, y);
      
      y += 12;
      
      // Table rows
      doc.setFont('helvetica', 'normal');
      const accNumbers = accounts.map(a => a.accountNumber);
      
      allTransactions.forEach((t) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
          
          // Repeat header on new page
          doc.setFont('helvetica', 'bold');
          doc.setFillColor(200, 200, 200);
          doc.rect(14, y - 5, 182, 10, 'F');
          doc.text('Date', 16, y);
          doc.text('Transaction ID', 50, y);
          doc.text('Description', 100, y);
          doc.text('Type', 150, y);
          doc.text('Amount', 175, y);
          y += 12;
          doc.setFont('helvetica', 'normal');
        }
        
        const dateStr = new Date(t.createdAt).toLocaleDateString('en-IN');
        const desc = (t.remarks || 'Funds Transfer').substring(0, 25);
        const isDebit = t.fromAccount && accNumbers.includes(t.fromAccount.accountNumber);
        
        // Draw row border
        doc.setDrawColor(200, 200, 200);
        doc.line(14, y - 3, 196, y - 3);
        
        doc.text(dateStr, 16, y);
        doc.text(t.transactionId.substring(0, 15), 50, y);
        doc.text(desc, 100, y);
        doc.text(isDebit ? 'DEBIT' : 'CREDIT', 150, y);
        doc.text(`${isDebit ? '-' : ''}Rs. ${parseFloat(t.amount).toLocaleString('en-IN')}`, 175, y);
        
        y += 8;
      });
      
      // Table bottom border
      doc.line(14, y - 3, 196, y - 3);
      
      // Footer
      doc.setFontSize(8);
      doc.text(`Total Transactions: ${allTransactions.length}`, 14, 285);
      doc.text('This is a computer-generated statement.', 14, 290);

      doc.save(`NumsBank_Statement_${user?.fullName.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      Toast.success('PDF Statement downloaded successfully.');
    } catch (err) {
      console.error('PDF generation failed:', err);
      Toast.error('PDF statement generation failed.');
    }
  };

  const accNumbers = accounts.map(a => a.accountNumber);
  
  // Filter transactions in memory based on search query
  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      t.transactionId.toLowerCase().includes(query) ||
      (t.remarks && t.remarks.toLowerCase().includes(query)) ||
      t.toAccountNumber.toLowerCase().includes(query)
    );
  });

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'FAILED':
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans pb-24 lg:pb-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5.5 h-5.5 text-indigo-500" />
            <span>Digital Netbanking Statements Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Search, filter, review, and download CSV/PDF transaction receipts.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="flex gap-2 items-center text-xs font-semibold py-2">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button variant="outline" onClick={() => setIsStatementModalOpen(true)} className="flex gap-2 items-center text-xs font-semibold py-2">
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        <Card className="p-5 flex items-center justify-between border-l-4 border-emerald-500 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Account Credit Credits</span>
            <span className="text-xl font-extrabold text-emerald-500 font-sans">{formatCurrency(aggregates.credit)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-l-4 border-red-500 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Account Debit Debits</span>
            <span className="text-xl font-extrabold text-red-500 font-sans">{formatCurrency(aggregates.debit)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filtering Box Panel */}
      <Card className="p-5 flex flex-col gap-4 border border-slate-100 dark:border-navy-800">
        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 self-center mr-2">Quick Filters:</span>
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedType === 'ALL'
                ? 'bg-[#FFD700] text-[#0A1926] font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType('CREDIT')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedType === 'CREDIT'
                ? 'bg-emerald-500 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Credits
          </button>
          <button
            onClick={() => setSelectedType('DEBIT')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedType === 'DEBIT'
                ? 'bg-red-500 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Debits
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedStatus === 'ALL'
                ? 'bg-[#FFD700] text-[#0A1926] font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setSelectedStatus('SUCCESS')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedStatus === 'SUCCESS'
                ? 'bg-emerald-500 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setSelectedStatus('PENDING')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedStatus === 'PENDING'
                ? 'bg-amber-500 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedStatus('FAILED')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedStatus === 'FAILED'
                ? 'bg-red-500 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Failed
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="md:col-span-2 relative flex items-center">
            <Input
              placeholder="Search by Txn ID, beneficiary account number, remarks..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Date range chips selection */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Range Filter</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
            >
              <option value="all">Lifetime Account Logs</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="year">By Year</option>
              <option value="month">By Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Page size selections */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Items Per Page</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
            >
              <option value={10}>10 items</option>
              <option value={25}>25 items</option>
              <option value={50}>50 items</option>
            </select>
          </div>
        </div>

        {/* Custom date range display panels */}
        {dateFilter === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-100 dark:border-navy-800 animate-in fade-in duration-200">
            <Input
              label="Statement Starting Date"
              type="date"
              icon={Calendar}
              value={customFromDate}
              onChange={(e) => setCustomFromDate(e.target.value)}
            />
            <Input
              label="Statement Ending Date"
              type="date"
              icon={Calendar}
              value={customToDate}
              onChange={(e) => setCustomToDate(e.target.value)}
            />
          </div>
        )}

        {/* Year selection */}
        {dateFilter === 'year' && (
          <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-100 dark:border-navy-800 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Month selection */}
        {dateFilter === 'month' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-100 dark:border-navy-800 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
              >
                {[
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
                ].map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Chips selector grid */}
        <div className="flex flex-wrap gap-2 items-center border-t border-slate-100 dark:border-navy-800 pt-4 select-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Filter chips:</span>
          {/* Type chips */}
          {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
            <button
              key={type}
              onClick={() => { setSelectedType(type); setCurrentPage(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedType === type
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 dark:bg-navy-900 dark:border-navy-800 dark:text-slate-400'
              }`}
            >
              {type}
            </button>
          ))}

          <span className="w-px h-5 bg-slate-200 dark:bg-navy-800 mx-2" />

          {/* Status chips */}
          {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => { setSelectedStatus(status); setCurrentPage(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedStatus === status
                  ? 'bg-[#FFD700] text-slate-900 dark:text-[#0A1926] border-[#FFD700] shadow-md'
                  : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 dark:bg-navy-900 dark:border-navy-800 dark:text-slate-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Ledger Table Card */}
      <Card className="p-6">
        {loading ? (
          <div className="w-full py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-navy-700 scrollbar-track-transparent">
            <table className="w-full text-left border-collapse font-sans min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-navy-500 border-b border-slate-100 dark:border-navy-800 select-none">
                  <th className="py-3 px-4">Ledger ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Target / Description</th>
                  <th className="py-3 px-4 text-center">Transfer Type</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-xs">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400 font-bold select-none">
                      No matching transaction entries discovered in active bounds.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => {
                    const isDebit = txn.fromAccount && accNumbers.includes(txn.fromAccount.accountNumber);
                    const isExpanded = expandedTxnId === txn.id;

                    return (
                      <React.Fragment key={txn.id}>
                        {/* Summary Row */}
                        <tr 
                          onClick={() => handleRowClick(txn.id)}
                          className="hover:bg-slate-50/50 dark:hover:bg-navy-850 transition-all cursor-pointer"
                        >
                          <td className="py-4 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                            {txn.transactionId}
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-400 dark:text-slate-500">
                            {formatDate(txn.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isDebit 
                                  ? 'bg-red-50 text-red-500 dark:bg-red-950/20' 
                                  : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20'
                              }`}>
                                {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 dark:text-slate-200">
                                  {txn.remarks || (isDebit ? 'Outgoing Transfer' : 'Cash Deposit')}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {isDebit ? `To Account: ${txn.toAccountNumber}` : 'Inbound Credit'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/20 rounded text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                              {txn.transactionType}
                            </span>
                          </td>
                          <td className={`py-4 px-4 text-right font-extrabold text-sm font-sans ${
                            isDebit ? 'text-red-500' : 'text-emerald-500'
                          }`}>
                            {isDebit ? '-' : '+'}{formatCurrency(txn.amount)}
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <div className="flex items-center justify-center gap-1.5">
                              {getStatusIcon(txn.status)}
                              <span className="font-bold capitalize">{txn.status?.toLowerCase()}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </td>
                        </tr>

                        {/* Detailed Expandable Section */}
                        {isExpanded && (
                          <tr className="bg-slate-50/40 dark:bg-navy-950/20">
                            <td colSpan="7" className="py-4 px-6 border-b border-slate-100 dark:border-navy-800">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs animate-in slide-in-from-top-2 duration-200">
                                {/* Sender details */}
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400">Origin / Debited Account</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-350">
                                    {txn.fromAccount ? `${txn.fromAccount.accountType} (${txn.fromAccount.accountNumber})` : 'Cheque / Cash Inbound deposit'}
                                  </span>
                                  {txn.fromAccount && (
                                    <span className="text-[10px] text-slate-400">
                                      Owner Profile: {txn.fromAccount.user?.fullName}
                                    </span>
                                  )}
                                </div>

                                {/* Receiver details */}
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400">Beneficiary Destination Payee</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-350">
                                    Account Number: {txn.toAccountNumber}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Audit remarks: {txn.remarks || 'Standard Transaction'}
                                  </span>
                                </div>

                                {/* Receipt coordinates */}
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400">Receipt Details</span>
                                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                                    Status: <span className="font-bold uppercase tracking-wider text-emerald-500">{txn.status}</span>
                                  </span>
                                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                                    Channel Type: {txn.transactionType}
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-navy-800 pt-5 mt-4 select-none">
          <span className="text-xs text-slate-400 dark:text-navy-500 font-medium">
            Showing <span className="font-bold text-slate-600 dark:text-slate-300">{Math.min(currentPage * pageSize + 1, totalElements)}</span>-<span className="font-bold text-slate-600 dark:text-slate-300">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> of <span className="font-bold text-slate-600 dark:text-slate-300">{totalElements}</span> entries
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 0 || loading}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              className="py-1.5 px-3 text-xs font-semibold"
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage <= 2) {
                  pageNum = i;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === pageNum
                        ? 'bg-[#FFD700] text-[#0A1926] font-bold'
                        : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              disabled={currentPage >= totalPages - 1 || loading}
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              className="py-1.5 px-3 text-xs font-semibold"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Statement Download Modal */}
      <StatementDownloadModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        onDownload={handleExportPDF}
        accounts={accounts}
      />
    </div>
  );
};
export default TransactionHistory;
