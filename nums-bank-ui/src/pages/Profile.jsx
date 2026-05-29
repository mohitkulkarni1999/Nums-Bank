import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import { 
  UserCircle2, 
  Lock, 
  Sliders, 
  HeartHandshake, 
  ShieldCheck, 
  User, 
  Phone, 
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { maskPan, maskAadhar } from '../utils/formatters';
import api from '../services/api';

export const Profile = () => {
  const { user, updateUserContext } = useAuth();

  // Profile fields state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Sliders Transfer Limits state
  const [dailyLimit, setDailyLimit] = useState(500000); // 5L
  const [perTxnLimit, setPerTxnLimit] = useState(200000); // 2L

  // Nominee fields state
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('');
  const [nomineeAge, setNomineeAge] = useState('');
  const [nomineeAlloc, setNomineeAlloc] = useState('100');
  const [nomineeRegistered, setNomineeRegistered] = useState(false);

  // Toggles states
  const [isTwoFactor, setIsTwoFactor] = useState(false);
  const [isSmsAlert, setIsSmsAlert] = useState(true);

  // Profile update submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      Toast.error('Please enter valid name and phone fields.');
      return;
    }

    setProfileLoading(true);
    try {
      const response = await api.put('/auth/profile', { fullName, phone });
      updateUserContext(response.data);
      Toast.success('Profile details updated successfully.');
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Password reset submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.error('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      Toast.error('New password must be at least 8 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      Toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Current password check failed.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Limits update
  const handleLimitsSave = () => {
    Toast.success(`Limits updated! Daily: ₹${dailyLimit.toLocaleString('en-IN')}, Per-Txn: ₹${perTxnLimit.toLocaleString('en-IN')}`);
  };

  // Nominee update
  const handleNomineeSubmit = (e) => {
    e.preventDefault();
    if (!nomineeName.trim() || !nomineeRelation || !nomineeAge) {
      Toast.error('Please fill all nominee fields.');
      return;
    }
    setNomineeRegistered(true);
    Toast.success('Nominee registered successfully for account estate.');
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 font-sans pb-24 lg:pb-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col gap-0.5 select-none">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <UserCircle2 className="w-5.5 h-5.5 text-indigo-500" />
          <span>Security Controls & User Profile</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Manage your personal details, secure limits, Nominee declarations, and credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal info & Toggles */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* User details Card */}
          <Card className="p-6 flex flex-col items-center gap-4 text-center select-none">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-[#FFD700] rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl shadow-lg">
              {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'UI'}
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{user?.fullName}</h3>
              <span className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold uppercase tracking-wider mt-0.5">
                Nums Client ID: {user?.id * 3824}
              </span>
            </div>

            {/* Masked credentials list */}
            <div className="w-full border-t border-slate-100 dark:border-navy-800 pt-4 mt-2 flex flex-col gap-3 text-left text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Registered Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span>PAN Security Token</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono tracking-wider">{maskPan(user?.panNumber)}</span>
              </div>
              <div className="flex justify-between">
                <span>Aadhaar UID Token</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono tracking-wider">{user?.aadharMasked || maskAadhar(user?.aadharMasked)}</span>
              </div>
            </div>
          </Card>

          {/* Security Toggles Card */}
          <Card className="p-6 flex flex-col gap-4 border border-slate-100 dark:border-navy-800 select-none">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span>Two-Factor Authentication & Alerts</span>
            </h3>

            <div className="flex flex-col gap-3.5 mt-1">
              {/* 2FA Toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">2-Factor Authentication (2FA)</span>
                  <span className="text-[10px] text-slate-400 leading-tight">Requests OTP pin for logins</span>
                </div>
                <input
                  type="checkbox"
                  checked={isTwoFactor}
                  onChange={(e) => {
                    setIsTwoFactor(e.target.checked);
                    Toast.success(e.target.checked ? '2FA Enabled.' : '2FA Deactivated.');
                  }}
                  className="rounded bg-navy-950 border-white/10 text-[#FFD700] w-4.5 h-4.5"
                />
              </label>

              {/* SMS Alert Toggle */}
              <label className="flex items-center justify-between cursor-pointer border-t border-slate-100 dark:border-navy-800 pt-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Real-Time SMS Alerts</span>
                  <span className="text-[10px] text-slate-400 leading-tight">SMS alerts sent for debits/credits</span>
                </div>
                <input
                  type="checkbox"
                  checked={isSmsAlert}
                  onChange={(e) => {
                    setIsSmsAlert(e.target.checked);
                    Toast.success(e.target.checked ? 'SMS Alerts enabled.' : 'SMS Alerts disabled.');
                  }}
                  className="rounded bg-navy-950 border-white/10 text-[#FFD700] w-4.5 h-4.5"
                />
              </label>
            </div>
          </Card>
        </div>

        {/* Middle and Right: Forms Grid */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Profile Details and Change Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Edit details form */}
            <Card className="p-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-4 select-none">
                <User className="w-5 h-5 text-[#FFD700]" />
                <span>Modify Profile Details</span>
              </h3>
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                <Input
                  label="Registered Full Name"
                  placeholder="Official Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  label="Registered Phone Number"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                />
                <Button type="submit" loading={profileLoading} className="w-full mt-2">
                  Update Account Profile
                </Button>
              </form>
            </Card>

            {/* Change Password form */}
            <Card className="p-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-4 select-none">
                <Lock className="w-5 h-5 text-indigo-500" />
                <span>Reset Netbanking Password</span>
              </h3>
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                <Input
                  label="Current Password"
                  placeholder="••••••••"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="New Secure Password"
                  placeholder="••••••••"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label="Confirm New Password"
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button type="submit" loading={passwordLoading} className="w-full mt-2">
                  Confirm Password Change
                </Button>
              </form>
            </Card>
          </div>

          {/* Limits Slider adjustment card */}
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 select-none">
              <Sliders className="w-5 h-5 text-[#FFD700]" />
              <span>Interactive Transfer Limit Sliders</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none mt-2">
              {/* Daily Limit */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Daily Aggregate Threshold</span>
                  <span className="text-[#FFD700] font-bold font-mono">₹{dailyLimit.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
                />
              </div>

              {/* Per-transaction Limit */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Per-Transaction Limit</span>
                  <span className="text-[#FFD700] font-bold font-mono">₹{perTxnLimit.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="10000"
                  value={perTxnLimit}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= dailyLimit) {
                      setPerTxnLimit(val);
                    } else {
                      Toast.error('Per-transaction limit cannot exceed daily limit.');
                    }
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
                />
              </div>
            </div>

            <Button onClick={handleLimitsSave} className="w-48 self-end mt-2">
              Save Channels limits
            </Button>
          </Card>

          {/* Nominee details form */}
          <Card className="p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-4 select-none">
              <HeartHandshake className="w-5 h-5 text-indigo-500" />
              <span>Nominee Account Declarations</span>
            </h3>

            {nomineeRegistered ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/10 flex items-start gap-3 select-none">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Nominee Registered Successfully</span>
                  <span>Registered: <strong className="text-slate-700 dark:text-slate-200">{nomineeName}</strong> ({nomineeRelation}, Age: {nomineeAge}) assigned with {nomineeAlloc}% allocation share.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNomineeSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <Input
                  label="Nominee Full Name"
                  placeholder="Nominee name"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  className="md:col-span-1"
                />
                <div className="flex flex-col gap-1.5 md:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Relationship</label>
                  <select
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm"
                  >
                    <option value="">-- Choose --</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                  </select>
                </div>
                <Input
                  label="Nominee Age"
                  placeholder="Age"
                  type="number"
                  value={nomineeAge}
                  onChange={(e) => setNomineeAge(e.target.value)}
                  className="md:col-span-1"
                />
                <Button type="submit" className="md:col-span-1 h-[46px] w-full bg-[#FFD700] hover:bg-[#ca8a04]">
                  Register Nominee
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Profile;
