import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Tooltip 
} from 'recharts';
import {
  Coins,
  TrendingUp,
  Landmark,
  Calculator,
  Activity,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';

// Interest rates per loan type (must match backend)
const LOAN_RATES = {
  HOME: 8.5,
  CAR: 9.2,
  PERSONAL: 11.5,
  EDUCATION: 7.8,
};

export const Loans = () => {
  const { user } = useAuth();

  // EMI Calculator sliders state
  const [calcPrincipal, setCalcPrincipal] = useState(1500000);
  const [calcRate, setCalcRate] = useState(8.5);
  const [calcTenure, setCalcTenure] = useState(15); // years

  // EMI Calculation outputs
  const [emiOutput, setEmiOutput] = useState({ emi: 0, totalInterest: 0, totalAmount: 0 });

  // Loan application fields state
  const [applyType, setApplyType] = useState('HOME');
  const [applyAmount, setApplyAmount] = useState('');
  const [applyTenure, setApplyTenure] = useState('');
  const [applyErrors, setApplyErrors] = useState({});
  const [applyLoading, setApplyLoading] = useState(false);

  // Active Loans state
  const [myLoans, setMyLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(true);

  // Prepayment Simulator state
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [prepayAmount, setPrepayAmount] = useState('');
  const [prepayType, setPrepayType] = useState('TENURE');
  const [prepayResult, setPrepayResult] = useState(null);
  const [prepayCalcLoading, setPrepayCalcLoading] = useState(false);

  // Pay off loan state
  const [payOffLoading, setPayOffLoading] = useState({});
  const [showPayOffConfirm, setShowPayOffConfirm] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  // Sync rate slider when loan type changes in apply form
  useEffect(() => {
    setCalcRate(LOAN_RATES[applyType] || 8.5);
  }, [applyType]);

  // Calculate EMI locally whenever sliders change
  useEffect(() => {
    const P = calcPrincipal;
    const monthlyRate = calcRate / 12 / 100;
    const N = calcTenure * 12;

    if (monthlyRate === 0 || N === 0) {
      setEmiOutput({ emi: P / (N || 1), totalInterest: 0, totalAmount: P });
      return;
    }

    const onePlusRN = Math.pow(1 + monthlyRate, N);
    const emi = (P * monthlyRate * onePlusRN) / (onePlusRN - 1);
    const totalAmount = emi * N;
    const totalInterest = totalAmount - P;

    setEmiOutput({ emi, totalInterest, totalAmount });
  }, [calcPrincipal, calcRate, calcTenure]);

  const loadMyLoans = async () => {
    setLoansLoading(true);
    try {
      const response = await api.get('/loans/my-loans');
      const loans = response.data || [];
      setMyLoans(loans);
      if (loans.length > 0) {
        setSelectedLoanId(String(loans[0].id));
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
      Toast.error('Failed to load loan accounts.');
    } finally {
      setLoansLoading(false);
    }
  };

  const loadAccounts = async () => {
    setAccountsLoading(true);
    try {
      const response = await api.get('/accounts/summary');
      const accountsData = response.data?.accounts || [];
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setSelectedAccountId(accountsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
      Toast.error('Failed to load accounts.');
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    loadMyLoans();
    loadAccounts();
  }, []);

  const validateApply = () => {
    const errors = {};
    const amt = parseFloat(applyAmount);
    const tenure = parseInt(applyTenure, 10);

    if (!applyAmount || isNaN(amt) || amt <= 0) {
      errors.applyAmount = 'Enter a valid loan amount.';
    } else if (amt < 10000) {
      errors.applyAmount = 'Minimum loan amount is ₹10,000.';
    } else if (amt > 50000000) {
      errors.applyAmount = 'Maximum loan amount is ₹5,00,00,000.';
    }

    if (!applyTenure || isNaN(tenure) || tenure <= 0) {
      errors.applyTenure = 'Enter a valid tenure in years.';
    } else if (tenure > 30) {
      errors.applyTenure = 'Maximum tenure is 30 years.';
    }

    return errors;
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    const errors = validateApply();
    if (Object.keys(errors).length > 0) {
      setApplyErrors(errors);
      return;
    }
    setApplyErrors({});
    setApplyLoading(true);

    try {
      await api.post('/loans/apply', {
        type: applyType,
        amount: parseFloat(applyAmount),
        tenure: parseInt(applyTenure, 10), // backend now converts years → months
      });
      Toast.success(`${applyType} Loan of ${formatCurrency(applyAmount)} approved successfully!`);
      setApplyAmount('');
      setApplyTenure('');
      loadMyLoans();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Loan application failed.');
    } finally {
      setApplyLoading(false);
    }
  };

  // Prepayment — calls real backend API
  const handlePrepaySimulate = async (e) => {
    e.preventDefault();
    const pAmt = parseFloat(prepayAmount);
    if (!prepayAmount || isNaN(pAmt) || pAmt <= 0) {
      Toast.error('Please enter a valid prepayment amount.');
      return;
    }
    if (!selectedLoanId) {
      Toast.error('Please select an active loan.');
      return;
    }

    setPrepayCalcLoading(true);
    setPrepayResult(null);
    try {
      const res = await api.post('/loans/prepayment-calculator', {
        loanId: parseInt(selectedLoanId, 10),
        extraAmount: pAmt,
      });
      const data = res.data;
      setPrepayResult({
        interestSaved: data.interestSaved,
        tenureReducedMonths: data.tenureReducedMonths,
        newOutstanding: data.newOutstanding,
        extraAmount: data.extraAmount,
      });
      Toast.success('Prepayment simulation complete.');
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Prepayment simulation failed.');
    } finally {
      setPrepayCalcLoading(false);
    }
  };

  // Pay off entire loan
  const handlePayOffLoan = async (loanId) => {
    setPayOffLoading(prev => ({ ...prev, [loanId]: true }));
    try {
      await api.post('/transactions/loan-payoff', { loanId, accountId: selectedAccountId });
      Toast.success('Loan paid off successfully!');
      setShowPayOffConfirm(null);
      loadMyLoans();
      loadAccounts();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to pay off loan.');
    } finally {
      setPayOffLoading(prev => ({ ...prev, [loanId]: false }));
    }
  };

  const chartData = [
    { name: 'Principal Amount', value: Math.round(calcPrincipal), color: '#0A1926' },
    { name: 'Total Interest Payable', value: Math.max(0, Math.round(emiOutput.totalInterest)), color: '#FFD700' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 font-sans pb-24 lg:pb-8">
      {/* Title */}
      <div className="flex flex-col gap-0.5 select-none">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Coins className="w-5 h-5 text-indigo-500" />
          <span>NetBanking Lending Liabilities Desk</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Calculate monthly EMIs, review outstanding balances, simulate prepayments, and apply for loan products.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* EMI Calculator */}
          <Card className="p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-6 select-none">
              <Calculator className="w-5 h-5 text-indigo-500" />
              <span>Interactive Loan EMI Amortization Calculator</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sliders */}
              <div className="flex flex-col gap-5 select-none">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                    <span>Target Loan Amount (Principal)</span>
                    <span className="text-[#FFD700] font-bold font-mono">₹{calcPrincipal.toLocaleString('en-IN')}</span>
                  </div>
                  <input type="range" min="100000" max="10000000" step="50000" value={calcPrincipal}
                    onChange={(e) => setCalcPrincipal(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-[#FFD700]" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                    <span>Interest Rate (p.a.)</span>
                    <span className="text-[#FFD700] font-bold font-mono">{calcRate.toFixed(1)}%</span>
                  </div>
                  <input type="range" min="5" max="15" step="0.1" value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-[#FFD700]" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                    <span>Repayment Tenure</span>
                    <span className="text-[#FFD700] font-bold font-mono">{calcTenure} Years</span>
                  </div>
                  <input type="range" min="1" max="30" step="1" value={calcTenure}
                    onChange={(e) => setCalcTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-[#FFD700]" />
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-navy-950 p-4 border border-slate-100 dark:border-navy-800 rounded-xl mt-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Monthly EMI</span>
                    <span className="text-xs font-extrabold text-[#ca8a04] dark:text-[#FFD700]">{formatCurrency(emiOutput.emi)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-l border-slate-200 dark:border-navy-800 pl-3">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Interest Payable</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatCurrency(emiOutput.totalInterest)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-l border-slate-200 dark:border-navy-800 pl-3">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Total Amount</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatCurrency(emiOutput.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="h-60 flex flex-col justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Prepayment Simulator — connected to real backend */}
          <Card className="p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-4 select-none">
              <TrendingUp className="w-5 h-5 text-[#FFD700]" />
              <span>Outstanding Prepayment Reduction Simulator</span>
            </h3>

            {myLoans.filter(l => l.status === 'ACTIVE').length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-4 text-center">
                No active loans available for prepayment simulation.
              </p>
            ) : (
              <form onSubmit={handlePrepaySimulate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end font-sans">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Select Loan Account</label>
                  <select
                    value={selectedLoanId}
                    onChange={(e) => { setSelectedLoanId(e.target.value); setPrepayResult(null); }}
                    className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm"
                  >
                    <option value="">-- Select Active Loan --</option>
                    {myLoans.filter(l => l.status === 'ACTIVE').map((l) => (
                      <option key={l.id} value={String(l.id)}>
                        {l.loanType} — Outstanding: {formatCurrency(l.outstandingAmount ?? l.remainingAmount)}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Extra Prepayment Amount (₹)"
                  placeholder="e.g. 50000"
                  type="number"
                  value={prepayAmount}
                  onChange={(e) => { setPrepayAmount(e.target.value); setPrepayResult(null); }}
                />

                <Button type="submit" loading={prepayCalcLoading} className="h-[46px] w-full bg-[#FFD700] hover:bg-[#ca8a04]">
                  Simulate Prepayment
                </Button>
              </form>
            )}

            {prepayResult && (
              <div className="mt-6 bg-[#fffbeb] dark:bg-[#FFD700]/5 border border-[#FFD700]/25 rounded-2xl p-5 flex flex-col gap-3.5 select-none animate-in fade-in slide-in-from-top-2 duration-300 text-xs">
                <h4 className="font-bold text-slate-800 dark:text-[#FFD700] text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Prepayment Simulation Results
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 uppercase tracking-widest text-[9px]">Interest Saved</span>
                    <span className="font-extrabold text-emerald-500 text-sm">{formatCurrency(prepayResult.interestSaved)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-t md:border-t-0 md:border-l border-slate-200 dark:border-navy-800 pt-2.5 md:pt-0 md:pl-4">
                    <span className="text-slate-400 uppercase tracking-widest text-[9px]">Tenure Reduced By</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">{prepayResult.tenureReducedMonths} Month(s)</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-t md:border-t-0 md:border-l border-slate-200 dark:border-navy-800 pt-2.5 md:pt-0 md:pl-4">
                    <span className="text-slate-400 uppercase tracking-widest text-[9px]">New Outstanding Principal</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">{formatCurrency(prepayResult.newOutstanding)}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Active Loans List */}
          <Card className="p-5 flex flex-col gap-4 border border-slate-100 dark:border-navy-800 select-none">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span>Outstanding Active Loan Portfolios</span>
            </h3>

            {loansLoading ? (
              <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#FFD700]" /></div>
            ) : myLoans.length === 0 ? (
              <span className="text-xs text-slate-400 text-center py-4 font-bold">No active loan accounts held.</span>
            ) : (
              <div className="flex flex-col gap-3 text-xs">
                {myLoans.map((l) => (
                  <div key={l.id} className="bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{l.loanType} LOAN</span>
                      <span className="text-[10px] text-slate-400">
                        Tenure: {Math.round(l.tenureMonths / 12)} Yrs | Rate: {l.interestRate}%
                      </span>
                      <span className={`text-[9px] font-bold mt-0.5 ${
                        l.status === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="flex flex-col text-right gap-2">
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{formatCurrency(l.outstandingAmount ?? l.remainingAmount)}</span>
                        <span className="text-[9px] font-bold text-slate-400">EMI: {formatCurrency(l.emiAmount)}</span>
                      </div>
                      {l.status === 'ACTIVE' && (
                        <button
                          onClick={() => setShowPayOffConfirm(l.id)}
                          disabled={payOffLoading[l.id]}
                          className="text-[10px] font-bold bg-[#FFD700] hover:bg-[#ca8a04] text-slate-900 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {payOffLoading[l.id] ? 'Processing...' : 'Pay All'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Apply for Loan */}
          <Card className="p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-4 select-none">
              <Landmark className="w-5 h-5 text-[#FFD700]" />
              <span>Apply for New Loan Account</span>
            </h3>

            <form onSubmit={handleApplyLoan} className="flex flex-col gap-4 font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loan Type</label>
                <select
                  value={applyType}
                  onChange={(e) => setApplyType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm"
                >
                  <option value="HOME">HOME LOAN — 8.5% p.a.</option>
                  <option value="CAR">CAR LOAN — 9.2% p.a.</option>
                  <option value="PERSONAL">PERSONAL LOAN — 11.5% p.a.</option>
                  <option value="EDUCATION">EDUCATION LOAN — 7.8% p.a.</option>
                </select>
              </div>

              <Input
                label="Requested Principal Amount (₹)"
                placeholder="Min ₹10,000"
                type="number"
                value={applyAmount}
                onChange={(e) => { setApplyAmount(e.target.value); setApplyErrors({}); }}
                error={applyErrors.applyAmount}
              />

              <Input
                label="Repayment Period (Years)"
                placeholder="1 – 30 years"
                type="number"
                value={applyTenure}
                onChange={(e) => { setApplyTenure(e.target.value); setApplyErrors({}); }}
                error={applyErrors.applyTenure}
              />

              {/* Preview EMI for the apply form values */}
              {applyAmount && applyTenure && !isNaN(parseFloat(applyAmount)) && !isNaN(parseInt(applyTenure)) && (
                <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-3 text-xs">
                  <span className="text-slate-500 font-semibold">Estimated Monthly EMI: </span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    {(() => {
                      const P = parseFloat(applyAmount);
                      const r = LOAN_RATES[applyType] / 12 / 100;
                      const n = parseInt(applyTenure) * 12;
                      if (!P || !n || P <= 0 || n <= 0) return '—';
                      const onePlusRN = Math.pow(1 + r, n);
                      return formatCurrency((P * r * onePlusRN) / (onePlusRN - 1));
                    })()}
                  </span>
                </div>
              )}

              <Button type="submit" loading={applyLoading} className="w-full mt-2 bg-[#FFD700] hover:bg-[#ca8a04]">
                Confirm Loan Request
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Pay Off Confirmation Modal */}
      {showPayOffConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Confirm Loan Payoff
              </h3>
              <button
                onClick={() => setShowPayOffConfirm(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const loan = myLoans.find(l => l.id === showPayOffConfirm);
              if (!loan) return null;
              return (
                <div className="flex flex-col gap-4">
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      You are about to pay off your entire loan balance:
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Loan Type:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{loan.loanType}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-slate-500 dark:text-slate-400">Amount to Pay:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(loan.outstandingAmount ?? loan.remainingAmount)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Select Account to Pay From:
                    </label>
                    <select
                      value={selectedAccountId || ''}
                      onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountType} - {acc.accountNumber} (Balance: {formatCurrency(acc.balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This action will mark your loan as fully paid and cannot be undone.
                  </p>

                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => setShowPayOffConfirm(null)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePayOffLoan(loan.id)}
                      disabled={payOffLoading[loan.id]}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {payOffLoading[loan.id] ? 'Processing...' : 'Confirm Payoff'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
export default Loans;
