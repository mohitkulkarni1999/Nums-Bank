import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { User, Landmark, ShieldCheck, Binary } from 'lucide-react';
import { validateIfsc } from '../../utils/validators';

export const BeneficiaryModal = ({ isOpen, onClose, onSave, loading }) => {
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [errors, setErrors] = useState({});

  // Auto-detect bank name based on IFSC prefixes
  useEffect(() => {
    const code = ifsc.toUpperCase().trim();
    if (code.length >= 4) {
      const prefix = code.slice(0, 4);
      if (prefix === 'UTIB') setBankName('Axis Bank');
      else if (prefix === 'HDFC') setBankName('HDFC Bank');
      else if (prefix === 'ICIC') setBankName('ICICI Bank');
      else if (prefix === 'SBIN') setBankName('State Bank of India');
      else if (prefix === 'BARB') setBankName('Bank of Baroda');
      else if (prefix === 'PUNB') setBankName('Punjab National Bank');
      else if (bankName === 'Axis Bank' || bankName === 'HDFC Bank' || bankName === 'ICICI Bank' || bankName === 'State Bank of India') {
        setBankName('');
      }
    } else {
      setBankName('');
    }
  }, [ifsc]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Beneficiary Name is required.';
    if (!accountNumber.trim()) newErrors.accountNumber = 'Account Number is required.';
    if (accountNumber.length < 8) newErrors.accountNumber = 'Invalid Account Number length.';
    if (!ifsc.trim()) newErrors.ifsc = 'IFSC code is required.';
    if (!validateIfsc(ifsc)) newErrors.ifsc = 'Invalid IFSC code format (e.g. UTIB0000001).';
    if (!bankName.trim()) newErrors.bankName = 'Bank Name is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: name.trim(),
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.toUpperCase().trim(),
      bankName: bankName.trim(),
    });
  };

  const handleClose = () => {
    setName('');
    setAccountNumber('');
    setIfsc('');
    setBankName('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Beneficiary">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <Input
          label="Beneficiary Full Name"
          placeholder="Enter payee registered bank name"
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        {/* Account Number */}
        <Input
          label="Account Number"
          placeholder="Enter bank account number"
          icon={Binary}
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
          error={errors.accountNumber}
        />

        {/* IFSC Code */}
        <Input
          label="IFSC Code"
          placeholder="e.g. UTIB0000001"
          icon={ShieldCheck}
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value.toUpperCase().trim())}
          error={errors.ifsc}
        />

        {/* Bank Name */}
        <Input
          label="Bank Name (Auto-Detected)"
          placeholder="Detecting from IFSC..."
          icon={Landmark}
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          error={errors.bankName}
        />

        {/* Submit */}
        <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100 dark:border-navy-800">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Payee
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default BeneficiaryModal;
