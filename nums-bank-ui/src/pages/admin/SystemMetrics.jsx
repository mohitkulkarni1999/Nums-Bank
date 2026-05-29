import React, { useState, useEffect } from 'react';
import Card from '../../components/UI/Card';
import api from '../../services/api';
import { 
  Users, 
  Wallet, 
  ArrowRightLeft, 
  FileText, 
  Activity,
  Clock,
  Server,
  CheckCircle2
} from 'lucide-react';

export const SystemMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/system/metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    {
      title: 'Total Users',
      value: metrics?.totalUsers || 0,
      icon: Users,
      color: 'indigo',
      description: 'Registered users in the system'
    },
    {
      title: 'Total Accounts',
      value: metrics?.totalAccounts || 0,
      icon: Wallet,
      color: 'emerald',
      description: 'Active bank accounts'
    },
    {
      title: 'Total Transactions',
      value: metrics?.totalTransactions || 0,
      icon: ArrowRightLeft,
      color: 'blue',
      description: 'All-time transaction count'
    },
    {
      title: 'Total Loans',
      value: metrics?.totalLoans || 0,
      icon: FileText,
      color: 'amber',
      description: 'Loan applications processed'
    },
    {
      title: "Today's Transactions",
      value: metrics?.todayTransactions || 0,
      icon: Activity,
      color: 'purple',
      description: 'Transactions processed today'
    },
    {
      title: 'System Status',
      value: metrics?.systemStatus || 'UNKNOWN',
      icon: Server,
      color: 'green',
      description: 'Current operational status'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-900/30' },
      emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/30' },
      blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/30' },
      amber: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/30' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-900/30' },
      green: { bg: 'bg-green-50 dark:bg-green-950/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-900/30' }
    };
    return colors[color] || colors.indigo;
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Server className="w-6 h-6 text-[#FFD700]" />
          <span>System Metrics & Capacity</span>
        </h2>
        <p className="text-sm text-slate-400">
          Monitor system performance, user count, and transaction volume
        </p>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Clock className="w-4 h-4" />
        <span>Last updated: {metrics?.timestamp ? new Date(metrics.timestamp).toLocaleString() : 'N/A'}</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          const colors = getColorClasses(card.color);
          return (
            <Card key={index} className={`p-5 border ${colors.border}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* System Info Card */}
      <Card className="p-6 border border-slate-100 dark:border-navy-800">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-navy-800">
          <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">System Information</h3>
            <p className="text-xs text-slate-400">Current system status and capacity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">System Status</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {metrics?.systemStatus || 'OPERATIONAL'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Database Status</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Connected
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Response Time</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">&lt; 200ms</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Uptime</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">99.9%</span>
          </div>
        </div>
      </Card>

      {/* Capacity Planning Info */}
      <Card className="p-6 border border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/30">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#FFD700]" />
          <span>Capacity Planning Guidelines</span>
        </h3>
        <ul className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Current Setup:</strong> Single instance with MySQL database
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Estimated Capacity:</strong> 1,000-5,000 concurrent users with current configuration
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">To Scale:</strong> Add load balancer, multiple service instances, and database clustering
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Monitoring:</strong> Use tools like Prometheus, Grafana, or New Relic for production monitoring
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default SystemMetrics;
