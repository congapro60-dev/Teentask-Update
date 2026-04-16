import React from 'react';
import { motion } from 'motion/react';
import { User, ShieldCheck, Star, Edit2 } from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  averageRating: string;
  setIsNameChangeModalOpen: (open: boolean) => void;
}

export default function ProfileHeader({ profile, averageRating, setIsNameChangeModalOpen }: ProfileHeaderProps) {
  return (
    <div className="relative pt-12 pb-8 px-6 bg-white border-b border-gray-100">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-28 h-28 rounded-[40px] p-1 shadow-2xl ${profile?.isVip ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600' : 'bg-gradient-to-br from-[#1877F2] to-[#4F46E5]'}`}
          >
            <div className="w-full h-full bg-white rounded-[36px] flex items-center justify-center text-4xl overflow-hidden border-4 border-white relative">
              {profile?.role === 'business' && profile?.businessLogo ? (
                <img src={profile.businessLogo} alt={profile.businessName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                  <User size={48} className="text-gray-300" />
                </div>
              )}
            </div>
          </motion.div>
          <div className={`absolute -bottom-2 -right-2 p-2.5 rounded-2xl shadow-xl border-4 border-white flex items-center justify-center transition-transform hover:scale-110 ${profile?.isVip ? 'bg-amber-500 text-white' : 'bg-[#1877F2] text-white'}`}>
            {profile?.isVip ? (
              <Star size={18} fill="currentColor" />
            ) : (
              <ShieldCheck size={18} />
            )}
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
            {profile?.role === 'business' ? (profile?.businessName || 'Doanh nghiệp chưa đặt tên') : profile?.displayName}
            <button 
              onClick={() => setIsNameChangeModalOpen(true)}
              className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors"
              title="Đổi tên hiển thị"
            >
              <Edit2 size={14} />
            </button>
            {profile?.email === "congapro60@gmail.com" && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">Boss</span>}
            {profile?.role === 'admin' && profile?.email !== "congapro60@gmail.com" && <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">Admin</span>}
            {profile?.isVip && <Star size={20} className="text-amber-500" fill="currentColor" />}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              profile?.email === "congapro60@gmail.com" ? 'bg-red-50 text-red-600 border-red-100' :
              profile?.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
              profile?.role === 'student' ? 'bg-blue-50 text-blue-600 border-blue-100' :
              profile?.role === 'parent' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
              'bg-purple-50 text-purple-600 border-purple-100'
            }`}>
              {profile?.email === "congapro60@gmail.com" ? 'Boss' : 
               profile?.role === 'admin' ? 'Quản trị viên' :
               profile?.role === 'student' ? 'Học sinh' : 
               profile?.role === 'parent' ? 'Phụ huynh' : 
               profile?.role === 'business' ? 'Doanh nghiệp' : 'Người dùng'}
            </span>
            {profile?.isVip && (
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Star size={10} fill="currentColor" />
                VIP
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-gray-400 mt-2">{profile?.email}</p>
          
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-black text-gray-900">{profile?.friends?.length || 0}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bạn bè</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-gray-900">{profile?.following?.length || 0}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Đang theo dõi</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-gray-900">{profile?.followers?.length || 0}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Người theo dõi</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-8">
          <div className="bg-gray-50 rounded-3xl p-4 text-center border border-gray-100">
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Số dư ví</p>
            <p className="text-lg font-black text-[#1877F2]">{profile?.balance?.toLocaleString('vi-VN') || 0}đ</p>
          </div>
          <div className="bg-gray-50 rounded-3xl p-4 text-center border border-gray-100">
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Tín nhiệm</p>
            <div className="flex items-center justify-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <p className="text-lg font-black text-gray-900">{averageRating}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
