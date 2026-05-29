import React, { useState, useEffect } from 'react';
import useTransactions from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import BeneficiaryModal from '../components/Transactions/BeneficiaryModal';
import ConfirmationModal from '../components/Transactions/ConfirmationModal';
import Toast from '../components/UI/Toast';
import api from '../services/api';
import { 
  SendHorizontal, 
  UserPlus, 
  Search,
  CheckCircle2,
  Landmark, 
  Binary, 
  ShieldAlert,
  User,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { validateIfsc } from '../utils/validators';
import { formatCurrency } from '../utils/formatters';

export const SendMoney = () => {
  const { user } = useAuth();
  const { 
    getAccountSummary, 
    getBeneficiaries, 
    addBeneficiary, 
    sendMoney, 
    loading: txnLoading 
  } = useTransactions();

  // Core Data States
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedFromAcc, setSelectedFromAcc] = useState('');
  
  // Tab Controller
  const [transferMode, setTransferMode] = useState('search'); // 'search', 'saved', 'manual'
  
  // Search Mode States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSearchUser, setSelectedSearchUser] = useState(null);

  // Beneficiary Dropdown Selection State
  const [selectedBenId, setSelectedBenId] = useState('');
  
  // Manual Coordinates
  const [manualAccount, setManualAccount] = useState('');
  const [manualIfsc, setManualIfsc] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualBank, setManualBank] = useState('');

  // Transfer Parameters
  const [amount, setAmount] = useState('');
  const [txnType, setTxnType] = useState('IMPS'); // IMPS, RTGS, NEFT
  const [remarks, setRemarks] = useState('');

  // Modals Controller
  const [isBenOpen, setIsBenOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Validation / Loading States
  const [errors, setErrors] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [benSavingLoading, setBenSavingLoading] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState({});

  const loadData = async () => {
    setPageLoading(true);
    const summaryRes = await getAccountSummary();
    const benRes = await getBeneficiaries();
    
    if (summaryRes.success) {
      setAccounts(summaryRes.data.accounts || []);
      if (summaryRes.data.accounts?.length > 0) {
        setSelectedFromAcc(summaryRes.data.accounts[0].id);
      }
    }
    if (benRes.success) {
      setBeneficiaries(benRes.data || []);
    }
    setPageLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Bank name auto detection based on IFSC prefixes (Manual mode)
  useEffect(() => {
    const code = manualIfsc.toUpperCase().trim();
    if (code.length >= 4) {
      const prefix = code.slice(0, 4);
      if (prefix === 'UTIB') setManualBank('Axis Bank');
      else if (prefix === 'HDFC') setManualBank('HDFC Bank');
      else if (prefix === 'ICIC') setManualBank('ICICI Bank');
      else if (prefix === 'SBIN') setManualBank('State Bank of India');
      else if (prefix === 'BARB') setManualBank('Bank of Baroda');
      else if (prefix === 'PUNB') setManualBank('Punjab National Bank');
      else setManualBank('');
    } else {
      setManualBank('');
    }
  }, [manualIfsc]);

  // Live Query Searching on user input
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await api.get(`/accounts/search?q=${searchQuery}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const selectSearchResult = (item) => {
    setSelectedSearchUser(item);
    setManualAccount(item.accountNumber);
    setManualIfsc(item.ifscCode);
    setManualName(item.beneficiaryName);
    setManualBank(item.bankName);
    setSearchResults([]);
    setSearchQuery('');
  };

  const clearSelectedSearchUser = () => {
    setSelectedSearchUser(null);
    setManualAccount('');
    setManualIfsc('');
    setManualName('');
    setManualBank('');
  };

  const handleContinueClick = (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    // 1. Validate Source Account Balance
    const srcAccount = accounts.find(a => String(a.id) === String(selectedFromAcc));
    if (!srcAccount) {
      Toast.error('Please select a valid source account.');
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value < 1 || value > 1000000) {
      newErrors.amount = 'Transfer amount must be between ₹1.00 and ₹10,00,000.00.';
    } else if (srcAccount.balance < value) {
      newErrors.amount = `Insufficient account balance. Available: ${formatCurrency(srcAccount.balance)}`;
    }

    // 2. Validate transaction type parameters (RTGS requires 2L+)
    if (txnType === 'RTGS' && value < 200000) {
      newErrors.amount = 'RTGS channel transfers require a minimum of ₹2,00,000.00.';
    }

    // 3. Validate Destination Payee coordinates based on Transfer Mode
    let benDetails = {};

    if (transferMode === 'search') {
      if (!selectedSearchUser) {
        Toast.error('Please search and select a NUMS Bank user to continue.');
        return;
      }
      benDetails = {
        beneficiaryName: manualName,
        accountNumber: manualAccount,
        ifscCode: manualIfsc,
        bankName: manualBank,
      };
    } else if (transferMode === 'saved') {
      if (!selectedBenId) {
        Toast.error('Please select a beneficiary payee.');
        return;
      }
      const targetBen = beneficiaries.find(b => String(b.id) === String(selectedBenId));
      if (!targetBen) {
        Toast.error('Selected beneficiary not found.');
        return;
      }
      benDetails = {
        beneficiaryName: targetBen.beneficiaryName,
        accountNumber: targetBen.accountNumber,
        ifscCode: targetBen.ifscCode,
        bankName: targetBen.bankName,
      };
    } else {
      // Manual Mode
      if (!manualName.trim()) newErrors.manualName = 'Payee Name is required.';
      if (!manualAccount.trim()) newErrors.manualAccount = 'Account Number is required.';
      if (!manualIfsc.trim()) newErrors.manualIfsc = 'IFSC is required.';
      else if (!validateIfsc(manualIfsc)) newErrors.manualIfsc = 'Invalid IFSC code structure.';
      if (!manualBank.trim()) newErrors.manualBank = 'Bank Name is required.';

      benDetails = {
        beneficiaryName: manualName.trim(),
        accountNumber: manualAccount.trim(),
        ifscCode: manualIfsc.toUpperCase().trim(),
        bankName: manualBank.trim(),
      };
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Toast.error('Please fix validation inputs before continuing.');
      return;
    }

    // Set confirmation properties and trigger double confirmation modal
    setConfirmDetails({
      fromAccountId: srcAccount.id,
      fromAccountName: `${srcAccount.accountType} (${srcAccount.accountNumber})`,
      amount: value,
      transactionType: txnType,
      remarks: remarks.trim() || 'Instant Funds Transfer',
      ...benDetails
    });

    setIsConfirmOpen(true);
  };

  const handleAuthorizeTransfer = async (transactionPin) => {
    const transferPayload = {
      fromAccountId: confirmDetails.fromAccountId,
      toAccountNumber: confirmDetails.accountNumber,
      amount: confirmDetails.amount,
      remarks: confirmDetails.remarks,
      transactionType: confirmDetails.transactionType,
      transactionPin: transactionPin,
    };

    const result = await sendMoney(transferPayload);
    if (result.success) {
      setIsConfirmOpen(false);
      
      // Confetti!
      confetti({
        particleCount: 150,
        spread: 75,
        origin: { y: 0.6 }
      });

      Toast.success('Transfer completed successfully!');
      
      // Reset Form fields
      setAmount('');
      setRemarks('');
      setSelectedBenId('');
      clearSelectedSearchUser();
      
      // Reload Summary
      loadData();
    } else {
      Toast.error(result.error);
    }
  };

  const handleSaveNewBeneficiary = async (beneficiaryData) => {
    setBenSavingLoading(true);
    const result = await addBeneficiary(beneficiaryData);
    setBenSavingLoading(false);
    
    if (result.success) {
      Toast.success(`Payee "${beneficiaryData.name}" added successfully.`);
      setIsBenOpen(false);
      const benRes = await getBeneficiaries();
      if (benRes.success) {
        setBeneficiaries(benRes.data || []);
      }
    } else {
      Toast.error(result.error);
    }
  };

  const handleRemoveBeneficiary = async (beneficiaryId, beneficiaryName) => {
    if (!confirm(`Are you sure you want to remove "${beneficiaryName}" from your saved payees?`)) {
      return;
    }

    try {
      await api.delete(`/transactions/beneficiary/${beneficiaryId}`);
      Toast.success('Beneficiary removed successfully.');
      const benRes = await getBeneficiaries();
      if (benRes.success) {
        setBeneficiaries(benRes.data || []);
        setSelectedBenId('');
      }
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to remove beneficiary.');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans pb-24 lg:pb-8">
      {/* Page Title */}
      <div className="flex flex-col gap-0.5 select-none animate-in fade-in slide-in-from-top-3 duration-300">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <SendHorizontal className="w-5.5 h-5.5 text-indigo-500" />
          <span>Outbound Funds Transfer</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Transfer money instantly via IMPS, RTGS, or NEFT channels securely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Panel */}
        <form onSubmit={handleContinueClick} className="lg:col-span-2 flex flex-col gap-5">
          <Card className="p-6 flex flex-col gap-5 border border-slate-100 dark:border-navy-800 shadow-md">
            
            {/* 1. Debit Account Selector */}
            <div className="flex flex-col gap-1.5 animate-in fade-in duration-300">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Debit Source Account
              </label>
              <select
                value={selectedFromAcc}
                onChange={(e) => setSelectedFromAcc(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-sm font-semibold"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountType} ({acc.accountNumber}) - Available: {formatCurrency(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-navy-800 pt-4 animate-in fade-in duration-400">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Choose Payee Destination Mode
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-navy-950 p-1.5 rounded-xl border border-slate-150 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => { setTransferMode('search'); clearSelectedSearchUser(); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    transferMode === 'search'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Search User
                </button>
                <button
                  type="button"
                  onClick={() => { setTransferMode('saved'); clearSelectedSearchUser(); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    transferMode === 'saved'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Saved Payees
                </button>
                <button
                  type="button"
                  onClick={() => { setTransferMode('manual'); clearSelectedSearchUser(); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    transferMode === 'manual'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Manual Coordinates
                </button>
              </div>

              {/* MODE 1: Search Nums Bank User */}
              {transferMode === 'search' && (
                <div className="flex flex-col gap-3 relative animate-in fade-in duration-300">
                  {!selectedSearchUser ? (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search Nums Bank payee by name or mobile number..."
                          className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 transition-all font-medium"
                        />
                      </div>

                      {/* Loading status */}
                      {searchLoading && (
                        <div className="text-xs text-indigo-500 font-semibold pl-2">
                          Searching the operations ledger...
                        </div>
                      )}

                      {/* Dropdown Results list */}
                      {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-30 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-xl mt-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          {searchResults.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => selectSearchResult(item)}
                              className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-navy-800 border-b last:border-0 border-slate-100 dark:border-navy-800 cursor-pointer transition-all flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                  <User className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.beneficiaryName}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">A/c: {item.accountNumber} · {item.bankName}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                                {item.accountType}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Search empty state */}
                      {searchQuery.trim().length >= 2 && searchResults.length === 0 && !searchLoading && (
                        <p className="text-xs text-amber-500 font-bold pl-2">
                          No matching active accounts found on the NUMS ledger.
                        </p>
                      )}
                    </>
                  ) : (
                    /* Search target selected display card */
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Payee Verified
                          </span>
                          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                            {manualName}
                          </span>
                          <span className="text-xs text-slate-400 font-medium mt-0.5">
                            Account: {manualAccount} · Bank: {manualBank} (IFSC: {manualIfsc})
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedSearchUser}
                        className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Reset Search
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: Saved Beneficiaries */}
              {transferMode === 'saved' && (
                <div className="flex flex-col gap-3.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Select one of your saved payees:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsBenOpen(true)}
                        className="text-xs font-bold text-indigo-600 dark:text-[#FFD700] flex items-center gap-1 hover:underline"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Add New Payee</span>
                      </button>
                      {selectedBenId && (
                        <button
                          type="button"
                          onClick={() => {
                            const selectedBen = beneficiaries.find(b => String(b.id) === String(selectedBenId));
                            if (selectedBen) {
                              handleRemoveBeneficiary(selectedBen.id, selectedBen.beneficiaryName);
                            }
                          }}
                          className="text-xs font-bold text-red-500 flex items-center gap-1 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove Selected</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <select
                    value={selectedBenId}
                    onChange={(e) => setSelectedBenId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-sm"
                  >
                    <option value="">-- Choose Pre-registered Payee --</option>
                    {beneficiaries.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.beneficiaryName} ({b.accountNumber} - {b.bankName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* MODE 3: Manual Coordinates */}
              {transferMode === 'manual' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-100 dark:border-navy-800 animate-in fade-in duration-300">
                  <Input
                    label="Payee Account Number"
                    placeholder="Enter manual account number"
                    icon={Binary}
                    value={manualAccount}
                    onChange={(e) => setManualAccount(e.target.value.replace(/\D/g, ''))}
                    error={errors.manualAccount}
                  />

                  <Input
                    label="IFSC Coordinates"
                    placeholder="e.g. UTIB0000001"
                    icon={Landmark}
                    value={manualIfsc}
                    onChange={(e) => setManualIfsc(e.target.value.toUpperCase().trim())}
                    error={errors.manualIfsc}
                  />

                  <Input
                    label="Beneficiary Full Name"
                    placeholder="Registered name"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    error={errors.manualName}
                  />

                  <Input
                    label="Bank Name (Auto Detected)"
                    placeholder="Resolving..."
                    value={manualBank}
                    onChange={(e) => setManualBank(e.target.value)}
                    error={errors.manualBank}
                  />
                </div>
              )}
            </div>

            {/* 3. Amount and channel values */}
            <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-navy-800 pt-4 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Enter Transfer Amount (₹)"
                  placeholder="Min ₹1.00, Max ₹10,00,000.00"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  error={errors.amount}
                />

                {/* Transfer Channel types */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Transaction Channel
                  </span>
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-navy-950 p-1.5 rounded-lg border border-slate-150 dark:border-navy-800 h-[46px] items-center">
                    {['IMPS', 'NEFT', 'RTGS'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTxnType(type)}
                        className={`py-1.5 text-xs font-bold rounded-md select-none transition-all ${
                          txnType === type
                            ? 'bg-[#FFD700] text-slate-900 dark:text-[#0A1926] shadow-gold-glow'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Transfer Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks (e.g. rent payment, consulting fee)"
                  rows="2"
                  className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] text-sm transition-all"
                />
              </div>
            </div>

            {/* Submits */}
            <div className="border-t border-slate-100 dark:border-navy-800 pt-4 mt-2 flex justify-end">
              <Button type="submit" className="w-48 bg-[#FFD700] hover:bg-[#ca8a04] font-bold">
                Continue to Transfer
              </Button>
            </div>
          </Card>
        </form>

        {/* Right Info Box */}
        <div className="lg:col-span-1 flex flex-col gap-5 select-none animate-in fade-in duration-400">
          <Card className="p-5 flex flex-col gap-3.5 border border-slate-100 dark:border-navy-800 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Safe Transfer Guidelines</span>
            </h3>
            <ul className="text-xs text-slate-400 leading-relaxed list-disc pl-4 flex flex-col gap-2">
              <li>
                <strong className="text-slate-600 dark:text-slate-300">IMPS:</strong> Real-time instant settlements, maximum ₹5,00,000 per transfer.
              </li>
              <li>
                <strong className="text-slate-600 dark:text-slate-300">NEFT:</strong> Hourly settlement batches, available 24/7/365.
              </li>
              <li>
                <strong className="text-slate-600 dark:text-slate-300">RTGS:</strong> High-value transfers, requires a minimum volume of <span className="font-semibold text-[#FFD700]">₹2,00,000.00</span>.
              </li>
              <li>
                Never share your 6-digit transaction authorization PIN or OTPs with anyone, including bank staff.
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Add Payee modal overlay */}
      <BeneficiaryModal
        isOpen={isBenOpen}
        onClose={() => setIsBenOpen(false)}
        onSave={handleSaveNewBeneficiary}
        loading={benSavingLoading}
      />

      {/* Double confirmation authorization modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleAuthorizeTransfer}
        details={confirmDetails}
        loading={txnLoading}
      />
    </div>
  );
};

export default SendMoney;
