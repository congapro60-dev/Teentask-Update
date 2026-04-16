import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Heart, Briefcase as BriefcaseIcon } from 'lucide-react';
import { UserProfile } from '../../../types';

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFriend: UserProfile | null;
  relationshipType: 'Family' | 'Professional';
  setRelationshipType: (type: 'Family' | 'Professional') => void;
  relationshipTitle: string;
  setRelationshipTitle: (title: string) => void;
  handleAddRelationship: () => Promise<void>;
}

export default function RelationshipModal({
  isOpen, onClose, selectedFriend, relationshipType, setRelationshipType,
  relationshipTitle, setRelationshipTitle, handleAddRelationship
}: RelationshipModalProps) {
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
              <h3 className="text-xl font-bold text-gray-900">Thiết lập mối quan hệ</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-gray-100">
                  {selectedFriend?.photoURL ? (
                    <img src={selectedFriend.photoURL} alt={selectedFriend.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Users size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{selectedFriend?.displayName}</h4>
                  <p className="text-xs text-gray-500">Thêm người này vào danh sách mối quan hệ</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Loại mối quan hệ</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRelationshipType('Family')}
                      className={`py-3 rounded-2xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                        relationshipType === 'Family' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 bg-white text-gray-400'
                      }`}
                    >
                      <Heart size={16} /> Gia đình
                    </button>
                    <button
                      onClick={() => setRelationshipType('Professional')}
                      className={`py-3 rounded-2xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                        relationshipType === 'Professional' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 bg-white text-gray-400'
                      }`}
                    >
                      <BriefcaseIcon size={16} /> Công việc
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Danh xưng / Chức danh</label>
                  <input
                    type="text"
                    value={relationshipTitle}
                    onChange={(e) => setRelationshipTitle(e.target.value)}
                    placeholder={relationshipType === 'Family' ? 'Ví dụ: Bố, Mẹ, Anh trai...' : 'Ví dụ: Đồng nghiệp, Quản lý...'}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handleAddRelationship}
                disabled={!relationshipTitle}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                XÁC NHẬN
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
