import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Calendar, Phone, MapPin, Mail, GraduationCap } from 'lucide-react';
import { UserProfile } from '../../../types';
import { useFirebase } from '../../FirebaseProvider';

interface PersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  personalInfoData: any;
  setPersonalInfoData: (data: any) => void;
  savePersonalInfo: () => Promise<void>;
}

export default function PersonalInfoModal({
  isOpen, onClose, profile, personalInfoData, setPersonalInfoData, savePersonalInfo
}: PersonalInfoModalProps) {
  const { t } = useFirebase();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <User size={20} />
                </div>
                <h3 className="text-xl font-black text-gray-900">{t('personalInfo')}</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-8 overflow-y-auto no-scrollbar">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('basicInfo')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">{t('fullName')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={personalInfoData.fullName}
                        onChange={(e) => setPersonalInfoData({ ...personalInfoData, fullName: e.target.value })}
                        placeholder={t('accountHolderPlaceholder')}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">{t('dob')}</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="date"
                        value={personalInfoData.dob}
                        onChange={(e) => setPersonalInfoData({ ...personalInfoData, dob: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">{t('gender')}</label>
                    <div className="flex gap-2">
                      {['Nam', 'Nữ', 'Khác'].map((g) => (
                        <button
                          key={g}
                          onClick={() => setPersonalInfoData({ ...personalInfoData, gender: g as any })}
                          className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${
                            personalInfoData.gender === g 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                            : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {g === 'Nam' ? t('male') : g === 'Nữ' ? t('female') : t('other')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">{t('phoneNumber')}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="tel"
                        value={personalInfoData.phone}
                        onChange={(e) => setPersonalInfoData({ ...personalInfoData, phone: e.target.value })}
                        placeholder={t('enterPhoneNumber')}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Social Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('locationContact')}</h4>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">{t('addressLocation')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={personalInfoData.location}
                      onChange={(e) => setPersonalInfoData({ ...personalInfoData, location: e.target.value })}
                      placeholder={t('locationPlaceholder')}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">{t('contactEmail')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      value={profile?.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-2xl text-sm font-medium text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Education Section (if student) */}
              {profile?.role === 'student' && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('education')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">{t('school')}</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          value={personalInfoData.school}
                          onChange={(e) => setPersonalInfoData({ ...personalInfoData, school: e.target.value })}
                          placeholder={t('schoolPlaceholder')}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">{t('class')}</label>
                      <input
                        type="text"
                        value={personalInfoData.class}
                        onChange={(e) => setPersonalInfoData({ ...personalInfoData, class: e.target.value })}
                        placeholder={t('classPlaceholder')}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bio Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('bio')}</h4>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">{t('selfDescription')}</label>
                  <textarea
                    value={personalInfoData.bio}
                    onChange={(e) => setPersonalInfoData({ ...personalInfoData, bio: e.target.value })}
                    placeholder={t('bioPlaceholder')}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium min-h-[120px] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={savePersonalInfo}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
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
