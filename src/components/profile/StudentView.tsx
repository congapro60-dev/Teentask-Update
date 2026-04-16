import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Edit2, FileText, Award, SlidersHorizontal, Plus, X, ExternalLink, ChevronRight, Briefcase, AlertTriangle, Star, Check, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Application, Job } from '../../types';
import { useFirebase } from '../FirebaseProvider';

interface StudentViewProps {
  profile: UserProfile | null;
  updateProfile: (data: any) => Promise<void>;
  setIsStudentEditModalOpen: (open: boolean) => void;
  handleOpenSkillsModal: () => void;
  getSkillLevel: (skill: string) => { percent: number; label: string };
  removeSkill: (skill: string) => Promise<void>;
  quickSkillInput: string;
  setQuickSkillInput: (input: string) => void;
  addQuickSkill: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  applications: (Application & { job?: Job })[];
  setSelectedApp: (app: (Application & { job?: Job }) | null) => void;
  setIsReviewModalOpen: (open: boolean) => void;
  badges: { icon: string; label: string; color: string }[];
  ratings: any[];
}

export default function StudentView({
  profile, updateProfile,
  setIsStudentEditModalOpen, handleOpenSkillsModal, getSkillLevel, removeSkill,
  quickSkillInput, setQuickSkillInput, addQuickSkill, applications,
  setSelectedApp, setIsReviewModalOpen, badges, ratings, loading
}: StudentViewProps) {
  const navigate = useNavigate();
  const { t } = useFirebase();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Bio Section */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <User size={18} className="text-indigo-600" />
              {t('bio')}
            </h3>
            {!isEditingBio && (
              <button 
                onClick={() => {
                  setTempBio(profile?.bio || '');
                  setIsEditingBio(true);
                }}
                className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
          
          {isEditingBio ? (
            <div className="space-y-3">
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                className="w-full p-4 bg-gray-50 border-2 border-indigo-100 rounded-2xl text-sm focus:bg-white outline-none transition-all min-h-[120px]"
                placeholder={t('bioPlaceholder')}
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingBio(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={async () => {
                    await updateProfile({ bio: tempBio });
                    setIsEditingBio(false);
                  }}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100"
                >
                  {t('saveChanges')}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed">
              {profile?.bio || t('noBio')}
            </p>
          )}
        </div>

        {/* CV Management */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#1877F2] to-[#4F46E5] rounded-[32px] p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-amber-400" size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('professionalProfile')}</span>
              </div>
              <h3 className="text-xl font-black mb-2 tracking-tight">{t('cvBuilder')}</h3>
              <p className="text-white/80 text-xs mb-6 max-w-[200px]">{t('cvBuilderDesc')}</p>
              <button 
                onClick={() => navigate('/cv-builder')}
                className="bg-white text-[#1877F2] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
              >
                <Edit2 size={14} />
                {profile?.cvId ? t('editCv') : t('createCvNow')}
              </button>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate('/schedule')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <CalendarDays size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{t('shadowingSchedule')}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('viewRegisteredSessions')}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-all" />
          </div>
        </div>

        {/* Teen CV Section */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Award size={18} className="text-[#4F46E5]" />
              Teen CV
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsStudentEditModalOpen(true)}
                className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-[#4F46E5] transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('skillProgress')}</h4>
                <button 
                  onClick={handleOpenSkillsModal}
                  className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  <SlidersHorizontal size={12} /> {t('manage')}
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(profile?.skills || []).length > 0 ? (
                    profile?.skills.map((skill) => {
                      const level = getSkillLevel(skill);
                      return (
                        <div key={skill} className="w-full bg-gray-50/50 p-3 rounded-2xl border border-gray-100 group/skill">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-800">{skill}</span>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter ${
                                level.percent === 100 ? 'bg-green-100 text-green-600' :
                                level.percent === 66 ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {level.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-indigo-600">{level.percent}%</span>
                              <button 
                                onClick={() => removeSkill(skill)}
                                className="opacity-0 group-hover/skill:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200/50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${level.percent}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                level.percent === 100 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                                level.percent === 66 ? 'bg-gradient-to-r from-indigo-400 to-blue-500' :
                                'bg-gradient-to-r from-gray-400 to-slate-500'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-400 italic py-2">{t('noSkillsSelected')}</p>
                  )}
                </div>

                <form onSubmit={addQuickSkill} className="relative">
                  <input 
                    type="text"
                    value={quickSkillInput}
                    onChange={(e) => setQuickSkillInput(e.target.value)}
                    placeholder={t('quickAddSkill')}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-200 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </form>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('academicAchievements')}</h4>
              <div className="space-y-2">
                {(profile?.achievements || []).length > 0 ? (
                  profile?.achievements.map((ach, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-1 h-auto bg-green-500 rounded-full"></div>
                      <p className="text-sm font-medium text-gray-700">{ach}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">{t('noAchievements')}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Huy hiệu</h4>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {badges.map((badge) => (
                  <div key={badge.label} className={`flex flex-col items-center gap-1 p-3 rounded-2xl ${badge.color} min-w-[80px] shadow-sm`}>
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-[10px] font-bold text-center">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* My Applications */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Briefcase size={18} className="text-[#4F46E5]" />
            {t('myJobs')}
          </h3>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : applications.length > 0 ? (
              applications.map(app => {
                const isPendingLong = app.parentStatus === 'pending' && (Date.now() - app.createdAt > 48 * 60 * 60 * 1000);
                
                return (
                  <div key={app.id} className={`p-4 bg-gray-50 rounded-2xl border ${isPendingLong ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{app.job?.title || 'Công việc đã xóa'}</h4>
                        <p className="text-[10px] text-gray-500">{app.job?.businessName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        app.finalStatus === 'completed' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        app.finalStatus === 'accepted' ? 'bg-green-50 text-green-600 border-green-100' :
                        app.finalStatus === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {app.finalStatus === 'completed' ? t('completed') :
                         app.finalStatus === 'accepted' ? t('accepted') :
                         app.finalStatus === 'rejected' ? t('rejected') : t('pending')}
                      </span>
                    </div>
                    
                    {isPendingLong && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-amber-100/50 rounded-xl text-[10px] font-bold text-amber-700 border border-amber-200">
                        <AlertTriangle size={12} />
                        <span>{t('parentPending48h')}</span>
                      </div>
                    )}

                    {app.finalStatus === 'completed' && !(app as any).reviewed && (
                      <button 
                        onClick={() => {
                          setSelectedApp(app);
                          setIsReviewModalOpen(true);
                        }}
                        className="mt-3 w-full py-2 bg-white text-[#4F46E5] border border-indigo-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
                      >
                        <Star size={14} /> {t('review')}
                      </button>
                    )}
                    {app.finalStatus === 'completed' && (app as any).reviewed && (
                      <div className="mt-3 w-full py-2 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2">
                        <Check size={14} /> {t('reviewed')}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-gray-400 py-4">{t('noJoinedJobs')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
