import React from 'react';
import { motion } from 'motion/react';
import { Clock, Briefcase as BriefcaseIcon, UserPlus, Bell } from 'lucide-react';
import { Notification } from '../../types';

interface ActivitySectionProps {
  notifications: Notification[];
}

export default function ActivitySection({ notifications }: ActivitySectionProps) {
  return (
    <motion.div
      key="activity"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock size={20} />
          </div>
          Hoạt động gần đây
        </h3>
        
        <div className="space-y-6">
          {notifications.length > 0 ? (
            notifications.map((notif, idx) => (
              <div key={notif.id || idx} className="flex gap-4 relative">
                {idx !== notifications.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-100" />
                )}
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                  notif.type === 'application' ? 'bg-blue-50 text-blue-600' :
                  notif.type === 'friend_request' ? 'bg-purple-50 text-purple-600' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {notif.type === 'application' ? <BriefcaseIcon size={18} /> : 
                   notif.type === 'friend_request' ? <UserPlus size={18} /> : 
                   <Bell size={18} />}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">Chưa có hoạt động nào được ghi lại.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
