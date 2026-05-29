import React from 'react';

export const Skeleton = ({ className = '', variant = 'default', ...props }) => {
  const variants = {
    default: 'h-4 w-full',
    circle: 'rounded-full',
    text: 'h-4 w-3/4',
    title: 'h-6 w-1/2',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-32 w-full rounded-lg',
  };

  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${variants[variant] || variants.default} ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-[#0A1926] rounded-xl p-6 border border-slate-200 dark:border-[#FFD700]/10">
    <Skeleton variant="title" className="mb-4" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" className="w-1/2" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    <div className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <Skeleton variant="text" className="w-1/4" />
      <Skeleton variant="text" className="w-1/4" />
      <Skeleton variant="text" className="w-1/4" />
      <Skeleton variant="text" className="w-1/4" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-3 border-b border-slate-100 dark:border-slate-800">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
      </div>
    ))}
  </div>
);

export default Skeleton;
