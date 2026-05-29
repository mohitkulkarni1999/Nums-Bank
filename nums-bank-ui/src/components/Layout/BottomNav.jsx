import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  SendHorizontal, 
  History, 
  Coins, 
  UserCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav = () => {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') {
    return null;
  }

  const items = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Send', path: '/send-money', icon: SendHorizontal },
    { name: 'History', path: '/transactions', icon: History },
    { name: 'Loans', path: '/loans', icon: Coins },
    { name: 'Settings', path: '/profile', icon: UserCircle2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white dark:bg-[#0A1926] border-t border-slate-200 dark:border-[#FFD700]/10 flex items-center justify-around py-2.5 px-4 shadow-[0_-5px_15px_rgba(0,0,0,0.15)] rounded-t-2xl">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `
            flex flex-col items-center gap-1 text-[10px] font-semibold transition-all duration-200
            ${isActive ? 'text-[#FFD700]' : 'text-slate-600 dark:text-slate-400'}
          `}
        >
          {({ isActive }) => {
            const Icon = item.icon;
            return (
              <>
                <Icon className={`w-5 h-5 transition-transform duration-200 active:scale-110 ${isActive ? 'text-[#FFD700]' : 'text-slate-600 dark:text-slate-400'}`} />
                <span>{item.name}</span>
              </>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
};
export default BottomNav;
