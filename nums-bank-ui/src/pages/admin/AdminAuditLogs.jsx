import React, { useState, useEffect } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Toast from '../../components/UI/Toast';
import { 
  ShieldCheck, 
  Search, 
  Filter,
  Loader2,
  User,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs?page=${currentPage}&size=50`);
      setLogs(res.data?.logs || []);
      setFilteredLogs(res.data?.logs || []);
      setTotalLogs(res.data?.total || 0);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      Toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage]);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterAction !== 'ALL') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, filterAction, logs]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'LOGOUT':
        return <User className="w-4 h-4 text-slate-400" />;
      case 'ACCOUNT_CREATED':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'ACCOUNT_FROZEN':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'ACCOUNT_DELETED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'TRANSACTION_REVERSED':
        return <Activity className="w-4 h-4 text-purple-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'LOGIN':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'LOGOUT':
        return 'text-slate-500 bg-slate-50 dark:bg-slate-950/20';
      case 'ACCOUNT_CREATED':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
      case 'ACCOUNT_FROZEN':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'ACCOUNT_DELETED':
        return 'text-red-500 bg-red-50 dark:bg-red-950/20';
      case 'TRANSACTION_REVERSED':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-950/20';
      default:
        return 'text-slate-500 bg-slate-50 dark:bg-slate-950/20';
    }
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
          <ShieldCheck className="w-6 h-6 text-[#FFD700]" />
          <span>Audit Logs</span>
        </h2>
        <p className="text-sm text-slate-400">
          Track all system activities and administrative actions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Logs</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{totalLogs}</p>
          </div>
          <ShieldCheck className="w-10 h-10 text-indigo-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Today</p>
            <p className="text-2xl font-extrabold text-emerald-500">{logs.filter(l => l.isToday).length}</p>
          </div>
          <Clock className="w-10 h-10 text-emerald-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Critical Actions</p>
            <p className="text-2xl font-extrabold text-red-500">{logs.filter(l => l.isCritical).length}</p>
          </div>
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Admin Actions</p>
            <p className="text-2xl font-extrabold text-[#FFD700]">{logs.filter(l => l.isAdmin).length}</p>
          </div>
          <User className="w-10 h-10 text-[#FFD700]" />
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              />
            </div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="ACCOUNT_CREATED">Account Created</option>
              <option value="ACCOUNT_FROZEN">Account Frozen</option>
              <option value="ACCOUNT_DELETED">Account Deleted</option>
              <option value="TRANSACTION_REVERSED">Transaction Reversed</option>
            </select>
          </div>
          <Button
            onClick={fetchAuditLogs}
            loading={loading}
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="p-6">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-navy-700 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-navy-800">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-500">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center font-bold text-slate-400">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-navy-850 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {log.user}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {log.ipAddress}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {getActionIcon(log.action)}
                        <span className="font-bold text-slate-600 dark:text-slate-400">
                          {log.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-navy-800 pt-4 mt-4">
          <span className="text-xs text-slate-400">
            Showing {filteredLogs.length} of {totalLogs} logs
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              className="py-1 px-3 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={filteredLogs.length < 50}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="py-1 px-3 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
