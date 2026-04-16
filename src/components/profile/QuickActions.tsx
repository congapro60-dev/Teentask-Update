import React from 'react';
import { Plus, Building2, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  setFinancialAction: (action: 'deposit' | 'bank' | 'vip' | null) => void;
  setIsFinancialModalOpen: (open: boolean) => void;
}

export default function QuickActions({ setFinancialAction, setIsFinancialModalOpen }: QuickActionsProps) {
  const navigate = useNavigate();
  
  return (
    <div className="px-6 -mt-6">
      <div className="bg-white rounded-[32px] p-2 shadow-xl shadow-blue-900/5 border border-gray-100 grid grid-cols-3 gap-1">
        <button 
          onClick={() => { setFinancialAction('deposit'); setIsFinancialModalOpen(true); }}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-all group"
        >
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <span className="text-[11px] font-bold text-gray-600">Nạp tiền</span>
        </button>
        <button 
          onClick={() => { setFinancialAction('bank'); setIsFinancialModalOpen(true); }}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-all group border-x border-gray-50"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Building2 size={24} />
          </div>
          <span className="text-[11px] font-bold text-gray-600">Ngân hàng</span>
        </button>
        <button 
          onClick={() => navigate('/vip')}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-all group"
        >
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award size={24} />
          </div>
          <span className="text-[11px] font-bold text-gray-600">Mua VIP</span>
        </button>
      </div>
    </div>
  );
}
