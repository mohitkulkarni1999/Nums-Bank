import React, { useState, useEffect } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Toast from '../../components/UI/Toast';
import { 
  Landmark, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import api from '../../services/api';

export const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/loans/all');
      setLoans(res.data?.loans || []);
      setFilteredLoans(res.data?.loans || []);
    } catch (err) {
      console.error('Failed to fetch loans:', err);
      Toast.error('Failed to load loans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    let filtered = loans;

    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.loanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(loan => loan.status === filterStatus);
    }

    setFilteredLoans(filtered);
  }, [searchTerm, filterStatus, loans]);

  const handleApproveLoan = async (loanId) => {
    if (!confirm('Are you sure you want to approve this loan?')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/admin/loans/${loanId}/approve`);
      Toast.success('Loan approved successfully.');
      fetchLoans();
      if (isDetailModalOpen) setIsDetailModalOpen(false);
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to approve loan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectLoan = async (loanId) => {
    if (!confirm('Are you sure you want to reject this loan?')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/admin/loans/${loanId}/reject`);
      Toast.success('Loan rejected successfully.');
      fetchLoans();
      if (isDetailModalOpen) setIsDetailModalOpen(false);
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to reject loan.');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailModal = (loan) => {
    setSelectedLoan(loan);
    setIsDetailModalOpen(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
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
          <Landmark className="w-6 h-6 text-[#FFD700]" />
          <span>Loan Management</span>
        </h2>
        <p className="text-sm text-slate-400">
          Approve, reject, and monitor all loan applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Loans</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{loans.length}</p>
          </div>
          <Landmark className="w-10 h-10 text-indigo-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
            <p className="text-2xl font-extrabold text-amber-500">{loans.filter(l => l.status === 'PENDING').length}</p>
          </div>
          <Clock className="w-10 h-10 text-amber-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Approved</p>
            <p className="text-2xl font-extrabold text-emerald-500">{loans.filter(l => l.status === 'APPROVED').length}</p>
          </div>
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</p>
            <p className="text-2xl font-extrabold text-[#FFD700]">{formatCurrency(loans.reduce((sum, l) => sum + (l.amount || 0), 0))}</p>
          </div>
          <DollarSign className="w-10 h-10 text-[#FFD700]" />
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Loans Table */}
      <Card className="p-6">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-navy-700 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse text-xs min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-navy-800">
                <th className="py-3 px-4">Loan ID</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Tenure</th>
                <th className="py-3 px-4 text-right">EMI</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Applied</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-500">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center font-bold text-slate-400">
                    No loans found.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-850 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-350">
                      {loan.loanId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {loan.user?.fullName || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded text-[10px] font-bold">
                        {loan.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-800 dark:text-slate-200">
                      {formatCurrency(loan.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400">
                      {loan.tenureMonths} months
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(loan.emi)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-bold">
                        {getStatusIcon(loan.status)}
                        <span className={
                          loan.status === 'APPROVED' ? 'text-emerald-500' :
                          loan.status === 'REJECTED' ? 'text-red-500' :
                          'text-amber-500'
                        }>
                          {loan.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(loan.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => openDetailModal(loan)}
                          className="py-1 px-2 text-[10px]"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        {loan.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => handleApproveLoan(loan.id)}
                              loading={actionLoading}
                              className="py-1 px-2 text-[10px] text-emerald-500 border-emerald-500 hover:bg-emerald-50"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleRejectLoan(loan.id)}
                              loading={actionLoading}
                              className="py-1 px-2 text-[10px] text-red-500 border-red-500 hover:bg-red-50"
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Loan Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Loan Application Details"
      >
        {selectedLoan && (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Loan ID</p>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedLoan.loanId}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Applicant</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <p className="font-bold text-slate-800 dark:text-slate-200">{selectedLoan.user?.fullName}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Loan Type</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedLoan.type}</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-950 dark:to-navy-900 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Loan Amount</p>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-200">
                {formatCurrency(selectedLoan.amount)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Tenure</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedLoan.tenureMonths} months</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Interest Rate</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedLoan.interestRate}%</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">EMI</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(selectedLoan.emi)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedLoan.status)}
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLoan.status}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Applied Date</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{formatDate(selectedLoan.createdAt)}</p>
              </div>
            </div>

            {selectedLoan.status === 'PENDING' && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleRejectLoan(selectedLoan.id)}
                  loading={actionLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveLoan(selectedLoan.id)}
                  loading={actionLoading}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoanManagement;
