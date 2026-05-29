import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowLeftRight,
  Landmark,
  Settings,
  FileText,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Toast from '../UI/Toast';

export const AdminSidebar = ({ isOpen, onClose, isMobile }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      Toast.success('Logged out successfully');
    } catch (err) {
      logout();
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Statistics'
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: Users,
      description: 'Approve, Activate, Deactivate'
    },
    {
      name: 'Account Management',
      path: '/admin/accounts',
      icon: Wallet,
      description: 'Create, Freeze, Modify Accounts'
    },
    {
      name: 'Transaction Control',
      path: '/admin/transactions',
      icon: ArrowLeftRight,
      description: 'Reverse, Monitor Transactions'
    },
    {
      name: 'Loan Management',
      path: '/admin/loans',
      icon: Landmark,
      description: 'Approve, Reject Loans'
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: FileText,
      description: 'Daily, Monthly Reports'
    },
    {
      name: 'Audit Logs',
      path: '/admin/audit-logs',
      icon: ShieldCheck,
      description: 'System Activity Logs'
    },
    {
      name: 'System Metrics',
      path: '/admin/system-metrics',
      icon: Activity,
      description: 'User Count, Capacity'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings,
      description: 'Interest Rates, Fees'
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gradient-to-b from-[#0A1926] to-[#0d1f3c]
          border-r border-[#FFD700]/10
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#FFD700]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#ca8a04] flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-[#0A1926]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">NUMS BANK</h1>
                <p className="text-[10px] text-[#FFD700] font-semibold uppercase tracking-wider">Admin Portal</p>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">
            Main Menu
          </p>
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={isMobile ? onClose : undefined}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/25 shadow-gold-glow'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white hover:-translate-x-1'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 ${isActive ? 'text-[#FFD700]' : ''}`} />
                  <span className="transition-all duration-200 group-hover:font-semibold">{item.name}</span>
                  {!isActive && <div className="absolute left-0 w-1 h-0 bg-[#FFD700] rounded-r-full transition-all duration-200 group-hover:h-8" />}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#FFD700]/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
