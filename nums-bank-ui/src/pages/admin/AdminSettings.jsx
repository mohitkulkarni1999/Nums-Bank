import React, { useState, useEffect } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Toast from '../../components/UI/Toast';
import { 
  Settings, 
  Percent,
  DollarSign,
  Loader2,
  Save,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Interest rates
  const [interestRates, setInterestRates] = useState({
    savingsRate: 4.0,
    currentRate: 3.5,
    loanRate: 10.5,
    fixedDepositRate: 6.5
  });

  // Fees
  const [fees, setFees] = useState({
    transactionFee: 5.0,
    accountMaintenanceFee: 100.0,
    minimumBalance: 1000.0
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [ratesRes, feesRes] = await Promise.all([
        api.get('/admin/config/interest-rates'),
        api.get('/admin/config/fees')
      ]);
      
      setInterestRates(ratesRes.data || interestRates);
      setFees(feesRes.data || fees);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      Toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveInterestRates = async () => {
    setSaving(true);
    try {
      await api.put('/admin/config/interest-rates', interestRates);
      Toast.success('Interest rates updated successfully.');
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to update interest rates.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFees = async () => {
    setSaving(true);
    try {
      await api.put('/admin/config/fees', fees);
      Toast.success('Fees updated successfully.');
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to update fees.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#FFD700]" />
          <span>System Configuration</span>
        </h2>
        <p className="text-sm text-slate-400">
          Manage interest rates, fees, and bank-wide settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interest Rates */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-500" />
              <span>Interest Rates</span>
            </h3>
            <Button
              variant="outline"
              onClick={fetchSettings}
              className="py-1 px-2 text-[10px]"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500">Savings Account Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={interestRates.savingsRate}
                onChange={(e) => setInterestRates({ ...interestRates, savingsRate: parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500">Current Account Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={interestRates.currentRate}
                onChange={(e) => setInterestRates({ ...interestRates, currentRate: parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500">Loan Interest Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={interestRates.loanRate}
                onChange={(e) => setInterestRates({ ...interestRates, loanRate: parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500">Fixed Deposit Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={interestRates.fixedDepositRate}
                onChange={(e) => setInterestRates({ ...interestRates, fixedDepositRate: parseFloat(e.target.value) })}
              />
            </div>

            <Button
              onClick={handleSaveInterestRates}
              loading={saving}
              className="mt-4"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Interest Rates
            </Button>
          </div>
        </Card>

        {/* Fees */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span>Fees & Charges</span>
            </h3>
            <Button
              variant="outline"
              onClick={fetchSettings}
              className="py-1 px-2 text-[10px]"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500">Transaction Fee (₹)</label>
              <Input
                type="number"
                step="0.01"
                value={fees.transactionFee}
                onChange={(e) => setFees({ ...fees, transactionFee: parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500">Account Maintenance Fee (₹/month)</label>
              <Input
                type="number"
                step="0.01"
                value={fees.accountMaintenanceFee}
                onChange={(e) => setFees({ ...fees, accountMaintenanceFee: parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500">Minimum Balance Requirement (₹)</label>
              <Input
                type="number"
                step="0.01"
                value={fees.minimumBalance}
                onChange={(e) => setFees({ ...fees, minimumBalance: parseFloat(e.target.value) })}
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl mt-4">
              <p className="text-[10px] text-slate-400 font-semibold mb-2">Fee Summary</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Fee:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{fees.transactionFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Maintenance Fee:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{fees.accountMaintenanceFee}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Min Balance:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{fees.minimumBalance}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveFees}
              loading={saving}
              className="mt-4"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Fees
            </Button>
          </div>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-900/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Configuration Guidelines</h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Interest rate changes will apply to new accounts and loans only</li>
              <li>• Fee changes will be reflected in the next billing cycle</li>
              <li>• Minimum balance changes affect all accounts immediately</li>
              <li>• All configuration changes are logged for audit purposes</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;
