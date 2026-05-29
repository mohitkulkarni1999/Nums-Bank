import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-navy-900 border-t border-slate-100 dark:border-navy-800 py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-navy-500 font-sans">
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
        <span>© {new Date().getFullYear()} NUMS BANK Ltd. All Rights Reserved.</span>
        <a href="#privacy" className="hover:text-indigo-600 dark:hover:text-[#FFD700] transition-colors">Privacy Policy</a>
        <a href="#terms" className="hover:text-indigo-600 dark:hover:text-[#FFD700] transition-colors">Terms of Service</a>
        <a href="#security" className="hover:text-indigo-600 dark:hover:text-[#FFD700] transition-colors">Security Rules</a>
      </div>

      <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl border border-emerald-500/10 select-none">
        <ShieldCheck className="w-4 h-4" />
        <span>RBI Licensed Secure Banking Gateway</span>
      </div>
    </footer>
  );
};
export default Footer;
