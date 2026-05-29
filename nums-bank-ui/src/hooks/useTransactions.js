import { useState, useCallback } from 'react';
import api from '../services/api';

export const useTransactions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAccountSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/accounts/summary');
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Failed to retrieve account details.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const getTransactionHistory = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { page = 0, size = 10, fromDate, toDate, type = 'ALL', status = 'ALL' } = filters;
      
      let url = `/transactions/history?page=${page}&size=${size}&type=${type}&status=${status}`;
      if (fromDate) url += `&fromDate=${fromDate}`;
      if (toDate) url += `&toDate=${toDate}`;

      const response = await api.get(url);
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Failed to fetch transaction logs.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const sendMoney = useCallback(async (transferData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/transactions/send', transferData);
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Transfer failed. Check balance or credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const getBeneficiaries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/transactions/beneficiaries');
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Failed to retrieve beneficiaries.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const addBeneficiary = useCallback(async (beneficiaryData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/transactions/beneficiary/add', beneficiaryData);
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Failed to add beneficiary.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  return {
    loading,
    error,
    getAccountSummary,
    getTransactionHistory,
    sendMoney,
    getBeneficiaries,
    addBeneficiary
  };
};
export default useTransactions;
