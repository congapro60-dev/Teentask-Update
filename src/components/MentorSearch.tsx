import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, GraduationCap, Star, MessageSquare, User, Briefcase, Award, ChevronRight, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, useFirebase } from './FirebaseProvider';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const FIELDS = ['Tất cả', 'Marketing', 'Tech', 'Design', 'Finance', 'Management', 'Education', 'Healthcare', 'Art'];
const EXPERIENCE_LEVELS = [
  { label: 'Tất cả', value: 'all' },
  { label: '1-3 năm', value: '1-3' },
  { label: '3-5 năm', value: '3-5' },
  { label: '5-10 năm', value: '5-10' },
  { label: 'Trên 10 năm', value: '10+' },
];

export default function MentorSearch() {
  const navigate = useNavigate();
  const { createChat } = useFirebase();
  const [mentors, setMentors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeField, setActiveField] = useState('Tất cả');
  const [activeExp, setActiveExp] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'),
          where('isMentor', '==', true),
          where('mentorStatus', '==', 'approved'),
          limit(100)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setMentors(results);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      const profile = mentor.mentorProfile;
      if (!profile) return false;

      const matchesSearch = 
        mentor.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesField = activeField === 'Tất cả' || profile.field === activeField;

      let matchesExp = true;
      if (activeExp !== 'all') {
        const years = profile.yearsOfExperience;
        if (activeExp === '1-3') matchesExp = years >= 1 && years <= 3;
        else if (activeExp === '3-5') matchesExp = years > 3 && years <= 5;
        else if (activeExp === '5-10') matchesExp = years > 5 && years <= 10;
        else if (activeExp === '10+') matchesExp = years > 10;
      }

      return matchesSearch && matchesField && matchesExp;
    });
  }, [mentors, searchQuery, activeField, activeExp]);

  const handleStartChat = async (mentor: UserProfile) => {
    try {
      const chatId = await createChat(mentor.uid, {
        displayName: mentor.displayName,
        photoURL: mentor.photoURL,
        role: mentor.role
      });
      navigate(`/messages/${chatId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Section */}
      <div className="bg-indigo-900 pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-indigo-200 hover:text-white transition-colors mb-8 group"
          >
            <X size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Quay lại</span>
          </button>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Tìm kiếm Mentor
          </h1>
          <p className="text-indigo-200 text-lg max-w-2xl mb-10 font-medium">
            Kết nối với các chuyên gia hàng đầu để nhận được sự hướng dẫn và định hướng nghề nghiệp tốt nhất.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm theo tên, chức danh hoặc công ty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm font-medium focus:outline-none shadow-xl"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-6 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-xl",
                showFilters ? "bg-indigo-500 text-white" : "bg-white text-indigo-900"
              )}
            >
              <SlidersHorizontal size={20} />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Lĩnh vực chuyên môn</h3>
                  <div className="flex flex-wrap gap-2">
                    {FIELDS.map(field => (
                      <button
                        key={field}
                        onClick={() => setActiveField(field)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          activeField === field 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Kinh nghiệm làm việc</h3>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_LEVELS.map(level => (
                      <button
                        key={level.value}
                        onClick={() => setActiveExp(level.value)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          activeExp === level.value 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 h-64 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <motion.div
                key={mentor.uid}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 overflow-hidden border border-indigo-100 shrink-0">
                    {mentor.photoURL ? (
                      <img src={mentor.photoURL} alt={mentor.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-300">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                      {mentor.displayName}
                    </h3>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider truncate mb-1">
                      {mentor.mentorProfile?.title}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                      <Briefcase size={10} />
                      <span className="truncate">{mentor.mentorProfile?.company}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Lĩnh vực</span>
                    <span className="text-gray-900">{mentor.mentorProfile?.field}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Kinh nghiệm</span>
                    <span className="text-indigo-600">{mentor.mentorProfile?.yearsOfExperience} năm</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10">
                  {mentor.mentorProfile?.bio || "Chưa có giới thiệu."}
                </p>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStartChat(mentor)}
                    className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={14} />
                    Nhắn tin
                  </button>
                  <button 
                    onClick={() => navigate(`/student/${mentor.uid}`)}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    Xem hồ sơ
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <GraduationCap size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy Mentor nào</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để có kết quả tốt hơn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
