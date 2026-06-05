import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ShieldCheck, Landmark, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useCountUp } from '../../hooks/useCountUp';

export const BalanceCard = ({ accounts = [], userName }) => {
  const [hideBalance, setHideBalance] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const savingsAccount = accounts.find(a => a.accountType === 'SAVINGS');
  const currentAccount = accounts.find(a => a.accountType === 'CURRENT');

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
  
  const { count: animatedBalance } = useCountUp(showBalance && !hideBalance ? totalBalance : 0, 1500);

  useEffect(() => {
    setShowBalance(true);
  }, []);

  // If no accounts exist, show a message to create accounts
  if (accounts.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 dark:from-[#0A1926] dark:via-[#11293e] dark:to-[#0A1926] text-white rounded-3xl p-6 shadow-gold-glow border border-[#FFD700]/10 flex flex-col justify-center items-center min-h-[220px]">
        <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-radial from-[#FFD700]/5 to-transparent pointer-events-none rounded-full blur-2xl" />
        
        <div className="flex flex-col items-center gap-4 z-10 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <Plus className="w-8 h-8 text-[#FFD700]" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-slate-200">No Accounts Linked</h3>
            <p className="text-xs text-slate-400 max-w-[200px]">
              Create a Savings or Current account to start banking
            </p>
          </div>
          <a
            href="/profile"
            className="mt-2 px-6 py-2.5 bg-[#FFD700] hover:bg-[#ca8a04] text-slate-900 font-bold rounded-xl text-sm transition-all"
          >
            Create Account
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 dark:from-[#0A1926] dark:via-[#11293e] dark:to-[#0A1926] text-white rounded-3xl p-6 shadow-gold-glow border border-[#FFD700]/10 flex flex-col justify-between min-h-[220px]">
      {/* Decorative Gold Radial Mesh */}
      <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-radial from-[#FFD700]/5 to-transparent pointer-events-none rounded-full blur-2xl" />

      {/* Header Info */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FFD700]/80">
          <Landmark className="w-4 h-4 text-[#FFD700]" />
          <span>NUMS NetBanking Portfolio</span>
        </div>
        <button
          onClick={() => setHideBalance(!hideBalance)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
        >
          {hideBalance ? <Eye className="w-4.5 h-4.5 text-[#FFD700]" /> : <EyeOff className="w-4.5 h-4.5" />}
        </button>
      </div>

      {/* Total Balance Amount */}
      <div className="my-4 z-10">
        <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">Total Net Available Balance</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 font-sans">
          {hideBalance ? '••••••' : formatCurrency(animatedBalance)}
        </h1>
      </div>

      {/* Account Type Grid Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2 z-10">
        {/* Savings Account Details */}
        {savingsAccount && (
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Savings Account ({savingsAccount.accountNumber.slice(-4)})
            </span>
            <span className="text-sm font-bold text-slate-200">
              {hideBalance ? '••••••' : formatCurrency(savingsAccount.balance)}
            </span>
          </div>
        )}

        {/* Current Account Details */}
        {currentAccount ? (
          <div className="flex flex-col gap-0.5 border-t md:border-t-0 md:border-l border-white/5 pt-2.5 md:pt-0 md:pl-4">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Current Account ({currentAccount.accountNumber.slice(-4)})
            </span>
            <span className="text-sm font-bold text-slate-200">
              {hideBalance ? '••••••' : formatCurrency(currentAccount.balance)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-dashed border-white/5 text-[10px] text-slate-400 font-bold select-none">
            No Current Account linked
          </div>
        )}
      </div>
    </div>
  );
};
export default BalanceCard;
