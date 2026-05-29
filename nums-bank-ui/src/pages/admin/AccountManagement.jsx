import React, { useState, useEffect } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Modal from '../../components/UI/Modal';
import Toast from '../../components/UI/Toast';
import { 
  Wallet, 
  Plus, 
  Search, 
  Filter,
  Snowflake,
  Lock,
  Unlock,
  Edit,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import api from '../../services/api';

export const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    accountType: 'SAVINGS',
    initialBalance: ''
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/accounts');
      setAccounts(res.data || []);
      setFilteredAccounts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      Toast.error('Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    let filtered = accounts;

    if (searchTerm) {
      filtered = filtered.filter(acc =>
        acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(acc => {
        if (filterStatus === 'ACTIVE') return acc.isActive;
        if (filterStatus === 'FROZEN') return !acc.isActive;
        return true;
      });
    }

    setFilteredAccounts(filtered);
  }, [searchTerm, filterStatus, accounts]);

  const handleCreateAccount = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/accounts/${formData.userId}/create`, {
        accountType: formData.accountType,
        initialBalance: parseFloat(formData.initialBalance)
      });
      Toast.success('Account created successfully.');
      setIsCreateModalOpen(false);
      setFormData({ userId: '', accountType: 'SAVINGS', initialBalance: '' });
      fetchAccounts();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFreezeAccount = async (accountNumber) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/accounts/${accountNumber}/freeze`);
      Toast.success('Account frozen successfully.');
      fetchAccounts();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to freeze account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfreezeAccount = async (accountNumber) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/accounts/${accountNumber}/unfreeze`);
      Toast.success('Account unfrozen successfully.');
      fetchAccounts();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to unfreeze account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    setActionLoading(true);
    try {
      await api.put(`/admin/accounts/${selectedAccount.accountNumber}/balance`, {
        newBalance: parseFloat(formData.initialBalance)
      });
      Toast.success('Account balance updated successfully.');
      setIsEditModalOpen(false);
      setSelectedAccount(null);
      fetchAccounts();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to update balance.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (account) => {
    setSelectedAccount(account);
    setFormData({ userId: '', accountType: account.accountType, initialBalance: account.balance });
    setIsEditModalOpen(true);
  };

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
          <Wallet className="w-6 h-6 text-[#FFD700]" />
          <span>Account Management</span>
        </h2>
        <p className="text-sm text-slate-400">
          Create, freeze, unfreeze, and modify customer accounts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Accounts</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{accounts.length}</p>
          </div>
          <Wallet className="w-10 h-10 text-indigo-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Active</p>
            <p className="text-2xl font-extrabold text-emerald-500">{accounts.filter(a => a.isActive).length}</p>
          </div>
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Frozen</p>
            <p className="text-2xl font-extrabold text-amber-500">{accounts.filter(a => !a.isActive).length}</p>
          </div>
          <Snowflake className="w-10 h-10 text-amber-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Balance</p>
            <p className="text-2xl font-extrabold text-[#FFD700]">{formatCurrency(accounts.reduce((sum, a) => sum + (a.balance || 0), 0))}</p>
          </div>
          <Wallet className="w-10 h-10 text-[#FFD700]" />
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="FROZEN">Frozen</option>
            </select>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Account
          </Button>
        </div>
      </Card>

      {/* Accounts Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-navy-800">
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Account Holder</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-500">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center font-bold text-slate-400">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-850 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-350">
                      {account.accountNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {account.user?.fullName || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded text-[10px] font-bold">
                        {account.accountType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-800 dark:text-slate-200">
                      {formatCurrency(account.balance)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {account.isActive ? (
                        <span className="flex items-center justify-center gap-1 text-emerald-500 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-amber-500 font-bold">
                          <Snowflake className="w-3.5 h-3.5" />
                          Frozen
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(account.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => openEditModal(account)}
                          className="py-1 px-2 text-[10px]"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {account.isActive ? (
                          <Button
                            variant="outline"
                            onClick={() => handleFreezeAccount(account.accountNumber)}
                            loading={actionLoading}
                            className="py-1 px-2 text-[10px] text-amber-500 border-amber-500 hover:bg-amber-50"
                          >
                            <Snowflake className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => handleUnfreezeAccount(account.accountNumber)}
                            loading={actionLoading}
                            className="py-1 px-2 text-[10px] text-emerald-500 border-emerald-500 hover:bg-emerald-50"
                          >
                            <Unlock className="w-3 h-3" />
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

      {/* Create Account Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Account"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="User ID"
            placeholder="Enter user ID"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Account Type
            </label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            >
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
              <option value="FIXED_DEPOSIT">Fixed Deposit</option>
            </select>
          </div>
          <Input
            label="Initial Balance"
            type="number"
            placeholder="Enter initial balance"
            value={formData.initialBalance}
            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAccount}
              loading={actionLoading}
              className="flex-1"
            >
              Create Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Balance Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Account Balance"
      >
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
            <p className="text-xs text-slate-400">Account Number</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedAccount?.accountNumber}</p>
          </div>
          <Input
            label="New Balance"
            type="number"
            placeholder="Enter new balance"
            value={formData.initialBalance}
            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBalance}
              loading={actionLoading}
              className="flex-1"
            >
              Update Balance
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountManagement;
