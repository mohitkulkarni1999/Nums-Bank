import React, { useState, useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';
import BalanceCard from '../components/Dashboard/BalanceCard';
import QuickActions from '../components/Dashboard/QuickActions';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import SpendingChart from '../components/Dashboard/SpendingChart';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Toast from '../components/UI/Toast';
import StatementDownloadModal from '../components/UI/StatementDownloadModal';
import { EmptyError } from '../components/UI/EmptyState';
import toast from 'react-hot-toast';
import { 
  CreditCard, 
  Coins, 
  Download, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Loader2, 
  Landmark, 
  CheckCircle2,
  Copy,
  QrCode,
  Share2
} from 'lucide-react';
import jsPDF from 'jspdf';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const { getAccountSummary, getTransactionHistory } = useTransactions();

  // Page States
  const [summaryData, setSummaryData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debit Card Toggle
  const [isCardBlocked, setIsCardBlocked] = useState(false);
  const [cardToggleLoading, setCardToggleLoading] = useState(false);

  // Simulated Deposit Modal
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositType, setDepositType] = useState('deposit'); // deposit, bills, request
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAccNumber, setSelectedAccNumber] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  // Statement Download Modal
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    const summaryResult = await getAccountSummary();
    const historyResult = await getTransactionHistory({ page: 0, size: 10 });
    
    if (summaryResult.success) {
      setSummaryData(summaryResult.data);
      if (summaryResult.data.accounts?.length > 0) {
        setSelectedAccNumber(summaryResult.data.accounts[0].accountNumber);
      }
    }
    if (historyResult.success) {
      setTransactions(historyResult.data.content || []);
    }

    try {
      const loanRes = await api.get('/loans/my-loans');
      setLoans(loanRes.data || []);
    } catch (err) {
      console.error('Error fetching real loans:', err);
    }

    setLoading(false);
  };

  const handleRetryFetch = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBlockToggle = () => {
    setCardToggleLoading(true);
    setTimeout(() => {
      setIsCardBlocked(!isCardBlocked);
      setCardToggleLoading(false);
      Toast.success(isCardBlocked ? 'Debit Card successfully unblocked.' : 'Debit Card has been blocked immediately for protection.');
    }, 800);
  };

  // Real Cash Deposit
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Toast.error('Please enter a valid amount.');
      return;
    }

    setDepositLoading(true);
    try {
      await api.post('/transactions/deposit', {
        accountNumber: selectedAccNumber,
        amount: parseFloat(depositAmount)
      });
      Toast.success(`₹${parseFloat(depositAmount).toLocaleString('en-IN')} deposited successfully into ${selectedAccNumber}!`);
      setIsDepositOpen(false);
      setDepositAmount('');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      Toast.error(err.response?.data?.message || 'Failed to process cash deposit.');
    } finally {
      setDepositLoading(false);
    }
  };

  // PDF statement generator with filtering
  const downloadPdfStatement = async ({ accountNumber, fromDate, toDate }) => {
    if (!summaryData || summaryData.accounts?.length === 0) return;

    try {
      const loadingToast = Toast.loading('Fetching transactions for statement...');
      
      // Fetch all transactions for the selected account and date range
      const payload = {
        page: 0,
        size: 1000, // Fetch all transactions
        fromDate,
        toDate,
        accountNumber,
      };
      
      const historyResult = await getTransactionHistory(payload);
      const allTransactions = historyResult.success ? (historyResult.data.content || []) : [];
      
      toast.dismiss(loadingToast);
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.text('NUMS BANK LTD.', 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Statement for: ${user?.fullName}`, 14, 30);
      doc.text(`Email: ${user?.email}`, 14, 36);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, 14, 42);
      
      if (fromDate && toDate) {
        doc.text(`Period: ${new Date(fromDate).toLocaleDateString('en-IN')} to ${new Date(toDate).toLocaleDateString('en-IN')}`, 14, 48);
      } else {
        doc.text('Period: All Time', 14, 48);
      }
      
      // Account Summary
      doc.setFontSize(12);
      doc.text('Account Summary:', 14, 60);
      
      let y = 68;
      summaryData.accounts.forEach((acc) => {
        doc.setFontSize(10);
        doc.text(`${acc.accountType} (${acc.accountNumber}): Rs. ${parseFloat(acc.balance).toLocaleString('en-IN')}`, 14, y);
        y += 7;
      });
      
      // Table Header
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      // Draw table header background
      doc.setFillColor(200, 200, 200);
      doc.rect(14, y - 5, 182, 10, 'F');
      
      // Table headers
      doc.text('Date', 16, y);
      doc.text('Transaction ID', 50, y);
      doc.text('Description', 100, y);
      doc.text('Type', 150, y);
      doc.text('Amount', 175, y);
      
      y += 12;
      
      // Table rows
      doc.setFont('helvetica', 'normal');
      const accNumbers = summaryData.accounts.map(a => a.accountNumber);
      
      allTransactions.forEach((t) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
          
          // Repeat header on new page
          doc.setFont('helvetica', 'bold');
          doc.setFillColor(200, 200, 200);
          doc.rect(14, y - 5, 182, 10, 'F');
          doc.text('Date', 16, y);
          doc.text('Transaction ID', 50, y);
          doc.text('Description', 100, y);
          doc.text('Type', 150, y);
          doc.text('Amount', 175, y);
          y += 12;
          doc.setFont('helvetica', 'normal');
        }
        
        const dateStr = new Date(t.createdAt).toLocaleDateString('en-IN');
        const desc = (t.remarks || 'Funds Transfer').substring(0, 25);
        const isDebit = t.fromAccount && accNumbers.includes(t.fromAccount.accountNumber);
        
        // Draw row border
        doc.setDrawColor(200, 200, 200);
        doc.line(14, y - 3, 196, y - 3);
        
        doc.text(dateStr, 16, y);
        doc.text(t.transactionId.substring(0, 15), 50, y);
        doc.text(desc, 100, y);
        doc.text(isDebit ? 'DEBIT' : 'CREDIT', 150, y);
        doc.text(`${isDebit ? '-' : ''}Rs. ${parseFloat(t.amount).toLocaleString('en-IN')}`, 175, y);
        
        y += 8;
      });
      
      // Table bottom border
      doc.line(14, y - 3, 196, y - 3);
      
      // Footer
      doc.setFontSize(8);
      doc.text(`Total Transactions: ${allTransactions.length}`, 14, 285);
      doc.text('This is a computer-generated statement.', 14, 290);

      doc.save(`NumsBank_Statement_${user?.fullName.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      Toast.success('PDF Statement downloaded successfully.');
    } catch (err) {
      console.error('PDF generation failed:', err);
      Toast.error('PDF generation failed.');
    }
  };

  if (loading && !summaryData) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 font-sans pb-24 lg:pb-8">
      {/* Upper Grid Layout (Balance and Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <BalanceCard 
            accounts={summaryData?.accounts || []} 
            userName={user?.fullName} 
          />
        </div>
        <div className="lg:col-span-2 flex flex-col justify-center">
          <QuickActions 
            onOpenDeposit={(type) => {
              setDepositType(type);
              setIsDepositOpen(true);
            }} 
          />
        </div>
      </div>

      {/* Main Grid: Visuals and Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Transactions & Spending Chart */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6">
            <RecentTransactions 
              transactions={transactions} 
              userAccounts={summaryData?.accounts || []} 
            />
          </Card>

          <SpendingChart 
            transactions={transactions} 
            userAccounts={summaryData?.accounts || []} 
          />
        </div>

        {/* Right 1 Column: Cards Control, Loans and Actions */}
        <div className="lg:col-span-1 flex flex-col gap-6 animate-in fade-in duration-500">
          
          {/* 0. UPI/A/c Payment Coordinates & QR Code */}
          <Card className="p-6 flex flex-col gap-4 border border-slate-100 dark:border-navy-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 select-none">
              <QrCode className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span>Receive Payments</span>
            </h3>

            {/* Custom SVG QR Code */}
            <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-100 dark:border-navy-800">
              <div className="w-36 h-36 bg-white rounded-xl p-2.5 flex items-center justify-center shadow-md border border-slate-100 relative group transition-transform hover:scale-105 duration-200">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                  <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                  <rect x="3" y="3" width="19" height="19" fill="white" />
                  <rect x="6" y="6" width="13" height="13" fill="currentColor" />

                  <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                  <rect x="78" y="3" width="19" height="19" fill="white" />
                  <rect x="81" y="6" width="13" height="13" fill="currentColor" />

                  <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                  <rect x="3" y="78" width="19" height="19" fill="white" />
                  <rect x="6" y="81" width="13" height="13" fill="currentColor" />

                  <rect x="35" y="5" width="5" height="15" fill="currentColor" />
                  <rect x="45" y="15" width="10" height="5" fill="currentColor" />
                  <rect x="60" y="5" width="5" height="10" fill="currentColor" />
                  <rect x="10" y="35" width="15" height="5" fill="currentColor" />
                  <rect x="5" y="50" width="5" height="15" fill="currentColor" />
                  <rect x="40" y="30" width="20" height="20" fill="currentColor" />
                  <rect x="70" y="45" width="10" height="15" fill="currentColor" />
                  <rect x="80" y="35" width="15" height="5" fill="currentColor" />
                  <rect x="30" y="70" width="5" height="15" fill="currentColor" />
                  <rect x="45" y="85" width="15" height="5" fill="currentColor" />
                  <rect x="65" y="75" width="10" height="10" fill="currentColor" />

                  <rect x="38" y="38" width="24" height="24" rx="4" fill="white" stroke="currentColor" strokeWidth="1.5" />
                  <text x="50" y="52" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#4f46e5">NUMS</text>
                </svg>
              </div>
              <p className="text-[10px] text-slate-400 font-extrabold mt-3 uppercase tracking-wider">
                Scan to pay {user?.fullName}
              </p>
            </div>

            {/* Account Coordinates Details */}
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-2">
                <span className="text-slate-400 font-medium">Account Number</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {summaryData?.accounts?.[0]?.accountNumber || 'SAVINGS'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(summaryData?.accounts?.[0]?.accountNumber || '');
                      Toast.success('Account number copied to clipboard!');
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-navy-900 transition-all active:scale-90"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-2">
                <span className="text-slate-400 font-medium">IFSC Code</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">NUMS0000001</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('NUMS0000001');
                      Toast.success('IFSC Code copied to clipboard!');
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-navy-900 transition-all active:scale-90"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Branch & Bank</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">
                  NUMS Bank Ltd (HQ Mumbai)
                </span>
              </div>
            </div>

            {/* Share details action */}
            <Button
              onClick={() => {
                const msg = `Hey! Send money to my NUMS BANK Account.\nBeneficiary Name: ${user?.fullName}\nAccount Number: ${summaryData?.accounts?.[0]?.accountNumber}\nIFSC Code: NUMS0000001\nBank Name: NUMS BANK`;
                navigator.clipboard.writeText(msg);
                Toast.success('Complete coordinates copied! Send on WhatsApp/SMS.');
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Copy Shareable Details</span>
            </Button>
          </Card>

          {/* 1. Debit Card Control Toggle */}
          <Card className="p-6 flex flex-col gap-4 border border-slate-100 dark:border-navy-800 bg-gradient-to-br from-white to-slate-50 dark:from-[#0A1926] dark:to-[#11293e]">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 select-none">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              <span>Debit Card Controls</span>
            </h3>

            <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-100 dark:border-navy-800 flex items-center justify-between">
              <div className="flex flex-col gap-0.5 select-none">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  NUMS Platinum Card
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider font-mono">
                  XXXX XXXX XXXX 4208
                </span>
              </div>
              <button
                disabled={cardToggleLoading}
                onClick={handleBlockToggle}
                className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                  isCardBlocked
                    ? 'bg-red-50 text-red-500 border-red-500/20 hover:bg-red-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-500/20 hover:bg-emerald-100'
                }`}
              >
                {cardToggleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isCardBlocked ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <Unlock className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 select-none uppercase tracking-wider mt-1.5 self-center">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
              <span>Card Status: {isCardBlocked ? 'Temporarily Suspended' : 'Fully Active'}</span>
            </div>
          </Card>

          {/* 2. Credit Card Summary Card */}
          <Card className="p-6 flex flex-col gap-4 bg-gradient-to-br from-white to-amber-50 dark:from-[#0A1926] dark:to-[#1a2f45] border-amber-200 dark:border-amber-900/30">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 select-none">
              <CreditCard className="w-5 h-5 text-amber-500" />
              <span>Credit Card Summary</span>
            </h3>

            <div className="flex flex-col gap-2.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Total Limit Assigned</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹5,00,000.00</span>
              </div>
              <div className="flex justify-between">
                <span>Available Balance</span>
                <span className="font-bold text-emerald-500">₹3,20,000.00</span>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-slate-100 dark:border-navy-800">
                <span>Last Statement Bill</span>
                <span className="font-bold text-red-500">₹18,500.00</span>
              </div>
            </div>
          </Card>

          {/* 3. Loan Outstanding Card */}
          <Card className="p-6 flex flex-col gap-4 bg-gradient-to-br from-white to-indigo-50 dark:from-[#0A1926] dark:to-[#1e3a5f] border-indigo-200 dark:border-indigo-900/30">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 select-none">
              <Coins className="w-5 h-5 text-indigo-500 animate-bounce" />
              <span>Lending Liability Accounts</span>
            </h3>

            <div className="flex flex-col gap-2.5 text-xs">
              {loans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 px-2 bg-slate-50 dark:bg-navy-950 rounded-xl border border-dashed border-slate-200 dark:border-navy-800 text-center">
                  <span className="text-[11px] text-slate-400 font-semibold">No active outstanding liability loans.</span>
                  <span className="text-[10px] text-indigo-500 font-bold mt-1">Need quick funds? Apply under the Loans portal!</span>
                </div>
              ) : (
                loans.map((loan) => (
                  <div key={loan.id} className="flex flex-col gap-1 border-b last:border-0 border-slate-100 dark:border-navy-800 pb-2 last:pb-0">
                    <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>{loan.loanType}</span>
                      <span>{formatCurrency(loan.outstandingAmount ?? loan.remainingAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase">
                      <span>Rate: {loan.interestRate}% · Tenure: {loan.tenureMonths}m</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        loan.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        loan.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* 4. PDF Statement trigger */}
          <Button
            onClick={() => setIsStatementModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 font-bold bg-white dark:bg-navy-900 border border-[#FFD700]/30 hover:border-[#FFD700] text-slate-900 dark:text-[#FFD700] p-3.5 hover:shadow-gold-glow cursor-pointer transition-all active:scale-[0.99] rounded-2xl"
          >
            <Download className="w-5 h-5" />
            <span>Download Bank Statement (PDF)</span>
          </Button>
        </div>
      </div>

      {/* Interactive Simulated Deposit Modal */}
      <Modal 
        isOpen={isDepositOpen} 
        onClose={() => setIsDepositOpen(false)} 
        title={
          depositType === 'deposit' 
            ? 'Mock ATM Cash Deposit' 
            : depositType === 'bills' 
              ? 'Mock Utilities Bill Payment' 
              : 'Mock Payment Request'
        }
      >
        <form onSubmit={handleDepositSubmit} className="flex flex-col gap-4 font-sans">
          <p className="text-xs text-slate-400 leading-relaxed select-none">
            {depositType === 'deposit'
              ? 'Select your target bank account and input cash deposit volumes. This will instantly credit the selected balance for testing convenience.'
              : depositType === 'bills'
                ? 'Select payment utility and input amount. Payment will be deducted instantly.'
                : 'Select account to generate inbound request mock.'
            }
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Target Account Profile
            </label>
            <select
              value={selectedAccNumber}
              onChange={(e) => setSelectedAccNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-sm"
            >
              <option value="">-- Select Account --</option>
              {summaryData?.accounts?.map((acc) => (
                <option key={acc.id} value={acc.accountNumber}>
                  {acc.accountType || 'Account'} ({acc.accountNumber || 'N/A'}) - Balance: {formatCurrency(acc.balance || 0)}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Deposit Value / Amount (₹)"
            placeholder="e.g. 5000"
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />

          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button type="button" variant="outline" onClick={() => setIsDepositOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={depositLoading} className="bg-[#FFD700] hover:bg-[#ca8a04]">
              {depositType === 'deposit' ? 'Post ATM Cash' : depositType === 'bills' ? 'Post Utility Bill' : 'Confirm Request'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Statement Download Modal */}
      <StatementDownloadModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        onDownload={downloadPdfStatement}
        accounts={summaryData?.accounts || []}
      />
    </div>
  );
};
export default Dashboard;
