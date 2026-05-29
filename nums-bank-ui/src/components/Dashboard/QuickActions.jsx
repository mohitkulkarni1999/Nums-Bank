import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SendHorizontal, 
  ArrowDownLeft, 
  Receipt, 
  PlusCircle 
} from 'lucide-react';
import Card from '../UI/Card';

export const QuickActions = ({ onOpenDeposit }) => {
  const navigate = useNavigate();

  const actions = [
    {
      name: 'Send Money',
      description: 'Transfer funds instantly',
      icon: SendHorizontal,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/5',
      action: () => navigate('/send-money'),
    },
    {
      name: 'Request Money',
      description: 'Generate payment request',
      icon: ArrowDownLeft,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/5',
      action: () => onOpenDeposit('request'),
    },
    {
      name: 'Pay Bills',
      description: 'DTH, electricity, broadband',
      icon: Receipt,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/5',
      action: () => onOpenDeposit('bills'),
    },
    {
      name: 'Deposit Cash',
      description: 'Simulate paperless deposit',
      icon: PlusCircle,
      color: 'bg-[#FFD700]/10 text-yellow-600 dark:text-[#FFD700] dark:bg-[#FFD700]/5',
      action: () => onOpenDeposit('deposit'),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Card
            key={act.name}
            hoverable
            onClick={act.action}
            className="flex flex-col gap-3 p-5 border border-slate-100 dark:border-navy-800 bg-gradient-to-br from-white to-slate-50 dark:from-[#0A1926] dark:to-[#11293e]"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${act.color} transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-sm`}>
              <Icon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-0.5 select-none">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight">
                {act.name}
              </span>
              <span className="text-[11px] text-slate-400 leading-tight">
                {act.description}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
export default QuickActions;
