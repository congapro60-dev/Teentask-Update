import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useFirebase } from '../../FirebaseProvider';

interface BusinessEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessEditData: { 
    businessName: string; 
    businessLogo: string;
    businessAddress: string;
    industry: string; 
    companySize: string; 
    foundedYear: number; 
    website: string 
  };
  setBusinessEditData: (data: any) => void;
  saveBusinessProfile: () => Promise<void>;
  profile: any;
  updateProfile: (data: any) => Promise<void>;
}

export default function BusinessEditModal({
  isOpen, onClose, businessEditData, setBusinessEditData, saveBusinessProfile, profile, updateProfile
}: BusinessEditModalProps) {
  const { t } = useFirebase();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900">{t('businessInfo')}</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('businessName')}</label>
                  <input
                    type="text"
                    value={businessEditData.businessName}
                    onChange={(e) => setBusinessEditData({ ...businessEditData, businessName: e.target.value })}
                    placeholder={t('businessNamePlaceholder')}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('businessLogoUrl')}</label>
                  <input
                    type="text"
                    value={businessEditData.businessLogo}
                    onChange={(e) => setBusinessEditData({ ...businessEditData, businessLogo: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('headquartersAddress')}</label>
                <input
                  type="text"
                  value={businessEditData.businessAddress}
                  onChange={(e) => setBusinessEditData({ ...businessEditData, businessAddress: e.target.value })}
                  placeholder={t('headquartersAddressPlaceholder')}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('industry')}</label>
                  <input
                    type="text"
                    value={businessEditData.industry}
                    onChange={(e) => setBusinessEditData({ ...businessEditData, industry: e.target.value })}
                    placeholder={t('industryPlaceholder')}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('companySize')}</label>
                  <select
                    value={businessEditData.companySize}
                    onChange={(e) => setBusinessEditData({ ...businessEditData, companySize: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                  >
                    <option value="">{t('selectCompanySize')}</option>
                    <option value="1-10 nhân viên">1-10 {t('employees')}</option>
                    <option value="11-50 nhân viên">11-50 {t('employees')}</option>
                    <option value="51-200 nhân viên">51-200 {t('employees')}</option>
                    <option value="200+ nhân viên">200+ {t('employees')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('foundedYear')}</label>
                  <input
                    type="number"
                    value={businessEditData.foundedYear}
                    onChange={(e) => setBusinessEditData({ ...businessEditData, foundedYear: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('website')}</label>
                  <input
                    type="url"
                    value={businessEditData.website}
                    onChange={(e) => setBusinessEditData({ ...businessEditData, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('businessBio')}</label>
                <textarea
                  value={profile?.bio || ''}
                  onChange={(e) => updateProfile({ bio: e.target.value })}
                  placeholder={t('businessBioPlaceholderShort')}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium min-h-[120px]"
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={saveBusinessProfile}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100"
              >
                {t('saveInfo')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
