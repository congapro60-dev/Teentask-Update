import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, User } from 'lucide-react';
import { UserProfile } from '../../../types';

interface NameChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  nameChangeData: { newName: string; reason: string; proofUrl: string };
  setNameChangeData: (data: any) => void;
  handleNameChangeSubmit: (e: React.FormEvent) => Promise<void>;
  handleProofUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submittingNameChange: boolean;
}

export default function NameChangeModal({
  isOpen, onClose, profile, nameChangeData, setNameChangeData, 
  handleNameChangeSubmit, handleProofUpload, submittingNameChange
}: NameChangeModalProps) {
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
              <h3 className="text-xl font-black text-gray-900">Yêu cầu đổi tên hiển thị</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleNameChangeSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tên hiển thị hiện tại</label>
                  <div className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-2xl text-sm font-medium text-gray-500">
                    {profile?.displayName}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tên hiển thị mới</label>
                  <input
                    type="text"
                    required
                    value={nameChangeData.newName}
                    onChange={(e) => setNameChangeData({ ...nameChangeData, newName: e.target.value })}
                    placeholder="Nhập tên mới muốn hiển thị..."
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Lí do đổi tên</label>
                  <textarea
                    required
                    value={nameChangeData.reason}
                    onChange={(e) => setNameChangeData({ ...nameChangeData, reason: e.target.value })}
                    placeholder="Giải thích lí do bạn muốn đổi tên..."
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Minh chứng xác thực</label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Plus className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Tải ảnh lên</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleProofUpload} />
                      </label>
                    </div>
                    {nameChangeData.proofUrl && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100">
                        <img src={nameChangeData.proofUrl} alt="Proof" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          type="button"
                          onClick={() => setNameChangeData((prev: any) => ({ ...prev, proofUrl: '' }))}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submittingNameChange}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 disabled:opacity-50"
                >
                  {submittingNameChange ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
