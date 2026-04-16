import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { UserProfile } from '../../../types';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  handleRoleChange: (role: 'student' | 'parent' | 'business') => Promise<void>;
}

export default function RoleModal({ isOpen, onClose, profile, handleRoleChange }: RoleModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="w-full max-w-md bg-white rounded-t-[40px] p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Chọn vai trò</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { id: 'student', label: 'Học sinh', icon: '👨‍🎓', desc: 'Tìm việc làm & kiến tập' },
                { id: 'parent', label: 'Phụ huynh', icon: '🛡️', desc: 'Giám sát & hỗ trợ con' },
                { id: 'business', label: 'Doanh nghiệp', icon: '🏢', desc: 'Tuyển dụng nhân tài trẻ' },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id as any)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${
                    profile?.role === role.id 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                    {role.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{role.label}</h4>
                    <p className="text-[11px] text-gray-400 font-medium">{role.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
