import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, FileCheck2, Clock, Ban } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const RecentTransactions = ({ transactions = [], userAccounts = [] }) => {
  const navigate = useNavigate();
  const accountNumbers = userAccounts.map(a => a.accountNumber);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-500/10">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Success</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 px-2.5 py-1 rounded-full border border-amber-500/10">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Pending</span>
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20 px-2.5 py-1 rounded-full border border-red-500/10">
            <Ban className="w-3.5 h-3.5" />
            <span>Failed</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
          Recent Account Transactions
        </h3>
        <button
          onClick={() => navigate('/transactions')}
          className="text-xs font-semibold text-indigo-600 dark:text-[#FFD700] hover:underline"
        >
          View Statement
        </button>
      </div>

      {/* Table / List Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-navy-800 bg-white dark:bg-navy-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-navy-950 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-navy-500 border-b border-slate-100 dark:border-navy-800 select-none">
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Txn ID / Type</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-xs">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-400 font-bold select-none">
                  No transactions recorded.
                </td>
              </tr>
            ) : (
              transactions.slice(0, 5).map((txn) => {
                const isDebit = txn.fromAccount && accountNumbers.includes(txn.fromAccount.accountNumber);
                return (
                  <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-850 transition-all">
                    {/* Description Details */}
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isDebit 
                          ? 'bg-red-50 text-red-500 dark:bg-red-950/20' 
                          : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20'
                      }`}>
                        {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {txn.remarks || (isDebit ? 'Outgoing Transfer' : 'Cash Deposit Credit')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDate(txn.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Txn ID / Type */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-600 dark:text-slate-400 font-mono">
                          {txn.transactionId}
                        </span>
                        <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-0.5">
                          {txn.transactionType}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className={`py-3.5 px-4 text-right font-extrabold text-sm font-sans ${
                      isDebit ? 'text-red-500' : 'text-emerald-500'
                    }`}>
                      {isDebit ? '-' : '+'}{formatCurrency(txn.amount)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center justify-center">
                        {getStatusBadge(txn.status)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default RecentTransactions;
