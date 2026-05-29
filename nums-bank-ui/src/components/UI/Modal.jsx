import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      />
      
      {/* Container */}
      <div className={`relative w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800 rounded-2xl shadow-gold-glow p-6 z-10 transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95 duration-200 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4 mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};
export default Modal;
