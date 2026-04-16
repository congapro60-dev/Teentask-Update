import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Building2, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../../../types';
import { useFirebase } from '../../FirebaseProvider';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  financialAction: 'deposit' | 'bank' | 'vip' | null;
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
  handleDeposit: () => Promise<void>;
  bankInfo: { bankName: string; accountNumber: string; accountHolder: string };
  setBankInfo: (info: any) => void;
  handleLinkBank: () => Promise<void>;
  profile: UserProfile | null;
}

export default function FinancialModal({
  isOpen, onClose, financialAction, depositAmount, setDepositAmount, handleDeposit,
  bankInfo, setBankInfo, handleLinkBank, profile
}: FinancialModalProps) {
  const navigate = useNavigate();
  const { t } = useFirebase();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-xl font-bold text-gray-900">
                {financialAction === 'deposit' ? t('deposit') : financialAction === 'bank' ? t('linkBank') : t('buyVip')}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {financialAction === 'deposit' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('depositAmountWithUnit')}</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={t('amountPlaceholder')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
                    />
                  </div>
                  <button
                    onClick={handleDeposit}
                    className="w-full py-4 bg-[#4F46E5] text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-[#4338CA] transition-all"
                  >
                    {t('confirmDeposit')}
                  </button>
                </div>
              )}

              {financialAction === 'bank' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('bankName')}</label>
                    <input
                      type="text"
                      value={bankInfo.bankName}
                      onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                      placeholder={t('bankNamePlaceholder')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('accountNumber')}</label>
                    <input
                      type="text"
                      value={bankInfo.accountNumber}
                      onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                      placeholder={t('accountNumberPlaceholder')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('accountHolder')}</label>
                    <input
                      type="text"
                      value={bankInfo.accountHolder}
                      onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
                      placeholder={t('accountHolderPlaceholder')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all uppercase"
                    />
                  </div>
                  <button
                    onClick={handleLinkBank}
                    className="w-full py-4 bg-[#4F46E5] text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-[#4338CA] transition-all"
                  >
                    {t('saveInfo')}
                  </button>
                </div>
              )}

              {financialAction === 'vip' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto text-amber-500">
                    <Award size={40} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{t('vipPackage')}</h4>
                    <p className="text-sm text-gray-500">
                      {t('vipBenefits')}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-sm text-gray-400 mb-1">{t('packagePrice')}</p>
                    <p className="text-2xl font-black text-gray-900">100,000đ</p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/vip');
                    }}
                    disabled={profile?.isVip}
                    className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all ${
                      profile?.isVip 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-amber-100 hover:from-amber-500 hover:to-amber-700'
                    }`}
                  >
                    {profile?.isVip ? t('alreadyVip') : t('viewVipPackages')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
