import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Landmark, Binary, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';

export const Login = () => {
  const { login, register, forgotPassword, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Mode controllers
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isOtpVerification, setIsOtpVerification] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Registration Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPan, setRegPan] = useState('');
  const [regAadhar, setRegAadhar] = useState('');

  // Password Recovery Fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');

  // UI state variables
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!email || !password) {
      setErrors({
        email: !email ? 'Email address is required.' : '',
        password: !password ? 'Password is required.' : '',
      });
      triggerShake();
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      Toast.success(`Welcome back to NUMS BANK!`);
      navigate('/dashboard');
    } else {
      Toast.error(result.error);
      triggerShake();
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Quick validation
    const newErrors = {};
    if (!regName.trim()) newErrors.name = 'Full Name is required.';
    if (!regEmail.trim()) newErrors.email = 'Email address is required.';
    if (!regPhone.trim()) newErrors.phone = 'Phone number is required.';
    if (!regPassword || regPassword.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (!regPan.trim() || regPan.length !== 10) newErrors.pan = 'PAN Number must be 10 characters.';
    if (!regAadhar.trim() || regAadhar.length !== 12) newErrors.aadhar = 'Aadhaar must be exactly 12 digits.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerShake();
      return;
    }

    setLoading(true);
    const result = await register(regName, regEmail, regPhone, regPassword, regPan, regAadhar);
    setLoading(false);

    if (result.success) {
      Toast.success('Registration successful! You can now log in.');
      setIsRegisterMode(false);
      // Auto fill registered email for ease of use
      setEmail(regEmail);
      // Reset registration form
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegPan('');
      setRegAadhar('');
    } else {
      Toast.error(result.error);
      triggerShake();
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      Toast.error('Please enter your email.');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(forgotEmail);
    setLoading(false);

    if (result.success) {
      Toast.success('Mock OTP generated! Check browser output console or inputs.');
      setIsOtpVerification(true);
    } else {
      Toast.error(result.error);
    }
  };

  const handleOtpVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || !recoveryPassword) {
      Toast.error('OTP and New Password are required.');
      return;
    }

    setLoading(true);
    const result = await verifyOtp(forgotEmail, otpCode, recoveryPassword);
    setLoading(false);

    if (result.success) {
      Toast.success('Password successfully changed! Log in now.');
      setIsForgotMode(false);
      setIsOtpVerification(false);
      setEmail(forgotEmail);
      setForgotEmail('');
      setOtpCode('');
      setRecoveryPassword('');
    } else {
      Toast.error(result.error);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 dark:from-[#030712] dark:via-[#0A1926] dark:to-[#11293e] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative Gold Rings */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-gradient-radial from-[#FFD700]/5 to-transparent pointer-events-none blur-3xl select-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-gradient-radial from-[#FFD700]/5 to-transparent pointer-events-none blur-3xl select-none" />

      {/* Main Container Card with slide-in transition */}
      <div 
        className={`w-full max-w-md bg-white/5 dark:bg-navy-900/50 backdrop-blur-xl border border-white/10 dark:border-[#FFD700]/15 rounded-3xl p-8 shadow-gold-glow-lg transition-all duration-500 transform translate-y-0
          ${shake ? 'animate-shake' : ''}
        `}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-8 select-none">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FFD700] to-yellow-500 text-slate-900 dark:text-[#0A1926] font-black text-2xl shadow-gold-glow border border-[#FFD700]/20">
            N
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider text-[#FFD700] mt-1 font-sans">
            NUMS BANK
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Secure Digital Banking Gateway
          </p>
        </div>

        {/* 1. LOGIN MODE */}
        {!isRegisterMode && !isForgotMode && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
            <Input
              label="Digital Netbanking ID / Email"
              placeholder="Enter email address"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              label="Account Password"
              placeholder="••••••••"
              icon={Lock}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            {/* Remember Me and Forgot password */}
            <div className="flex items-center justify-between text-xs select-none">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-navy-950 border-white/10 text-[#FFD700] focus:ring-0 focus:ring-offset-0 focus:outline-none w-4 h-4"
                />
                <span>Remember Credentials</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotMode(true)}
                className="text-[#FFD700] hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Buttons */}
            <Button type="submit" loading={loading} className="w-full mt-2">
              Access Safe Banking
            </Button>

            <div className="relative flex items-center justify-center my-2 text-[10px] font-bold text-slate-500 uppercase select-none">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <span className="relative px-3 bg-slate-800 dark:bg-[#0A1926]">New to NumsBank?</span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRegisterMode(true)}
              className="w-full text-slate-200 border-white/10 hover:bg-white/5 hover:border-white/20 active:scale-[0.99]"
            >
              Register Digital Account
            </Button>

            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <button
                type="button"
                onClick={() => navigate('/admin-login')}
                className="text-[10px] text-slate-400 hover:text-[#FFD700] tracking-wide transition-colors font-bold uppercase"
              >
                ← Administrative Operations Gateway
              </button>
            </div>
          </form>
        )}

        {/* 2. REGISTRATION MODE */}
        {isRegisterMode && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
            <Input
              label="Full Name"
              placeholder="As on official documents"
              icon={User}
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              error={errors.name}
            />

            <Input
              label="Email Address"
              placeholder="e.g. name@email.com"
              icon={Mail}
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              label="Mobile Number"
              placeholder="10-digit number"
              icon={Phone}
              type="tel"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
              error={errors.phone}
            />

            <Input
              label="Choose Secure Password"
              placeholder="Min 8 characters"
              icon={Lock}
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              error={errors.password}
            />

            <Input
              label="PAN Card Number"
              placeholder="e.g. ABCDE1234F"
              icon={Landmark}
              value={regPan}
              onChange={(e) => setRegPan(e.target.value.toUpperCase())}
              error={errors.pan}
            />

            <Input
              label="Aadhaar Number"
              placeholder="12-digit UID"
              icon={Binary}
              value={regAadhar}
              onChange={(e) => setRegAadhar(e.target.value.replace(/\D/g, ''))}
              error={errors.aadhar}
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              Complete Account Creation
            </Button>

            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrors({});
              }}
              className="text-xs text-[#FFD700] hover:underline text-center font-bold mt-2 self-center"
            >
              Back to Secure Login
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {isForgotMode && (
          <div className="flex flex-col gap-4">
            {!isOtpVerification ? (
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  Enter your registered netbanking email below. We will simulate sending a 6-digit OTP verification pin to your coordinates.
                </p>
                <Input
                  label="Registered Email Address"
                  placeholder="name@email.com"
                  icon={Mail}
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <Button type="submit" loading={loading} className="w-full mt-2">
                  Generate OTP Pin
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerifySubmit} className="flex flex-col gap-4">
                <p className="text-xs text-[#FFD700] text-center bg-slate-800/40 p-2.5 rounded-xl border border-[#FFD700]/25 select-none font-bold font-mono">
                  Mock OTP Code matches logs / browser output
                </p>
                <Input
                  label="Enter 6-Digit OTP Code"
                  placeholder="••••••"
                  icon={HelpCircle}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                />
                <Input
                  label="Choose New Secure Password"
                  placeholder="Min 8 characters"
                  icon={Lock}
                  type="password"
                  value={recoveryPassword}
                  onChange={(e) => setRecoveryPassword(e.target.value)}
                />
                <Button type="submit" loading={loading} className="w-full mt-2">
                  Confirm Password Change
                </Button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setIsForgotMode(false);
                setIsOtpVerification(false);
                setForgotEmail('');
                setOtpCode('');
                setRecoveryPassword('');
              }}
              className="text-xs text-[#FFD700] hover:underline text-center font-bold mt-2 self-center"
            >
              Cancel and Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Login;
