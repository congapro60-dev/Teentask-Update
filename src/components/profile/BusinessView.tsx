import React, { useState } from 'react';
import { Building2, Edit2, ExternalLink, Clock } from 'lucide-react';
import { UserProfile, Rating } from '../../types';
import { useFirebase } from '../FirebaseProvider';

interface BusinessViewProps {
  profile: UserProfile | null;
  updateProfile: (data: any) => Promise<void>;
  setIsBusinessEditModalOpen: (open: boolean) => void;
  verificationUI: any;
  setShowLinkedInModal: (show: boolean) => void;
  ratings: Rating[];
}

export default function BusinessView({
  profile, updateProfile,
  setIsBusinessEditModalOpen, verificationUI, setShowLinkedInModal, ratings
}: BusinessViewProps) {
  const { t } = useFirebase();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            {t('businessProfile')}
          </h3>
          <button 
            onClick={() => setIsBusinessEditModalOpen(true)}
            className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Edit2 size={16} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('industry')}</p>
              <p className="text-sm font-bold text-gray-700">{profile?.industry || profile?.businessField || t('notUpdated')}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('companySize')}</p>
              <p className="text-sm font-bold text-gray-700">{profile?.companySize || t('notUpdated')}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('foundedYear')}</p>
              <p className="text-sm font-bold text-gray-700">{profile?.foundedYear || t('notUpdated')}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('website')}</p>
              {profile?.website ? (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                  {t('visit')} <ExternalLink size={12} />
                </a>
              ) : (
                <p className="text-sm font-bold text-gray-700">{t('notUpdated')}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('businessBio')}</h4>
              <button 
                onClick={() => {
                  setTempBio(profile?.bio || '');
                  setIsEditingBio(true);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-indigo-600 transition-colors"
              >
                <Edit2 size={14} />
              </button>
            </div>
            {isEditingBio ? (
              <div className="space-y-3">
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-2 border-indigo-100 rounded-2xl text-sm focus:bg-white outline-none transition-all min-h-[100px]"
                  placeholder={t('businessBioPlaceholder')}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingBio(false)}
                    className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    onClick={async () => {
                      await updateProfile({ bio: tempBio });
                      setIsEditingBio(false);
                    }}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    {t('save')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">
                {profile?.bio || t('noBusinessBio')}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('verificationStatus')}</h4>
            <div className={`p-4 rounded-2xl border flex items-center gap-4 ${verificationUI.bgColor} ${verificationUI.badgeColor}`}>
              <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center ${verificationUI.color}`}>
                {verificationUI.icon}
              </div>
              <div>
                <p className="text-sm font-bold">{verificationUI.label}</p>
                <p className="text-[10px] opacity-70 font-medium">{t('businessModeratedDesc')}</p>
              </div>
            </div>
          </div>

          {/* LinkedIn Verification */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('expertProfile')}</h4>
            {profile?.linkedInStatus === 'verified' ? (
              <div className="flex items-center gap-2 text-[#0077B5] font-bold bg-blue-50 px-4 py-3 rounded-xl">
                <div className="w-6 h-6 bg-[#0077B5] text-white rounded flex items-center justify-center font-bold text-xs">in</div>
                {t('linkedInVerified')}
              </div>
            ) : profile?.linkedInStatus === 'pending' ? (
              <div className="flex items-center gap-2 text-amber-600 font-bold bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                <Clock size={16} />
                {t('linkedInPending')}
              </div>
            ) : (
              <button 
                onClick={() => setShowLinkedInModal(true)} 
                className="w-full bg-[#0077B5] text-white rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-[#006097] transition-colors"
              >
                <div className="w-8 h-8 bg-white text-[#0077B5] rounded-full flex items-center justify-center font-bold text-sm">in</div>
                <div className="text-left">
                  <div className="font-bold">{t('linkedInConnect')}</div>
                  <div className="text-xs text-blue-100">{t('linkedInSubtext')}</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
