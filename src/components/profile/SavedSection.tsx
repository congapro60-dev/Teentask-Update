import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Application, Job } from '../../types';

interface SavedSectionProps {
  profile: UserProfile | null;
  applications: (Application & { job?: Job })[];
}

export default function SavedSection({ profile, applications }: SavedSectionProps) {
  const navigate = useNavigate();
  
  return (
    <motion.div
      key="saved"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-pink-50 text-pink-600 rounded-xl">
            <Heart size={20} />
          </div>
          Đã lưu ({profile?.savedJobs?.length || 0})
        </h3>

        {(profile?.savedJobs || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.filter(app => profile?.savedJobs?.includes(app.jobId)).map(app => (
              <div key={app.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-pink-200 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-gray-100">
                    <img src={app.job?.businessLogo || 'https://picsum.photos/seed/company/100/100'} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <button className="p-2 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors">
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{app.job?.title}</h4>
                <p className="text-xs text-gray-500 mb-4">{app.job?.businessName}</p>
                <button 
                  onClick={() => navigate(`/jobs?id=${app.jobId}`)}
                  className="w-full py-2 bg-white text-gray-600 border border-gray-200 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
            {profile?.savedJobs?.length > applications.filter(app => profile?.savedJobs?.includes(app.jobId)).length && (
              <div className="col-span-full p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-xs text-indigo-600 font-medium text-center">
                  Bạn có một số mục đã lưu khác. Hãy khám phá thêm ở trang Việc làm!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Bạn chưa lưu công việc nào.</p>
            <button 
              onClick={() => navigate('/jobs')}
              className="mt-4 px-6 py-2 bg-[#1877F2] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100"
            >
              Khám phá ngay
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
