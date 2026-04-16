import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useFirebase } from '../../FirebaseProvider';

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  predefinedSkills: string[];
  tempSkills: string[];
  toggleSkill: (skill: string) => void;
  saveSkills: () => Promise<void>;
}

export default function SkillsModal({
  isOpen, onClose, predefinedSkills, tempSkills, toggleSkill, saveSkills
}: SkillsModalProps) {
  const { t } = useFirebase();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="w-full max-w-md bg-white rounded-t-[40px] p-8 max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">{t('yourSkills')}</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar mb-6">
              <p className="text-sm text-gray-500 mb-4">{t('skillsModalDesc')}</p>
              <div className="flex flex-wrap gap-2">
                {predefinedSkills.map((skill) => {
                  const isSelected = tempSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      {skill}
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={saveSkills}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100"
            >
              {t('saveChanges').toUpperCase()}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
