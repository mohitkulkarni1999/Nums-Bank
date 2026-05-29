import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  className = '',
  variant = 'primary', // primary, secondary, outline, text, danger
  loading = false,
  disabled = false,
  ...props
}) => {
  const baseStyles = 'px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';
  
  const variants = {
    primary: 'bg-[#FFD700] hover:bg-[#ca8a04] text-[#0A1926] font-semibold hover:shadow-gold-glow hover:-translate-y-0.5 focus:ring-[#FFD700]',
    secondary: 'bg-slate-800 dark:bg-[#0A1926] hover:bg-slate-700 dark:hover:bg-[#11293e] text-white border border-[#FFD700]/30 hover:border-[#FFD700] hover:-translate-y-0.5 focus:ring-[#FFD700]',
    outline: 'border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 hover:-translate-y-0.5 focus:ring-slate-400',
    text: 'text-slate-800 dark:text-[#FFD700] hover:underline px-2 py-1 focus:ring-[#FFD700]',
    danger: 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg hover:-translate-y-0.5 focus:ring-red-500',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin text-inherit" />}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
export default Button;
