import React from 'react';
import { 
  FileText, 
  Search, 
  Inbox, 
  CreditCard, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const EmptyState = ({ 
  icon = Inbox, 
  title = 'No data found', 
  description = 'There is no data to display at the moment.',
  action = null,
  className = ''
}) => {
  const Icon = icon;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
        {description}
      </p>
      {action && action}
    </div>
  );
};

export const EmptyTransactions = ({ onFilter }) => (
  <EmptyState
    icon={FileText}
    title="No transactions found"
    description="You haven't made any transactions yet, or try adjusting your filters."
    action={
      onFilter && (
        <button
          onClick={onFilter}
          className="px-4 py-2 bg-[#FFD700] hover:bg-[#ca8a04] text-[#0A1926] font-medium rounded-lg transition-colors"
        >
          Clear Filters
        </button>
      )
    }
  />
);

export const EmptySearch = ({ onClear }) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description="We couldn't find any matching results. Try a different search term."
    action={
      onClear && (
        <button
          onClick={onClear}
          className="px-4 py-2 bg-[#FFD700] hover:bg-[#ca8a04] text-[#0A1926] font-medium rounded-lg transition-colors"
        >
          Clear Search
        </button>
      )
    }
  />
);

export const EmptyAccounts = () => (
  <EmptyState
    icon={CreditCard}
    title="No accounts found"
    description="You don't have any active accounts linked to your profile."
  />
);

export const EmptyLoans = () => (
  <EmptyState
    icon={TrendingUp}
    title="No active loans"
    description="You don't have any active loans. Apply for a loan to get started."
  />
);

export const EmptyError = ({ onRetry }) => (
  <EmptyState
    icon={AlertCircle}
    title="Something went wrong"
    description="We encountered an error while loading your data. Please try again."
    action={
      onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#FFD700] hover:bg-[#ca8a04] text-[#0A1926] font-medium rounded-lg transition-colors"
        >
          Try Again
        </button>
      )
    }
  />
);

export default EmptyState;
