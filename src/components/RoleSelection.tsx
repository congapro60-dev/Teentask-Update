import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Building2, Sparkles, ArrowRight, ShieldCheck, UserCircle, GraduationCap, Users, School, Component } from 'lucide-react';
import { UserRole } from '../types';

export default function RoleSelection({ onSelect }: { onSelect: (role: UserRole, orgType?: string) => void }) {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState<1 | 2>(1); // 1: Main Role, 2: Sub Role
  const [selectedMainRole, setSelectedMainRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      
      const storedPillar = localStorage.getItem('selectedPillar');
      if (storedPillar === 'personal') {
        setSelectedMainRole('parent');
        setStep(2);
      } else if (storedPillar === 'organization') {
        setSelectedMainRole('business');
        setStep(2);
      }
      // Remove it so it doesn't trigger on consecutive logins by different accounts on same device
      localStorage.removeItem('selectedPillar');
      
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleMainRoleSelect = (role: UserRole) => {
    if (role === 'student' || role === 'admin') {
      onSelect(role);
    } else {
      setSelectedMainRole(role);
      setStep(2);
    }
  };

  const handleSubRoleSelect = (subType: string) => {
    if (!selectedMainRole) return;
    
    // Nếu chọn Cá nhân/Phụ huynh
    if (selectedMainRole === 'parent') {
      if (subType === 'teacher') {
        // Teacher là business (vì phục vụ tổ chức/tuyển dụng) nhưng góc độ role, trong db cũ, ta có thể lưu role: 'business' và orgType: 'teacher'
        onSelect('business', 'teacher');
      } else {
        // parent thông thường
        onSelect('parent');
      }
    } 
    // Nếu chọn Tổ chức/Doanh nghiệp
    else if (selectedMainRole === 'business') {
      onSelect('business', subType);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#0F0C29] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#4F46E5] rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-[#DB2777] rounded-full blur-[120px] opacity-20"></div>
      </div>

      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="text-center relative z-10"
          >
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 bg-gradient-to-br from-[#4F46E5] to-[#DB2777] rounded-[32px] mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-indigo-500/40"
            >
              <Sparkles className="text-white" size={48} />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
              CHÀO MỪNG BẠN ĐẾN VỚI
            </h1>
            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] to-[#DB2777] tracking-tighter">
              TEENTASK
            </h2>
          </motion.div>
        ) : step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm relative z-10"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-6">
                <UserCircle className="text-[#4F46E5]" size={16} />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Bước 1/2</span>
              </div>
              <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
                Bạn là ai?
              </h1>
              <p className="text-white/50 text-sm leading-relaxed">
                Chọn trụ cột phù hợp với bạn trên TeenTask.
              </p>
            </div>

            <div className="grid gap-4">
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMainRoleSelect('student')}
                className="group flex flex-col items-start gap-4 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] text-left hover:bg-indigo-600/20 transition-all hover:border-indigo-500/50"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl">
                    <GraduationCap className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">Học sinh (14-18)</h3>
                    <p className="text-indigo-200/50 text-[10px] uppercase font-bold tracking-wider">TEENTASKER</p>
                  </div>
                  <ArrowRight className="text-white/20 group-hover:text-indigo-400 transition-colors" size={18} />
                </div>
                <p className="text-white/50 text-xs pl-[60px]">Tìm việc, Job Shadowing, xác thực CV và nhận tư vấn hướng nghiệp.</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMainRoleSelect('parent')}
                className="group flex flex-col items-start gap-4 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] text-left hover:bg-emerald-600/20 transition-all hover:border-emerald-500/50"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl">
                    <Users className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Cá nhân</h3>
                    <p className="text-emerald-200/50 text-[10px] uppercase font-bold tracking-wider">PHỤ HUYNH / GIÁO VIÊN</p>
                  </div>
                  <ArrowRight className="text-white/20 group-hover:text-emerald-400 transition-colors" size={18} />
                </div>
                <p className="text-white/50 text-xs pl-[60px]">Giám sát an toàn cho con, bảo lãnh kết nối hoặc tham gia cố vấn, hướng nghiệp tư nhân.</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMainRoleSelect('business')}
                className="group flex flex-col items-start gap-4 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] text-left hover:bg-pink-600/20 transition-all hover:border-pink-500/50"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl">
                    <Building2 className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">Tổ chức</h3>
                    <p className="text-pink-200/50 text-[10px] uppercase font-bold tracking-wider">DOANH NGHIỆP / NHÀ TRƯỜNG</p>
                  </div>
                  <ArrowRight className="text-white/20 group-hover:text-pink-400 transition-colors" size={18} />
                </div>
                <p className="text-white/50 text-xs pl-[60px]">Tuyển dụng học sinh, mở trạm Kiến tập, tổ chức workshop và kết nối toàn mạng lưới Edu Network.</p>
              </motion.button>
            </div>
            
            <button 
              onClick={() => handleMainRoleSelect('admin')}
              className="w-full mt-8 text-white/20 hover:text-white/50 text-xs text-center transition-colors font-mono"
            >
              [ Administrator Login ]
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full max-w-sm relative z-10"
          >
            <div className="text-center mb-10">
              <button 
                onClick={() => setStep(1)}
                className="inline-flex items-center justify-center w-10 h-10 bg-white/5 rounded-full hover:bg-white/10 transition-colors mb-6 text-white/50 hover:text-white"
              >
                &larr;
              </button>
              <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
                Chi tiết vai trò
              </h1>
              <p className="text-white/50 text-sm leading-relaxed">
                {selectedMainRole === 'parent' ? 'Phân loại cho nhóm Cá nhân' : 'Phân loại Tổ chức của bạn'}
              </p>
            </div>

            <div className="grid gap-4">
              {selectedMainRole === 'parent' ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubRoleSelect('parent')}
                    className="p-5 bg-white/5 border border-emerald-500/30 rounded-2xl text-left hover:bg-emerald-500/10 transition-all flex items-center gap-4 group"
                  >
                     <ShieldCheck className="text-emerald-400" size={24} />
                     <div>
                       <h3 className="text-emerald-50 font-bold">Phụ huynh (Parent)</h3>
                       <p className="text-emerald-100/40 text-[10px]">Giám sát học sinh</p>
                     </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubRoleSelect('teacher')}
                    className="p-5 bg-white/5 border border-purple-500/30 rounded-2xl text-left hover:bg-purple-500/10 transition-all flex items-center gap-4 group"
                  >
                     <School className="text-purple-400" size={24} />
                     <div>
                       <h3 className="text-purple-50 font-bold">Giáo viên (Career Advisor)</h3>
                       <p className="text-purple-100/40 text-[10px]">Tư vấn, hướng nghiệp</p>
                     </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubRoleSelect('business')} // Mentor cá nhân tự do
                    className="p-5 bg-white/5 border border-sky-500/30 rounded-2xl text-left hover:bg-sky-500/10 transition-all flex items-center gap-4 group"
                  >
                     <Briefcase className="text-sky-400" size={24} />
                     <div>
                       <h3 className="text-sky-50 font-bold">Người đi làm / Cá nhân</h3>
                       <p className="text-sky-100/40 text-[10px]">Làm Mentor hoặc tuyển người làm việc nhà</p>
                     </div>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubRoleSelect('business')}
                    className="p-5 bg-white/5 border border-pink-500/30 rounded-2xl text-left hover:bg-pink-500/10 transition-all flex items-center gap-4 group"
                  >
                     <Building2 className="text-pink-400" size={24} />
                     <div>
                       <h3 className="text-pink-50 font-bold">Doanh nghiệp công ty</h3>
                       <p className="text-pink-100/40 text-[10px]">Tuyển dụng chuyên nghiệp</p>
                     </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubRoleSelect('school')}
                    className="p-5 bg-white/5 border border-blue-500/30 rounded-2xl text-left hover:bg-blue-500/10 transition-all flex items-center gap-4 group"
                  >
                     <School className="text-blue-400" size={24} />
                     <div>
                       <h3 className="text-blue-50 font-bold">Trường THPT / Đại học</h3>
                       <p className="text-blue-100/40 text-[10px]">Quản lý học sinh nhà trường</p>
                     </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubRoleSelect('ngo')}
                    className="p-5 bg-white/5 border border-orange-500/30 rounded-2xl text-left hover:bg-orange-500/10 transition-all flex items-center gap-4 group"
                  >
                     <Component className="text-orange-400" size={24} />
                     <div>
                       <h3 className="text-orange-50 font-bold">Tổ chức Phi lợi nhuận (NGO)</h3>
                       <p className="text-orange-100/40 text-[10px]">Dự án xã hội, thiện nguyện</p>
                     </div>
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
