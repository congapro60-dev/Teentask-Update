import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Briefcase, GraduationCap, ChevronLeft, Trash2, MapPin, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { useFirebase, db } from './FirebaseProvider';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { MOCK_JOBS, MOCK_SHADOWING } from '../mockData';

export default function Saved() {
  const navigate = useNavigate();
  const { profile, toggleSaveJob, toggleSaveShadowing } = useFirebase();
  const [activeTab, setActiveTab] = useState<'jobs' | 'shadowing'>('jobs');
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [savedShadowing, setSavedShadowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedData = async () => {
      if (!profile) return;
      setLoading(true);

      try {
        // Fetch Jobs
        let jobsData: any[] = [];
        if (profile.savedJobs && profile.savedJobs.length > 0) {
          const jobsRef = collection(db, 'jobs');
          // Filter out mock IDs before querying Firestore
          const firestoreIds = profile.savedJobs.filter(id => !['1', '2', '3'].includes(id));
          
          if (firestoreIds.length > 0) {
            const q = query(jobsRef, where('__name__', 'in', firestoreIds.slice(0, 10)));
            const snapshot = await getDocs(q);
            jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
          
          // Merge with mock jobs
          const savedMockJobs = MOCK_JOBS.filter(job => profile.savedJobs?.includes(job.id));
          setSavedJobs([...jobsData, ...savedMockJobs]);
        } else {
          setSavedJobs([]);
        }

        // Fetch Shadowing
        if (profile.savedShadowing && profile.savedShadowing.length > 0) {
          setSavedShadowing(MOCK_SHADOWING.filter(s => profile.savedShadowing?.includes(s.id)));
        } else {
          setSavedShadowing([]);
        }
      } catch (error) {
        console.error("Error fetching saved items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedData();
  }, [profile?.savedJobs, profile?.savedShadowing]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-8 border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-gray-900">Đã lưu</h1>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('jobs')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'jobs' ? "bg-white text-[#1877F2] shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Briefcase size={18} />
            Việc làm ({profile?.savedJobs?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('shadowing')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'shadowing' ? "bg-white text-red-500 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <GraduationCap size={18} />
            Kiến tập ({profile?.savedShadowing?.length || 0})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex gap-4 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex gap-3 pt-2">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : activeTab === 'jobs' ? (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {savedJobs.length > 0 ? (
                savedJobs.map((job) => (
                  <div 
                    key={job.id}
                    className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex gap-4 relative group"
                  >
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1877F2] flex-shrink-0">
                      <Briefcase size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate mb-1">{job.title}</h3>
                      <p className="text-xs text-gray-500 mb-3">{job.businessName || job.company}</p>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                          <MapPin size={12} />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#1877F2]">
                          <DollarSign size={12} />
                          {job.salary}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleSaveJob(job.id)}
                      className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="w-32 h-32 mb-6 opacity-50">
                    <img src="https://illustrations.popsy.co/amber/surreal-hourglass.svg" alt="Empty" className="w-full h-full" referrerPolicy="no-referrer" />
                  </div>
                  <p className="text-sm font-bold mb-2 text-gray-600">Chưa có việc làm nào được lưu</p>
                  <p className="text-xs text-gray-400 mb-6 text-center max-w-[250px]">Hãy khám phá các cơ hội việc làm hấp dẫn và lưu lại để ứng tuyển sau nhé!</p>
                  <button 
                    onClick={() => navigate('/jobs')}
                    className="px-6 py-3 bg-[#1877F2] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20"
                  >
                    Khám phá việc làm <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="shadowing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {savedShadowing.length > 0 ? (
                savedShadowing.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white overflow-hidden rounded-[32px] border border-gray-100 shadow-sm relative group"
                  >
                    <div className="aspect-[21/9] relative">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <button 
                        onClick={() => toggleSaveShadowing(item.id)}
                        className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md text-white hover:bg-red-500 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-xs text-gray-500 mb-4">{item.mentor} @ {item.company}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-red-500">{item.price}</span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                          <Clock size={14} />
                          {item.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="w-32 h-32 mb-6 opacity-50">
                    <img src="https://illustrations.popsy.co/amber/surreal-hourglass.svg" alt="Empty" className="w-full h-full" referrerPolicy="no-referrer" />
                  </div>
                  <p className="text-sm font-bold mb-2 text-gray-600">Chưa có kiến tập nào được lưu</p>
                  <p className="text-xs text-gray-400 mb-6 text-center max-w-[250px]">Hãy khám phá các chương trình kiến tập thực tế để định hướng nghề nghiệp nhé!</p>
                  <button 
                    onClick={() => navigate('/shadowing')}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
                  >
                    Khám phá kiến tập <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
