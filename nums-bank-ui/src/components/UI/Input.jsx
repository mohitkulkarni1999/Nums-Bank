import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-navy-500 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          type={inputType}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-11' : 'pr-4'} py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-navy-600 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 focus:border-[#FFD700] focus:shadow-[0_0_0_3px_rgba(255,215,0,0.2)] transition-all duration-200 text-sm`}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            tabIndex="-1"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 dark:text-navy-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FFD700] rounded-md p-1 transition-all"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      
      {error && (
        <span className="text-xs text-red-500 font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
export default Input;
