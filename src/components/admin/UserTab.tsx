import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, UserCog, Eye, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../FirebaseProvider';
import { cn } from '../../lib/utils';

interface UserTabProps {
  activeTab: string;
  filter: string;
  searchQuery: string;
}

export default function UserTab({ activeTab, filter, searchQuery }: UserTabProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [nameChangeRequests, setNameChangeRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedNameChange, setSelectedNameChange] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Security: Whitelist fields for user list
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName,
          photoURL: data.photoURL,
          role: data.role,
          orgType: data.orgType,
          verificationStatus: data.verificationStatus,
          linkedInStatus: data.linkedInStatus,
          linkedInUrl: data.linkedInUrl,
          isVip: data.isVip,
          mentorStatus: data.mentorStatus
          // Sensitive fields (email, idNumber, etc.) are NOT included here
        };
      });
      setUsers(userData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    const unsubscribeNames = onSnapshot(collection(db, 'name_change_requests'), (snapshot) => {
      setNameChangeRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching name change requests:", error);
    });

    return () => {
      unsubscribe();
      unsubscribeNames();
    };
  }, []);

  const handleVerify = async (userId: string, status: 'verified' | 'rejected') => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), { verificationStatus: status });
      await addDoc(collection(db, 'notifications'), {
        userId,
        title: status === 'verified' ? 'Tài khoản đã được xác minh' : 'Xác minh tài khoản bị từ chối',
        message: status === 'verified' ? 'Chúc mừng! Hồ sơ của bạn đã được phê duyệt.' : 'Rất tiếc, hồ sơ của bạn không đủ điều kiện xác minh.',
        type: 'system',
        read: false,
        createdAt: Date.now()
      });
      setSelectedUser(null);
    } catch (error) {
      console.error("Error verifying user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveNameChange = async (requestId: string, userId: string, newName: string, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'name_change_requests', requestId), { status });
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', userId), { displayName: newName });
        await addDoc(collection(db, 'notifications'), {
          userId,
          title: 'Yêu cầu đổi tên đã được phê duyệt',
          message: `Tên hiển thị của bạn đã được đổi thành "${newName}".`,
          type: 'system',
          read: false,
          createdAt: Date.now()
        });
      } else {
        await addDoc(collection(db, 'notifications'), {
          userId,
          title: 'Yêu cầu đổi tên bị từ chối',
          message: 'Yêu cầu đổi tên của bạn không được phê duyệt. Vui lòng kiểm tra lại minh chứng.',
          type: 'system',
          read: false,
          createdAt: Date.now()
        });
      }
      setSelectedNameChange(null);
    } catch (error) {
      console.error("Error approving name change:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMentor = async (userId: string, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        mentorStatus: status,
        isMentor: status === 'approved'
      });
      await addDoc(collection(db, 'notifications'), {
        userId,
        title: status === 'approved' ? 'Đăng ký Mentor thành công' : 'Đăng ký Mentor bị từ chối',
        message: status === 'approved' 
          ? 'Chúc mừng! Bạn đã trở thành Mentor trên TeenTask. Bây giờ bạn có thể tạo các buổi Kiến tập.'
          : 'Rất tiếc, yêu cầu đăng ký Mentor của bạn chưa được phê duyệt lúc này.',
        type: 'system',
        read: false,
        createdAt: Date.now()
      });
      setSelectedUser(null);
    } catch (error) {
      console.error("Error approving mentor:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyLinkedIn = async (userId: string, status: 'verified' | 'rejected') => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), { linkedInStatus: status });
      await addDoc(collection(db, 'notifications'), {
        userId,
        title: status === 'verified' ? 'Xác minh LinkedIn thành công' : 'Xác minh LinkedIn bị từ chối',
        message: status === 'verified' ? 'Hồ sơ LinkedIn của bạn đã được xác minh.' : 'Yêu cầu xác minh LinkedIn của bạn không hợp lệ.',
        type: 'system',
        read: false,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Error updating LinkedIn status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchFullUser = async (user: any) => {
    // Fetch sensitive data only when needed
    try {
      const userDoc = await getDoc(doc(db, 'users', user.id));
      if (userDoc.exists()) {
        setSelectedUser({ ...user, ...userDoc.data() });
      }
    } catch (error) {
      console.error("Error fetching full user data:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    let matchesFilter = false;
    if (filter === 'all' || filter === 'pending' || filter === 'verified' || filter === 'rejected') {
      matchesFilter = filter === 'all' || user.verificationStatus === filter;
    } else if (filter === 'linkedin_pending') {
      matchesFilter = user.linkedInStatus === 'pending';
    } else if (['business', 'school', 'teacher', 'ngo'].includes(filter)) {
      matchesFilter = user.role === 'business' && user.orgType === filter;
    } else {
      matchesFilter = true;
    }
    
    const matchesSearch = !searchQuery || 
                         ((user.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const filteredNameChanges = nameChangeRequests.filter(req => {
    const matchesFilter = filter === 'all' || req.status === filter;
    const matchesSearch = !searchQuery || 
                         req.newName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.currentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="py-20 text-center text-gray-400">Đang tải dữ liệu người dùng...</div>;

  return (
    <div className="space-y-8">
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user: any) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4">
                    <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-2xl object-cover border border-gray-100" referrerPolicy="no-referrer" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{user.displayName}</h3>
                        {user.isVip && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[8px] font-black rounded-full uppercase tracking-widest border border-yellow-200">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.role}</p>
                        {user.role === 'business' && user.orgType && (
                          <span className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-widest border ${
                            user.orgType === 'school' ? 'bg-green-50 text-green-600 border-green-200' :
                            user.orgType === 'teacher' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                            user.orgType === 'ngo' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            'bg-indigo-50 text-indigo-600 border-indigo-200'
                          }`}>
                            {user.orgType === 'school' ? 'Nhà trường' :
                             user.orgType === 'teacher' ? 'Giáo viên' :
                             user.orgType === 'ngo' ? 'NGO' : 'Doanh nghiệp'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    user.verificationStatus === 'verified' ? 'bg-green-50 text-green-600 border-green-100' :
                    user.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    user.verificationStatus === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-gray-50 text-gray-500 border-gray-100'
                  }`}>
                    {user.verificationStatus === 'verified' ? 'Đã duyệt' :
                     user.verificationStatus === 'pending' ? 'Chờ duyệt' :
                     user.verificationStatus === 'rejected' ? 'Từ chối' : 'Chưa gửi'}
                  </div>
                </div>
                
                {user.linkedInStatus === 'pending' && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0077B5] flex items-center gap-1">
                        <div className="w-4 h-4 bg-[#0077B5] text-white rounded flex items-center justify-center font-bold text-[8px]">in</div>
                        Yêu cầu duyệt LinkedIn
                      </span>
                      <a href={user.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                        Xem hồ sơ
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleVerifyLinkedIn(user.id, 'verified')}
                        className="flex-1 py-1.5 bg-[#0077B5] text-white rounded-lg text-xs font-bold hover:bg-[#006097]"
                      >
                        Duyệt
                      </button>
                      <button 
                        onClick={() => handleVerifyLinkedIn(user.id, 'rejected')}
                        className="flex-1 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => fetchFullUser(user)}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> Chi tiết
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Name Changes Section */}
      {activeTab === 'name_changes' && (
        <div className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNameChanges.map((req: any) => (
              <motion.div
                key={req.id}
                layout
                className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{req.currentName} → {req.newName}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    req.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 
                    req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {req.status === 'approved' ? 'Đã duyệt' : req.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">Lí do: {req.reason}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedNameChange(req)}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> Chi tiết
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
            >
              <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
              <div className="flex items-start gap-6 mb-8">
                <img src={selectedUser.photoURL} alt="" className="w-20 h-20 rounded-3xl object-cover border-4 border-gray-50" referrerPolicy="no-referrer" />
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-gray-900">{selectedUser.displayName}</h2>
                  <p className="text-gray-500 font-medium">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 bg-indigo-50 text-[#4F46E5] rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Thông tin xác thực</h3>
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Họ tên:</span>
                      <span className="font-bold text-gray-900">{selectedUser.fullName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Số CMT/CCCD:</span>
                      <span className="font-bold text-gray-900">{selectedUser.idNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Ảnh giấy tờ</h3>
                  <div className="aspect-[3/2] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                    {selectedUser.idCardPhoto && <img src={selectedUser.idCardPhoto} alt="ID Card" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                  </div>
                </div>
              </div>
              {selectedUser.mentorStatus === 'pending' && (
                <div className="mb-8 p-6 bg-indigo-50 rounded-3xl">
                  <h3 className="font-black text-indigo-900 mb-4">Yêu cầu đăng ký Mentor</h3>
                  <div className="space-y-2 mb-6 text-sm text-indigo-800">
                    <p><strong>Chức danh:</strong> {selectedUser.mentorProfile?.title}</p>
                    <p><strong>Công ty:</strong> {selectedUser.mentorProfile?.company}</p>
                    <p><strong>Kinh nghiệm:</strong> {selectedUser.mentorProfile?.yearsOfExperience} năm</p>
                    <p><strong>Lĩnh vực:</strong> {selectedUser.mentorProfile?.field}</p>
                    <p><strong>Bio:</strong> {selectedUser.mentorProfile?.bio}</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleApproveMentor(selectedUser.id, 'rejected')} className="flex-1 py-4 bg-white text-red-600 rounded-2xl font-black">TỪ CHỐI</button>
                    <button onClick={() => handleApproveMentor(selectedUser.id, 'approved')} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black">PHÊ DUYỆT MENTOR</button>
                  </div>
                </div>
              )}

              {selectedUser.verificationStatus === 'pending' && (
                <div className="flex gap-4">
                  <button onClick={() => handleVerify(selectedUser.id, 'rejected')} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black">TỪ CHỐI</button>
                  <button onClick={() => handleVerify(selectedUser.id, 'verified')} className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black">PHÊ DUYỆT</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Name Change Detail Modal */}
      <AnimatePresence>
        {selectedNameChange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setSelectedNameChange(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <h2 className="text-2xl font-black mb-2">Yêu cầu đổi tên</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Tên hiện tại</p>
                  <p className="font-bold">{selectedNameChange.currentName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Tên mới</p>
                  <p className="font-bold text-indigo-600">{selectedNameChange.newName}</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Lí do đổi tên</p>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-gray-700">{selectedNameChange.reason}</p>
                </div>
              </div>
              <div className="mb-8">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Minh chứng</p>
                <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                  {selectedNameChange.evidenceUrl && <img src={selectedNameChange.evidenceUrl} alt="Evidence" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                </div>
              </div>
              {selectedNameChange.status === 'pending' && (
                <div className="flex gap-4">
                  <button onClick={() => handleApproveNameChange(selectedNameChange.id, selectedNameChange.userId, selectedNameChange.newName, 'rejected')} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black">TỪ CHỐI</button>
                  <button onClick={() => handleApproveNameChange(selectedNameChange.id, selectedNameChange.userId, selectedNameChange.newName, 'approved')} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black">PHÊ DUYỆT ĐỔI TÊN</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
