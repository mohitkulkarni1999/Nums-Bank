import React, { useState, useEffect } from 'react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import { 
  ShieldCheck, 
  Users, 
  Wallet, 
  Activity, 
  UserX, 
  UserCheck, 
  History, 
  Loader2, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import api from '../services/api';

export const AdminDashboard = () => {
  // Page state fields
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // Filter toggle for users (ALL, PENDING, APPROVED)
  const [userFilter, setUserFilter] = useState('PENDING');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/admin/users');
      const txnsRes = await api.get('/admin/transactions?page=0&size=100');
      const statsRes = await api.get('/admin/dashboard-stats');

      setUsers(usersRes.data || []);
      // Page response — extract content array, already sorted desc by backend
      const txnContent = txnsRes.data?.content || txnsRes.data || [];
      setTransactions(Array.isArray(txnContent) ? txnContent : []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      Toast.error('Failed to load operations control statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveUser = async (userId, name) => {
    setActionLoadingId(userId);
    try {
      await api.put(`/admin/users/${userId}/approve`);
      Toast.success(`User "${name}" approved successfully.`);
      await fetchAdminData();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to approve user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeactivateUser = async (userId, name) => {
    setActionLoadingId(userId);
    try {
      await api.put(`/admin/users/${userId}/deactivate`);
      Toast.success(`User "${name}" deactivated.`);
      await fetchAdminData();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to deactivate user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleActivateUser = async (userId, name) => {
    setActionLoadingId(userId);
    try {
      await api.put(`/admin/users/${userId}/activate`);
      Toast.success(`User "${name}" reactivated.`);
      await fetchAdminData();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to reactivate user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    if (u.role === 'ADMIN') return false; // never show admin in the list
    if (userFilter === 'PENDING') return !u.isApproved && u.isActive;
    if (userFilter === 'APPROVED') return u.isApproved && u.isActive;
    return true; // ALL
  });

  if (loading && !stats) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 font-sans pb-24 lg:pb-8">
      {/* Title */}
      <div className="flex flex-col gap-0.5 select-none">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#FFD700]" />
          <span>NUMS BANK Control Command Centre</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Monitor aggregate platform deposits, audit live transactions, and authorize pending registrations instantly.
        </p>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none">
        {/* Total Users */}
        <Card className="p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Clients Profile</span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{stats?.totalUsers}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        {/* Total Deposits */}
        <Card className="p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Bank deposits</span>
            <span className="text-2xl font-extrabold text-[#ca8a04] dark:text-[#FFD700]">{formatCurrency(stats?.totalDeposits || 0)}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 text-[#FFD700] flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </Card>

        {/* Settled Today */}
        <Card className="p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Txns Settled Today</span>
            <span className="text-2xl font-extrabold text-emerald-500">{stats?.todayTransactionsCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </Card>

        {/* Total Accounts */}
        <Card className="p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Accounts Node</span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{stats?.totalAccountsCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-navy-950 text-slate-450 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Approvals Panel */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3 select-none">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <UserCheck className="w-5 h-5 text-indigo-500" />
                <span>Client Registrations Control</span>
              </h3>

              {/* Filters */}
              <div className="flex gap-1 bg-slate-100 dark:bg-navy-950 p-0.5 rounded-lg border border-slate-200 dark:border-navy-800">
                {['ALL', 'PENDING', 'APPROVED'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setUserFilter(f)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      userFilter === f
                        ? 'bg-[#FFD700] text-slate-900 dark:text-[#0A1926]'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10 select-none text-slate-400 font-bold gap-2">
                  <UserX className="w-8 h-8 text-slate-300" />
                  <span>No users matching this approval filter.</span>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 rounded-xl flex flex-col gap-2.5 text-xs text-slate-500"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0.5 select-none">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{u.fullName}</span>
                        <span className="text-[10px] text-slate-400">{u.email}</span>
                      </div>
                      {u.isApproved ? (
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-500/10 font-bold text-[9px] rounded uppercase">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 border border-amber-500/10 font-bold text-[9px] rounded uppercase animate-pulse">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-slate-150 dark:border-navy-900/50 pt-2 font-mono text-[10px]">
                      <div>PAN: <span className="font-bold text-slate-700 dark:text-slate-350">{u.panNumber}</span></div>
                      <div>Aadhaar: <span className="font-bold text-slate-700 dark:text-slate-350">{u.aadharMasked}</span></div>
                    </div>

                    {!u.isApproved && (
                      <Button
                        onClick={() => handleApproveUser(u.id, u.fullName)}
                        loading={actionLoadingId === u.id}
                        className="w-full py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg mt-1"
                      >
                        Approve Netbanking Profile
                      </Button>
                    )}
                    {u.isApproved && u.isActive && (
                      <Button
                        onClick={() => handleDeactivateUser(u.id, u.fullName)}
                        loading={actionLoadingId === u.id}
                        className="w-full py-2 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg mt-1"
                      >
                        Deactivate Account
                      </Button>
                    )}
                    {!u.isActive && (
                      <Button
                        onClick={() => handleActivateUser(u.id, u.fullName)}
                        loading={actionLoadingId === u.id}
                        className="w-full py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg mt-1"
                      >
                        Reactivate Account
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: Complete System-wide Audit Ledger */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-4 select-none">
              <History className="w-5 h-5 text-[#FFD700]" />
              <span>Full System-Wide Transaction Audit Logs</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-950 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-navy-800">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Source ID</th>
                    <th className="py-3 px-4">Target Acc No</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-500">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-10 text-center font-bold text-slate-400 select-none">
                        No transactions registered on platform yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-850 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-400">
                          {formatDate(t.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-350">
                          {t.transactionId}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {t.fromAccount ? t.fromAccount.accountNumber : 'SYSTEM CREDIT'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-350">
                          {t.toAccountNumber}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-800 dark:text-slate-200">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 font-bold">
                            {t.status === 'SUCCESS' ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            )}
                            <span className={t.status === 'SUCCESS' ? 'text-emerald-500' : 'text-red-500'}>
                              {t.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
