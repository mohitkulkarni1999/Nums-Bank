import React, { useState, useEffect } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Toast from '../../components/UI/Toast';
import { 
  FileText, 
  Calendar,
  Download,
  Loader2,
  TrendingUp,
  DollarSign,
  Users,
  ArrowLeftRight,
  BarChart3
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import api from '../../services/api';

export const AdminReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const endpoint = reportType === 'daily' 
        ? `/admin/reports/daily?date=${date}`
        : `/admin/reports/monthly?month=${date}`;
      
      const res = await api.get(endpoint);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      Toast.error('Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, date]);

  const handleDownload = () => {
    Toast.success('Report downloaded successfully (placeholder)');
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#FFD700]" />
          <span>Reports & Analytics</span>
        </h2>
        <p className="text-sm text-slate-400">
          Generate and view daily, monthly, and custom reports
        </p>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            >
              <option value="daily">Daily Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
            <Input
              type={reportType === 'daily' ? 'date' : 'month'}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full md:w-auto"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchReport}
              loading={loading}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Generate
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Stats */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Transactions</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{reportData.totalTransactions || 0}</p>
            </div>
            <ArrowLeftRight className="w-10 h-10 text-indigo-500" />
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</p>
              <p className="text-2xl font-extrabold text-[#FFD700]">{formatCurrency(reportData.totalAmount || 0)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-[#FFD700]" />
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Success Rate</p>
              <p className="text-2xl font-extrabold text-emerald-500">{reportData.successRate || 100}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-emerald-500" />
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">New Accounts</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{reportData.newAccounts || 0}</p>
            </div>
            <Users className="w-10 h-10 text-slate-500" />
          </Card>
        </div>
      )}

      {/* Report Details */}
      <Card className="p-6">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#FFD700]" />
          <span>{reportType === 'daily' ? 'Daily' : 'Monthly'} Report Details</span>
        </h3>

        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
          </div>
        ) : reportData ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Report Period</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{reportData.date || reportData.month}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Total Transactions</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{reportData.totalTransactions || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Total Volume</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{formatCurrency(reportData.totalAmount || 0)}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Success Rate</p>
                <p className="text-xl font-bold text-emerald-500">{reportData.successRate || 100}%</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">New Accounts</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{reportData.newAccounts || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            Select a date and generate report to view details
          </div>
        )}
      </Card>

      {/* Quick Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#FFD700]/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Transaction Report</h4>
              <p className="text-xs text-slate-400">All transactions summary</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#FFD700]/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Customer Report</h4>
              <p className="text-xs text-slate-400">Account activity summary</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#FFD700]/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Financial Report</h4>
              <p className="text-xs text-slate-400">Revenue and profit analysis</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
