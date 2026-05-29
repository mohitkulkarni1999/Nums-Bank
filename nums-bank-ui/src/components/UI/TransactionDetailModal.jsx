import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Clock, 
  Hash,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Toast from './Toast';

export const TransactionDetailModal = ({ isOpen, onClose, transaction, accounts }) => {
  if (!transaction) return null;

  const accNumbers = accounts.map(a => a.accountNumber);
  const isDebit = transaction.fromAccount && accNumbers.includes(transaction.fromAccount.accountNumber);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    Toast.success(`${label} copied to clipboard`);
  };

  const statusConfig = {
    SUCCESS: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Success' },
    PENDING: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', label: 'Pending' },
    FAILED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20', label: 'Failed' },
  };

  const status = statusConfig[transaction.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details">
      <div className="space-y-6">
        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${status.bg}`}>
          <StatusIcon className={`w-5 h-5 ${status.color}`} />
          <span className={`font-semibold ${status.color}`}>{status.label}</span>
        </div>

        {/* Amount Display */}
        <div className="text-center py-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-950 dark:to-navy-900 rounded-2xl">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Transaction Amount</p>
          <p className={`text-4xl font-extrabold ${isDebit ? 'text-red-500' : 'text-emerald-500'}`}>
            {isDebit ? '-' : '+'}{formatCurrency(transaction.amount)}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            {isDebit ? (
              <ArrowUpRight className="w-4 h-4 text-red-500" />
            ) : (
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            )}
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {isDebit ? 'Debit' : 'Credit'}
            </span>
          </div>
        </div>

        {/* Transaction Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem
            icon={Hash}
            label="Transaction ID"
            value={transaction.transactionId}
            onCopy={() => handleCopy(transaction.transactionId, 'Transaction ID')}
          />
          <DetailItem
            icon={Calendar}
            label="Date & Time"
            value={formatDate(transaction.createdAt)}
          />
          <DetailItem
            icon={Clock}
            label="Status"
            value={status.label}
          />
          <DetailItem
            icon={isDebit ? ArrowUpRight : ArrowDownLeft}
            label="Transaction Type"
            value={isDebit ? 'Debit' : 'Credit'}
          />
        </div>

        {/* Account Details */}
        <div className="space-y-3">
          {transaction.fromAccount && (
            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">From Account</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {transaction.fromAccount.accountType} - {transaction.fromAccount.accountNumber}
              </p>
            </div>
          )}
          {transaction.toAccount && (
            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">To Account</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {transaction.toAccount.accountType} - {transaction.toAccount.accountNumber}
              </p>
            </div>
          )}
        </div>

        {/* Remarks */}
        {transaction.remarks && (
          <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Remarks</p>
            <p className="text-sm text-slate-800 dark:text-slate-200">{transaction.remarks}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-navy-800">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleCopy(transaction.transactionId, 'Transaction ID')}
            className="flex-1"
          >
            Copy Details
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const DetailItem = ({ icon: Icon, label, value, onCopy }) => (
  <div className="p-3 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-slate-400" />
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
    <div className="flex items-center justify-between">
      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{value}</p>
      {onCopy && (
        <button
          onClick={onCopy}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
        >
          <Copy className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}
    </div>
  </div>
);

export default TransactionDetailModal;
