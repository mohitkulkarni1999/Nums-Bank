import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  details = {},
  loading,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!pin || pin.length !== 6) {
      setError('Please enter your 6-digit transaction PIN.');
      return;
    }
    setError('');
    onConfirm(pin);
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 6) {
      setPin(val);
      setError('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Secure Transfer Authentication">
      <form onSubmit={handleConfirmSubmit} className="flex flex-col gap-4 font-sans">
        {/* Warning Badge */}
        <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-500/10 text-xs leading-relaxed select-none">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">Double Confirmation Check</span>
            <span>You are initiating an outgoing funds transfer. Please review destination coordinates before submitting. This operation is irreversible.</span>
          </div>
        </div>

        {/* Transfer Coordinate Breakdown */}
        <div className="bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-100 dark:border-navy-800 p-4 flex flex-col gap-3">
          {/* Source to Destination Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-navy-500">Source Account</span>
            <ArrowRight className="w-4 h-4 text-[#FFD700]" />
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-navy-500">Recipient Payee</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Source */}
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-slate-400 dark:text-slate-400">NUMS Debit Account</span>
              <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                {details.fromAccountName || 'Savings Account'}
              </span>
            </div>
            {/* Destination */}
            <div className="flex flex-col gap-0.5 text-right">
              <span className="font-medium text-slate-400 dark:text-slate-400">Beneficiary Name</span>
              <span className="font-bold text-[#FFD700] truncate">
                {details.beneficiaryName}
              </span>
            </div>
          </div>

          {/* Core financial attributes */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-navy-800">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-slate-400 dark:text-slate-400">Account / Bank</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {details.accountNumber} ({details.bankName})
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              <span className="font-medium text-slate-400 dark:text-slate-400">IFSC Coordinates</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {details.ifscCode}
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="mt-2 bg-[#fffbeb] dark:bg-[#FFD700]/5 p-3 rounded-lg border border-[#FFD700]/20 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Amount & Channel</span>
            <div className="flex flex-col text-right">
              <span className="text-base font-extrabold text-[#ca8a04] dark:text-[#FFD700] font-sans">
                {formatCurrency(details.amount)}
              </span>
              <span className="text-[9px] font-bold tracking-widest text-[#ca8a04] uppercase">
                {details.transactionType} CHANNEL
              </span>
            </div>
          </div>
        </div>

        {/* Secure Authorization Pin Box */}
        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Enter 6-Digit Transaction PIN
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              placeholder="••••••"
              value={pin}
              onChange={handlePinChange}
              className="w-full pl-11 pr-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 tracking-[0.75em] text-center font-bold placeholder-slate-300 dark:placeholder-navy-600 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all text-lg"
            />
          </div>
          {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        </div>

        {/* Submits */}
        <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100 dark:border-navy-800">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="w-48 bg-[#FFD700] hover:bg-[#ca8a04]">
            Authorize Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default ConfirmationModal;
