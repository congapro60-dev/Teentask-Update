import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Megaphone, ClipboardList, Eye, X, CheckCircle2 } from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../FirebaseProvider';

interface ContentTabProps {
  activeTab: 'jobs' | 'ads' | 'applications';
  filter: string;
  searchQuery: string;
}

export default function ContentTab({ activeTab, filter, searchQuery }: ContentTabProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const unsubscribeJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeAds = onSnapshot(collection(db, 'ads'), (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeApps = onSnapshot(collection(db, 'applications'), (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeAds();
      unsubscribeApps();
    };
  }, []);

  const handleApproveJob = async (jobId: string, approved: boolean) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'jobs', jobId), { isApproved: approved });
      setSelectedJob(null);
    } catch (error) {
      console.error("Error approving job:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAd = async (adId: string, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'ads', adId), { status });
      setSelectedAd(null);
    } catch (error) {
      console.error("Error approving ad:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredData = () => {
    if (activeTab === 'jobs') {
      return jobs.filter(job => {
        const matchesFilter = filter === 'all' || (filter === 'pending' ? !job.isApproved : job.isApproved);
        const matchesSearch = !searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      });
    } else if (activeTab === 'ads') {
      return ads.filter(ad => {
        const matchesFilter = filter === 'all' || ad.status === filter;
        const matchesSearch = !searchQuery || ad.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      });
    } else {
      return applications.filter(app => {
        let matchesFilter = false;
        if (filter === 'all') matchesFilter = true;
        else if (filter === 'parent') matchesFilter = app.approvalChannel !== 'teacher';
        else if (filter === 'teacher') matchesFilter = app.approvalChannel === 'teacher';
        
        const matchesSearch = !searchQuery || 
                             ((app.studentName?.toLowerCase() || '').includes(searchQuery.toLowerCase())) ||
                             ((app.jobTitle?.toLowerCase() || '').includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
      });
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Đang tải dữ liệu...</div>;

  const data = filteredData();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {activeTab === 'jobs' && data.map((job: any) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{job.title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{job.businessName}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  job.isApproved ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {job.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedJob(job)}
                  className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={14} /> Chi tiết
                </button>
              </div>
            </motion.div>
          ))}

          {activeTab === 'ads' && data.map((ad: any) => (
            <motion.div
              key={ad.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{ad.title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{ad.businessName}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  ad.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                  ad.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {ad.status === 'approved' ? 'Đã duyệt' : ad.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                </div>
              </div>
              <img src={ad.imageUrl} className="w-full h-32 object-cover rounded-2xl mb-4" alt="" referrerPolicy="no-referrer" />
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedAd(ad)}
                  className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={14} /> Chi tiết
                </button>
              </div>
            </motion.div>
          ))}

          {activeTab === 'applications' && data.map((app: any) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{app.studentName}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider line-clamp-1">{app.jobTitle || `Job ID: ${app.jobId}`}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  app.approvalChannel === 'teacher' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                }`}>
                  {app.approvalChannel === 'teacher' ? 'Giáo viên' : 'Phụ huynh'}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Trạng thái xác nhận:</span>
                  <span className={`font-bold ${
                    (app.approvalChannel === 'teacher' ? app.teacherStatus : app.parentStatus) === 'approved' ? 'text-green-600' :
                    (app.approvalChannel === 'teacher' ? app.teacherStatus : app.parentStatus) === 'rejected' ? 'text-red-600' :
                    'text-amber-600'
                  }`}>
                    {(app.approvalChannel === 'teacher' ? app.teacherStatus : app.parentStatus) === 'approved' ? 'Đã xác nhận' :
                     (app.approvalChannel === 'teacher' ? app.teacherStatus : app.parentStatus) === 'rejected' ? 'Từ chối' : 'Đang chờ'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Trạng thái DN:</span>
                  <span className={`font-bold ${
                    app.finalStatus === 'accepted' ? 'text-green-600' :
                    app.finalStatus === 'rejected' ? 'text-red-600' :
                    app.finalStatus === 'completed' ? 'text-blue-600' :
                    'text-amber-600'
                  }`}>
                    {app.finalStatus === 'accepted' ? 'Đã nhận' :
                     app.finalStatus === 'rejected' ? 'Từ chối' :
                     app.finalStatus === 'completed' ? 'Hoàn thành' : 'Đang chờ'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {data.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold">Không có mục nào cần xử lý</p>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <h2 className="text-2xl font-black mb-4">{selectedJob.title}</h2>
              <p className="text-gray-500 mb-6">{selectedJob.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Lương</p>
                  <p className="font-bold">{selectedJob.salary?.toLocaleString()}đ</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Địa điểm</p>
                  <p className="font-bold">{selectedJob.location}</p>
                </div>
              </div>
              {!selectedJob.isApproved && (
                <div className="flex gap-4">
                  <button onClick={() => handleApproveJob(selectedJob.id, false)} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black">TỪ CHỐI</button>
                  <button onClick={() => handleApproveJob(selectedJob.id, true)} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black">PHÊ DUYỆT CÔNG VIỆC</button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {selectedAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setSelectedAd(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <h2 className="text-2xl font-black mb-4">{selectedAd.title}</h2>
              <img src={selectedAd.imageUrl} className="w-full h-64 object-cover rounded-3xl mb-6" alt="" referrerPolicy="no-referrer" />
              <p className="text-gray-500 mb-8">{selectedAd.description}</p>
              {selectedAd.status === 'pending' && (
                <div className="flex gap-4">
                  <button onClick={() => handleApproveAd(selectedAd.id, 'rejected')} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black">TỪ CHỐI</button>
                  <button onClick={() => handleApproveAd(selectedAd.id, 'approved')} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black">PHÊ DUYỆT QUẢNG CÁO</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
