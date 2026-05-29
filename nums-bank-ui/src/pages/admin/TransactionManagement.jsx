import React, { useState, useEffect } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Toast from '../../components/UI/Toast';
import { 
  ArrowLeftRight, 
  Search, 
  Filter,
  RotateCcw,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import api from '../../services/api';

export const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [suspiciousTransactions, setSuspiciousTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeTab, setActiveTab] = useState('all');
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/transactions?page=0&size=100');
      const txnContent = res.data?.content || res.data || [];
      setTransactions(Array.isArray(txnContent) ? txnContent : []);
      setFilteredTransactions(Array.isArray(txnContent) ? txnContent : []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      Toast.error('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuspiciousTransactions = async () => {
    try {
      const res = await api.get('/admin/transactions/suspicious');
      setSuspiciousTransactions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch suspicious transactions:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchSuspiciousTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(txn =>
        txn.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.toAccountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.fromAccount?.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(txn => txn.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, filterStatus, transactions]);

  const handleReverseTransaction = async (transactionId) => {
    if (!confirm('Are you sure you want to reverse this transaction? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/admin/transactions/${transactionId}/reverse`);
      Toast.success('Transaction reversed successfully.');
      fetchTransactions();
      if (isDetailModalOpen) setIsDetailModalOpen(false);
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to reverse transaction.');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailModal = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'REVERSED':
        return <RotateCcw className="w-4 h-4 text-slate-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const displayedTransactions = activeTab === 'suspicious' ? suspiciousTransactions : filteredTransactions;

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-[#FFD700]" />
          <span>Transaction Management</span>
        </h2>
        <p className="text-sm text-slate-400">
          Monitor, reverse, and manage all bank transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Transactions</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{transactions.length}</p>
          </div>
          <ArrowLeftRight className="w-10 h-10 text-indigo-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Successful</p>
            <p className="text-2xl font-extrabold text-emerald-500">{transactions.filter(t => t.status === 'SUCCESS').length}</p>
          </div>
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Failed</p>
            <p className="text-2xl font-extrabold text-red-500">{transactions.filter(t => t.status === 'FAILED').length}</p>
          </div>
          <XCircle className="w-10 h-10 text-red-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Suspicious</p>
            <p className="text-2xl font-extrabold text-amber-500">{suspiciousTransactions.length}</p>
          </div>
          <AlertTriangle className="w-10 h-10 text-amber-500" />
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-[#FFD700] text-[#0A1926] font-bold'
              : 'bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-800'
          }`}
        >
          All Transactions
        </button>
        <button
          onClick={() => setActiveTab('suspicious')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'suspicious'
              ? 'bg-[#FFD700] text-[#0A1926] font-bold'
              : 'bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-800'
          }`}
        >
          Suspicious ({suspiciousTransactions.length})
        </button>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
              <option value="REVERSED">Reversed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-6">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-navy-700 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse text-xs min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-navy-800">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">From Account</th>
                <th className="py-3 px-4">To Account</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-500">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center font-bold text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-850 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-350">
                      {txn.transactionId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(txn.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {txn.fromAccount?.accountNumber || 'SYSTEM'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-350">
                      {txn.toAccountNumber}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-800 dark:text-slate-200">
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-bold">
                        {getStatusIcon(txn.status)}
                        <span className={
                          txn.status === 'SUCCESS' ? 'text-emerald-500' :
                          txn.status === 'FAILED' ? 'text-red-500' :
                          txn.status === 'PENDING' ? 'text-amber-500' :
                          'text-slate-500'
                        }>
                          {txn.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => openDetailModal(txn)}
                          className="py-1 px-2 text-[10px]"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        {txn.status === 'SUCCESS' && (
                          <Button
                            variant="outline"
                            onClick={() => handleReverseTransaction(txn.transactionId)}
                            loading={actionLoading}
                            className="py-1 px-2 text-[10px] text-red-500 border-red-500 hover:bg-red-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Transaction Details"
      >
        {selectedTransaction && (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Transaction ID</p>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedTransaction.transactionId}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">From Account</p>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedTransaction.fromAccount?.accountNumber || 'SYSTEM'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">To Account</p>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedTransaction.toAccountNumber}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-950 dark:to-navy-900 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Amount</p>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-200">
                {formatCurrency(selectedTransaction.amount)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedTransaction.status)}
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTransaction.status}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Date</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{formatDate(selectedTransaction.createdAt)}</p>
              </div>
            </div>

            {selectedTransaction.remarks && (
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Remarks</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{selectedTransaction.remarks}</p>
              </div>
            )}

            {selectedTransaction.status === 'SUCCESS' && (
              <Button
                onClick={() => handleReverseTransaction(selectedTransaction.transactionId)}
                loading={actionLoading}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reverse Transaction
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransactionManagement;
