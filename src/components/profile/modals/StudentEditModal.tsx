import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useFirebase } from '../../FirebaseProvider';

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentEditData: { achievements: string[]; portfolioLinks: { title: string; url: string }[] };
  setStudentEditData: (data: any) => void;
  saveStudentProfile: () => Promise<void>;
}

export default function StudentEditModal({
  isOpen, onClose, studentEditData, setStudentEditData, saveStudentProfile
}: StudentEditModalProps) {
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
              <h3 className="text-xl font-black text-gray-900">{t('editCv')}</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
              {/* Achievements */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('academicAchievements')}</label>
                  <button 
                    onClick={() => setStudentEditData({ ...studentEditData, achievements: [...studentEditData.achievements, ''] })}
                    className="text-[10px] font-bold text-indigo-600 flex items-center gap-1"
                  >
                    <Plus size={12} /> {t('addNew')}
                  </button>
                </div>
                {studentEditData.achievements.map((ach, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={ach}
                      onChange={(e) => {
                        const newAch = [...studentEditData.achievements];
                        newAch[idx] = e.target.value;
                        setStudentEditData({ ...studentEditData, achievements: newAch });
                      }}
                      placeholder={t('achievementExample')}
                      className="flex-1 px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                    />
                    <button 
                      onClick={() => {
                        const newAch = studentEditData.achievements.filter((_, i) => i !== idx);
                        setStudentEditData({ ...studentEditData, achievements: newAch });
                      }}
                      className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Portfolio Links */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('portfolioProjects')}</label>
                  <button 
                    onClick={() => setStudentEditData({ ...studentEditData, portfolioLinks: [...studentEditData.portfolioLinks, { title: '', url: '' }] })}
                    className="text-[10px] font-bold text-indigo-600 flex items-center gap-1"
                  >
                    <Plus size={12} /> {t('addNew')}
                  </button>
                </div>
                {studentEditData.portfolioLinks.map((link, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{t('link')} #{idx + 1}</span>
                      <button 
                        onClick={() => {
                          const newLinks = studentEditData.portfolioLinks.filter((_, i) => i !== idx);
                          setStudentEditData({ ...studentEditData, portfolioLinks: newLinks });
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => {
                        const newLinks = [...studentEditData.portfolioLinks];
                        newLinks[idx].title = e.target.value;
                        setStudentEditData({ ...studentEditData, portfolioLinks: newLinks });
                      }}
                      placeholder={t('projectTitle')}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...studentEditData.portfolioLinks];
                        newLinks[idx].url = e.target.value;
                        setStudentEditData({ ...studentEditData, portfolioLinks: newLinks });
                      }}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={saveStudentProfile}
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
