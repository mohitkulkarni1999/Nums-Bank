import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import api from '../services/api';
import { Lock, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

export const TransactionPinSetup = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState('setup'); // 'setup' or 'reset'
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateSetup = () => {
    const newErrors = {};
    
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      newErrors.pin = 'PIN must be exactly 6 digits';
    }
    
    if (!confirmPin || confirmPin !== pin) {
      newErrors.confirmPin = 'PINs do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateReset = () => {
    const newErrors = {};
    
    if (!oldPin || oldPin.length !== 6 || !/^\d{6}$/.test(oldPin)) {
      newErrors.oldPin = 'Current PIN must be exactly 6 digits';
    }
    
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      newErrors.pin = 'New PIN must be exactly 6 digits';
    }
    
    if (!confirmPin || confirmPin !== pin) {
      newErrors.confirmPin = 'New PINs do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    
    if (!validateSetup()) {
      Toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      await api.post('/transactions/pin/setup', { pin });
      Toast.success('Transaction PIN set up successfully!');
      setPin('');
      setConfirmPin('');
      setMode('reset');
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to set up Transaction PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (!validateReset()) {
      Toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      await api.post('/transactions/pin/reset', { oldPin, newPin: pin });
      Toast.success('Transaction PIN reset successfully!');
      setOldPin('');
      setPin('');
      setConfirmPin('');
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to reset Transaction PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Lock className="w-6 h-6 text-[#FFD700]" />
          <span>Transaction PIN</span>
        </h2>
        <p className="text-sm text-slate-400">
          Secure your transactions with a 6-digit PIN
        </p>
      </div>

      {/* Mode Toggle */}
      <Card className="p-4">
        <div className="flex gap-2 bg-slate-50 dark:bg-navy-950 p-1.5 rounded-xl border border-slate-100 dark:border-navy-800">
          <button
            type="button"
            onClick={() => setMode('setup')}
            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${
              mode === 'setup'
                ? 'bg-[#FFD700] text-slate-900 dark:text-[#0A1926] shadow-gold-glow'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Set Up PIN
          </button>
          <button
            type="button"
            onClick={() => setMode('reset')}
            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${
              mode === 'reset'
                ? 'bg-[#FFD700] text-slate-900 dark:text-[#0A1926] shadow-gold-glow'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Change PIN
          </button>
        </div>
      </Card>

      {/* Setup Form */}
      {mode === 'setup' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Set Up Transaction PIN</h3>
              <p className="text-xs text-slate-400">Create a 6-digit PIN for authorizing transactions</p>
            </div>
          </div>

          <form onSubmit={handleSetup} className="flex flex-col gap-5">
            <Input
              label="Create 6-digit PIN"
              type="password"
              placeholder="Enter 6-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={errors.pin}
              maxLength={6}
              icon={Lock}
            />

            <Input
              label="Confirm PIN"
              type="password"
              placeholder="Re-enter 6-digit PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={errors.confirmPin}
              maxLength={6}
              icon={CheckCircle2}
            />

            <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>Important:</strong> Never share your Transaction PIN with anyone. This PIN is required for all fund transfers.
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Set Up Transaction PIN
            </Button>
          </form>
        </Card>
      )}

      {/* Reset Form */}
      {mode === 'reset' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Change Transaction PIN</h3>
              <p className="text-xs text-slate-400">Update your existing transaction PIN</p>
            </div>
          </div>

          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <Input
              label="Current PIN"
              type="password"
              placeholder="Enter current 6-digit PIN"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={errors.oldPin}
              maxLength={6}
              icon={Lock}
            />

            <Input
              label="New PIN"
              type="password"
              placeholder="Enter new 6-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={errors.pin}
              maxLength={6}
              icon={Lock}
            />

            <Input
              label="Confirm New PIN"
              type="password"
              placeholder="Re-enter new 6-digit PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={errors.confirmPin}
              maxLength={6}
              icon={CheckCircle2}
            />

            <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>Security Note:</strong> After 3 failed attempts, your PIN will be locked and you'll need to contact support.
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Change Transaction PIN
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default TransactionPinSetup;
