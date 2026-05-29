import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  SendHorizontal, 
  History, 
  Coins, 
  UserCircle2, 
  HelpCircle,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  
  const clientMenuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Send Money', path: '/send-money', icon: SendHorizontal },
    { name: 'Transaction History', path: '/transactions', icon: History },
    { name: 'Loans & EMI', path: '/loans', icon: Coins },
    { name: 'Transaction PIN', path: '/transaction-pin', icon: Lock },
    { name: 'Settings & Profile', path: '/profile', icon: UserCircle2 },
    { name: 'Support Desk', path: '/support', icon: HelpCircle },
  ];

  const adminMenuItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck },
  ];

  const menuItems = user?.role === 'ADMIN' ? adminMenuItems : clientMenuItems;

  return (
    <aside className="w-64 h-screen sticky top-0 hidden lg:flex flex-col bg-white dark:bg-[#0A1926] text-slate-800 dark:text-white border-r border-slate-200 dark:border-[#FFD700]/10 shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[#FFD700]/10 select-none">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFD700] to-yellow-500 text-slate-900 font-black text-lg shadow-gold-glow">
          N
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold tracking-wider text-base leading-none text-[#FFD700] font-sans">
            NUMS BANK
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium font-sans mt-0.5 tracking-widest uppercase">
            NetBanking v3.2
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-4 py-3.5 min-h-[44px] rounded-xl text-sm font-medium transition-all duration-200 group relative
              ${isActive 
                ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/25 shadow-gold-glow' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200 hover:-translate-x-1'
              }
            `}
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <Icon className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 ${isActive ? 'text-[#FFD700]' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`} />
                  <span className="transition-all duration-200 group-hover:font-semibold">{item.name}</span>
                  {!isActive && <div className="absolute left-0 w-1 h-0 bg-[#FFD700] rounded-r-full transition-all duration-200 group-hover:h-8" />}
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* Footer Security Badge */}
      <div className="p-4 border-t border-slate-200 dark:border-[#FFD700]/10 bg-slate-50 dark:bg-black/20 flex flex-col gap-2 rounded-b-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 select-none">
          <ShieldCheck className="w-4.5 h-4.5" />
          <span>256-Bit SSL Secured</span>
        </div>
        <span className="text-[9px] text-slate-500 dark:text-slate-500 font-medium leading-relaxed font-sans">
          Logged in as: <br />
          <span className="text-slate-600 dark:text-slate-400 font-semibold">{user?.email}</span>
        </span>
      </div>
    </aside>
  );
};
export default Sidebar;
