import React, { useState, useEffect, useRef } from 'react';
import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Toast from '../UI/Toast';

export const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [time, setTime] = useState(new Date());
  const notifRef = useRef(null);

  // Live clock — updates every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic greeting based on hour
  useEffect(() => {
    const hours = time.getHours();
    if (hours < 12) setGreeting('Good morning');
    else if (hours < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, [time]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mockNotifications = [
    { id: 1, text: 'Interest of ₹42.50 credited on Savings Account', unread: true },
    { id: 2, text: 'Transaction of ₹1,500.00 successful to Priya Patel', unread: false },
    { id: 3, text: 'EMI of ₹10,428.00 due on Car Loan in 5 days', unread: true },
  ];

  const handleLogout = () => {
    logout();
    Toast.success('Logged out successfully.');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-navy-900 border-b border-slate-100 dark:border-navy-800 shadow-sm flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4">
      {/* Welcome + Live Clock */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100 font-sans truncate">
          {greeting},{' '}
          <span className="text-indigo-600 dark:text-[#FFD700]">
            {user?.fullName || 'Valued Client'}
          </span>
        </h2>
        <span className="text-[9px] sm:text-[10px] lg:text-xs text-slate-400 dark:text-navy-500 font-medium truncate">
          {time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          {' | '}
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Right-side Actions */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] p-1.5 sm:p-2.5 rounded-xl border border-slate-100 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-500 dark:text-slate-400 transition-all active:scale-95 flex items-center justify-center"
        >
          {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] p-1.5 sm:p-2.5 rounded-xl border border-slate-100 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-500 dark:text-slate-400 transition-all active:scale-95 flex items-center justify-center"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {mockNotifications.some(n => n.unread) && (
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-navy-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 sm:mt-3 w-64 sm:w-72 lg:w-80 bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800 rounded-2xl shadow-gold-glow p-3 sm:p-4 animate-in fade-in slide-in-from-top-3 duration-200 z-50">
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 mb-2 sm:mb-3 pb-2 border-b border-slate-100 dark:border-navy-800">
                Recent Alerts
              </h3>
              <div className="flex flex-col gap-1.5 sm:gap-2">
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2 sm:p-2.5 rounded-lg text-[10px] sm:text-xs leading-relaxed transition-all ${
                      notif.unread
                        ? 'bg-[#fffbeb] text-slate-800 dark:bg-[#FFD700]/5 dark:text-slate-200 border-l-4 border-[#FFD700]'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {notif.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar (links to profile) + Logout */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 pl-2 sm:pl-3 border-l border-slate-100 dark:border-navy-800">
          <button
            onClick={() => navigate('/profile')}
            aria-label="Go to profile"
            className="min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-[#FFD700] text-white font-bold select-none shadow-md hover:opacity-90 transition-opacity text-xs sm:text-sm"
          >
            {user?.fullName
              ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : 'UI'}
          </button>
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] p-1.5 sm:p-2.5 rounded-xl border border-transparent hover:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
