import React from 'react';

export const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  glow = false,
  elevated = false,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-navy-900 
        border border-slate-100 dark:border-navy-800 
        rounded-2xl p-6 
        transition-all duration-300
        ${hoverable 
          ? 'hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-navy-950/50 cursor-pointer hover:border-[#FFD700]/30' 
          : elevated 
            ? 'shadow-lg dark:shadow-navy-950/30' 
            : 'shadow-sm dark:shadow-navy-950/10'
        }
        ${glow ? 'shadow-gold-glow border-[#FFD700]/20' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
