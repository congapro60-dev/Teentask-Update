import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Clock, XCircle, Star, X, AlertTriangle, User, Heart 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import ProfileHeader from './profile/ProfileHeader';
import QuickActions from './profile/QuickActions';
import StudentView from './profile/StudentView';
import BusinessView from './profile/BusinessView';
import SocialSection from './profile/SocialSection';
import ActivitySection from './profile/ActivitySection';
import SavedSection from './profile/SavedSection';
import PersonalInfoModal from './profile/modals/PersonalInfoModal';
import RelationshipModal from './profile/modals/RelationshipModal';
import SkillsModal from './profile/modals/SkillsModal';
import FinancialModal from './profile/modals/FinancialModal';
import RoleModal from './profile/modals/RoleModal';
import LinkedInModal from './profile/modals/LinkedInModal';
import ReviewModal from './profile/modals/ReviewModal';
import StudentEditModal from './profile/modals/StudentEditModal';
import BusinessEditModal from './profile/modals/BusinessEditModal';
import NameChangeModal from './profile/modals/NameChangeModal';
import { useFirebase } from './FirebaseProvider';
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, getDoc, updateDoc, deleteDoc, orderBy, setDoc } from 'firebase/firestore';
import { db, auth } from './FirebaseProvider';
import { Application, Job, Review, Notification, FriendRequest, Relationship, UserProfile, Rating } from '../types';
import { PREDEFINED_SKILLS } from '../constants';

export default function Profile() {
  const navigate = useNavigate();
  const { 
    profile, logout, updateProfile, 
    acceptFriendRequest, rejectFriendRequest, 
    addRelationship, acceptRelationship, rejectRelationship,
    submitRating, submitNameChangeRequest, switchRole,
    t, language, setLanguage
  } = useFirebase();
  const [applications, setApplications] = useState<(Application & { job?: Job })[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [relationshipRequests, setRelationshipRequests] = useState<Relationship[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isStudentEditModalOpen, setIsStudentEditModalOpen] = useState(false);
  const [isBusinessEditModalOpen, setIsBusinessEditModalOpen] = useState(false);
  const [isNameChangeModalOpen, setIsNameChangeModalOpen] = useState(false);
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [linkedInConfirm, setLinkedInConfirm] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [relationshipType, setRelationshipType] = useState<'Family' | 'Professional'>('Family');
  const [relationshipTitle, setRelationshipTitle] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedApp, setSelectedApp] = useState<(Application & { job?: Job }) | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [tempSkills, setTempSkills] = useState<string[]>([]);
  const [studentEditData, setStudentEditData] = useState({
    achievements: [] as string[],
    portfolioLinks: [] as { title: string; url: string }[]
  });
  const [businessEditData, setBusinessEditData] = useState({
    businessName: '',
    businessLogo: '',
    businessAddress: '',
    industry: '',
    website: '',
    companySize: '',
    foundedYear: 2024
  });
  const [personalInfoData, setPersonalInfoData] = useState({
    fullName: '',
    dob: '',
    gender: 'Nam' as 'Nam' | 'Nữ' | 'Khác',
    phone: '',
    location: '',
    school: '',
    class: '',
    bio: ''
  });
  const [nameChangeData, setNameChangeData] = useState({
    newName: '',
    reason: '',
    proofUrl: ''
  });
  const [submittingNameChange, setSubmittingNameChange] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'saved'>('profile');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [quickSkillInput, setQuickSkillInput] = useState('');

  useEffect(() => {
    if (profile) {
      setStudentEditData({
        achievements: profile.achievements || [],
        portfolioLinks: profile.portfolioLinks || []
      });
      setBusinessEditData({
        businessName: profile.businessName || '',
        businessLogo: profile.businessLogo || '',
        businessAddress: profile.businessAddress || '',
        industry: profile.industry || '',
        website: profile.website || '',
        companySize: profile.companySize || '',
        foundedYear: profile.foundedYear || 2024
      });
      setPersonalInfoData({
        fullName: profile.fullName || '',
        dob: profile.dob || '',
        gender: profile.gender || 'Nam',
        phone: profile.phone || '',
        location: profile.location || '',
        school: profile.school || '',
        class: profile.class || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const badges = [
    { icon: '⭐', label: 'Người mới', color: 'bg-blue-50 text-blue-600' },
    { icon: '🔥', label: 'Chuyên cần', color: 'bg-orange-50 text-orange-600' },
    { icon: '🏆', label: 'Xuất sắc', color: 'bg-yellow-50 text-yellow-600' },
  ];

  // Mock parental verification status
  const parentalVerification = profile?.parentalVerification || {
    status: 'approved', // can be 'pending', 'approved', 'rejected'
    lastUpdated: '15/03/2026'
  };

  const handleLinkedInSubmit = async () => {
    if (!linkedInUrl || !linkedInConfirm || !auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        linkedInUrl,
        linkedInStatus: 'pending'
      });
      setShowLinkedInModal(false);
      alert("Đã gửi! Admin xác minh trong 24 giờ làm việc");
    } catch (e) {
      console.error(e);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const renderVerificationStatus = () => {
    const status = profile?.verificationStatus || 'unverified';
    const isVerified = profile?.isVerified;

    if (isVerified) {
      return {
        icon: <ShieldCheck size={20} />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        badgeColor: 'bg-green-50 text-green-600 border-green-100',
        label: 'Đã kiểm duyệt',
        statusText: 'Verified'
      };
    }

    switch (status) {
      case 'pending':
        return {
          icon: <Clock size={20} />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          badgeColor: 'bg-orange-50 text-orange-600 border-orange-100',
          label: 'Chưa kiểm duyệt',
          statusText: 'Pending'
        };
      case 'rejected':
        return {
          icon: <XCircle size={20} />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          badgeColor: 'bg-red-50 text-red-600 border-red-100',
          label: 'Từ chối kiểm duyệt',
          statusText: 'Rejected'
        };
      default:
        return {
          icon: <AlertTriangle size={20} />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-100',
          badgeColor: 'bg-gray-50 text-gray-400 border-gray-100',
          label: 'Chưa xác minh',
          statusText: 'Unverified'
        };
    }
  };

  const verificationUI = renderVerificationStatus();

  useEffect(() => {
    if (profile?.uid === 'demo-user' && profile?.role === 'student') {
      setApplications([
        {
          id: 'demo-app-1',
          jobId: 'demo-job-1',
          businessId: 'demo-biz-1',
          studentId: 'demo-user',
          studentName: 'Người dùng Demo',
          studentEmail: 'demo@teentask.vn',
          studentPhone: '0123456789',
          studentSchool: 'THPT Chuyên',
          studentClass: '11A1',
          parentEmail: 'parent@demo.com',
          guardianName: 'Phụ huynh Demo',
          guardianRelation: 'Bố/Mẹ',
          guardianPhone: '0987654321',
          guardianAddress: 'Hà Nội',
          coverLetter: 'Em rất muốn làm công việc này.',
          status: 'pending',
          parentStatus: 'pending',
          finalStatus: 'pending',
          createdAt: Date.now() - 86400000,
          job: {
            id: 'demo-job-1',
            businessId: 'demo-biz-1',
            businessName: 'Tech Startup VN',
            businessLogo: 'https://ui-avatars.com/api/?name=Tech',
            businessOrgType: 'company',
            title: 'Thiết kế Poster Sự kiện',
            description: 'Thiết kế 3 poster cho sự kiện ra mắt sản phẩm mới.',
            salary: '500.000đ',
            salaryValue: 500000,
            slotsTotal: 2,
            slotsFilled: 1,
            deadline: Date.now() + 86400000 * 5,
            location: 'Online',
            type: 'online',
            category: 'Design',
            status: 'active',
            isApproved: true,
            tags: ['Photoshop', 'Illustrator'],
            createdAt: Date.now() - 86400000 * 2,
          }
        }
      ]);
      setLoading(false);
      return;
    }

    if (!auth.currentUser || profile?.role !== 'student') {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'applications'),
      where('studentId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
      
      // Fetch job details for each application
      const appsWithJobs = await Promise.all(apps.map(async (app) => {
        const jobDoc = await getDoc(doc(db, 'jobs', app.jobId));
        return { ...app, job: jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } as Job : undefined };
      }));

      setApplications(appsWithJobs);
      setLoading(false);
    }, (error) => {
      console.error("Error in applications listener:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.role]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(fetchedNotifications);
    }, (error) => {
      console.error("Error in notifications listener:", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen to friend requests
    const qRequests = query(
      collection(db, 'friend_requests'),
      where('toId', '==', auth.currentUser.uid),
      where('status', '==', 'pending')
    );
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      setFriendRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest)));
    }, (error) => {
      console.error("Error in friend requests listener:", error);
    });

    // Listen to outgoing relationships
    const qRels = query(
      collection(db, 'relationships'),
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubRels = onSnapshot(qRels, (snapshot) => {
      setRelationships(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Relationship)));
    }, (error) => {
      console.error("Error in relationships listener:", error);
    });

    // Listen to incoming relationship requests
    const qRelRequests = query(
      collection(db, 'relationships'),
      where('relatedUserId', '==', auth.currentUser.uid),
      where('status', '==', 'pending')
    );
    const unsubRelRequests = onSnapshot(qRelRequests, (snapshot) => {
      setRelationshipRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Relationship)));
    }, (error) => {
      console.error("Error in relationship requests listener:", error);
    });

    return () => {
      unsubRequests();
      unsubRels();
      unsubRelRequests();
    };
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'ratings'),
      where('toId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRatings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rating)));
    }, (error) => {
      console.error("Error in ratings listener:", error);
    });

    return () => unsubscribe();
  }, []);

  const averageRating = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length).toFixed(1)
    : profile?.trustScore?.toFixed(1) || '0.0';

  useEffect(() => {
    if (!profile?.friends || profile.friends.length === 0) {
      setFriends([]);
      return;
    }

    const fetchFriends = async () => {
      const friendProfiles = await Promise.all(
        profile.friends.map(async (friendId) => {
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          return friendDoc.exists() ? { uid: friendDoc.id, ...friendDoc.data() } as UserProfile : null;
        })
      );
      setFriends(friendProfiles.filter(f => f !== null) as UserProfile[]);
    };

    fetchFriends();
  }, [profile?.friends]);

  const handleAddRelationship = async () => {
    if (!selectedFriend || !relationshipTitle) return;
    try {
      await addRelationship(
        selectedFriend.uid,
        selectedFriend.displayName || 'Người dùng',
        selectedFriend.photoURL,
        relationshipType,
        relationshipTitle
      );
      setIsRelationshipModalOpen(false);
      setSelectedFriend(null);
      setRelationshipTitle('');
      alert('Đã thêm mối quan hệ!');
    } catch (error) {
      console.error("Error adding relationship:", error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !selectedApp.job || !auth.currentUser || !profile) return;

    setSubmittingReview(true);
    try {
      await submitRating(
        selectedApp.job.businessId,
        reviewData.rating,
        reviewData.comment,
        selectedApp.jobId
      );
      
      // Update application to mark as reviewed
      await updateDoc(doc(db, 'applications', selectedApp.id), { reviewed: true });
      
      setIsReviewModalOpen(false);
      setSelectedApp(null);
      setReviewData({ rating: 5, comment: '' });
      alert('Cảm ơn bạn đã đánh giá!');
    } catch (error) {
      console.error("Error submitting review:", error);
      alert('Có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  const [financialAction, setFinancialAction] = useState<'deposit' | 'bank' | 'vip' | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [bankInfo, setBankInfo] = useState({ bankName: '', accountNumber: '', accountHolder: '' });

  const handleRoleChange = async (newRole: 'student' | 'parent' | 'business') => {
    try {
      await switchRole(newRole as any);
      setIsRoleModalOpen(false);
    } catch (error: any) {
      alert(error.message);
      console.error("Error changing role:", error);
    }
  };

  const handleNameChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameChangeData.newName || !nameChangeData.reason || !nameChangeData.proofUrl) {
      alert('Vui lòng điền đầy đủ thông tin và tải lên minh chứng.');
      return;
    }
    setSubmittingNameChange(true);
    try {
      await submitNameChangeRequest(nameChangeData.newName, nameChangeData.reason, nameChangeData.proofUrl);
      setIsNameChangeModalOpen(false);
      setNameChangeData({ newName: '', reason: '', proofUrl: '' });
      alert('Yêu cầu đổi tên đã được gửi và đang chờ phê duyệt.');
    } catch (error) {
      console.error("Error submitting name change request:", error);
      alert('Có lỗi xảy ra khi gửi yêu cầu.');
    } finally {
      setSubmittingNameChange(false);
    }
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNameChangeData(prev => ({ ...prev, proofUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    try {
      await updateProfile({ balance: (profile?.balance || 0) + Number(depositAmount) });
      setIsFinancialModalOpen(false);
      setDepositAmount('');
      alert('Nạp tiền thành công!');
    } catch (error) {
      console.error("Error depositing:", error);
    }
  };

  const handleLinkBank = async () => {
    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountHolder) return;
    try {
      await updateProfile({ bankAccount: bankInfo });
      setIsFinancialModalOpen(false);
      alert('Liên kết ngân hàng thành công!');
    } catch (error) {
      console.error("Error linking bank:", error);
    }
  };

  const handleBuyVip = async () => {
    const VIP_PRICE = 100000;
    if ((profile?.balance || 0) < VIP_PRICE) {
      alert('Số dư không đủ để mua VIP (100,000đ)');
      return;
    }
    try {
      await updateProfile({ 
        balance: (profile?.balance || 0) - VIP_PRICE,
        isVip: true 
      });
      setIsFinancialModalOpen(false);
      alert('Chúc mừng! Bạn đã trở thành thành viên VIP.');
    } catch (error) {
      console.error("Error buying VIP:", error);
    }
  };

  const handleOpenSkillsModal = () => {
    setTempSkills(profile?.skills || []);
    setIsSkillsModalOpen(true);
  };

  const toggleSkill = (skill: string) => {
    setTempSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  const saveSkills = async () => {
    try {
      await updateProfile({ skills: tempSkills });
      setIsSkillsModalOpen(false);
    } catch (error) {
      console.error("Error updating skills:", error);
      alert('Có lỗi xảy ra khi cập nhật kỹ năng.');
    }
  };

  const saveStudentProfile = async () => {
    try {
      await updateProfile(studentEditData);
      setIsStudentEditModalOpen(false);
      alert('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error("Error updating student profile:", error);
      alert('Có lỗi xảy ra khi cập nhật hồ sơ.');
    }
  };

  const saveBusinessProfile = async () => {
    try {
      await updateProfile(businessEditData);
      setIsBusinessEditModalOpen(false);
      alert('Cập nhật hồ sơ doanh nghiệp thành công!');
    } catch (error) {
      console.error("Error updating business profile:", error);
      alert('Có lỗi xảy ra khi cập nhật hồ sơ.');
    }
  };

  const savePersonalInfo = async () => {
    try {
      await updateProfile(personalInfoData);
      setIsPersonalInfoModalOpen(false);
      alert('Cập nhật thông tin cá nhân thành công!');
    } catch (error) {
      console.error("Error updating personal info:", error);
      alert('Có lỗi xảy ra khi cập nhật thông tin.');
    }
  };

  const addQuickSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSkillInput.trim() || (profile?.skills || []).includes(quickSkillInput.trim())) return;
    try {
      const newSkills = [...(profile?.skills || []), quickSkillInput.trim()];
      await updateProfile({ skills: newSkills });
      setQuickSkillInput('');
    } catch (error) {
      console.error("Error adding quick skill:", error);
    }
  };

  const removeSkill = async (skillToRemove: string) => {
    try {
      const newSkills = (profile?.skills || []).filter(s => s !== skillToRemove);
      await updateProfile({ skills: newSkills });
    } catch (error) {
      console.error("Error removing skill:", error);
    }
  };

  const getSkillLevel = (skill: string) => {
    // In a real app, this might come from completed tasks/courses
    // For now, we'll use a deterministic but varied level based on the skill name length
    const hash = skill.length % 3;
    if (hash === 0) return { percent: 33, label: 'Cơ bản' };
    if (hash === 1) return { percent: 66, label: 'Khá' };
    return { percent: 100, label: 'Thành thạo' };
  };

  return (
    <div className="min-h-screen pb-24 bg-[#F8FAFC]">
      {/* Profile Header Section */}
      <ProfileHeader 
        profile={profile} 
        averageRating={averageRating} 
        setIsNameChangeModalOpen={setIsNameChangeModalOpen} 
      />

      {/* Quick Actions Grid */}
      <QuickActions 
        setFinancialAction={setFinancialAction} 
        setIsFinancialModalOpen={setIsFinancialModalOpen} 
      />

      {/* Tabs Section */}
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          {[
            { id: 'profile', label: 'Hồ sơ', icon: User },
            { id: 'activity', label: 'Hoạt động', icon: Clock },
            { id: 'saved', label: 'Đã lưu', icon: Heart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
                activeTab === tab.id ? "bg-white text-[#1877F2] shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
            >
              {/* Left Column: Social & Identity */}
              <div className="space-y-6">
                <SocialSection 
                  friendRequests={friendRequests}
                  acceptFriendRequest={acceptFriendRequest}
                  rejectFriendRequest={rejectFriendRequest}
                  relationshipRequests={relationshipRequests}
                  acceptRelationship={acceptRelationship}
                  rejectRelationship={rejectRelationship}
                  relationships={relationships}
                  friends={friends}
                  setSelectedFriend={setSelectedFriend}
                  setIsRelationshipModalOpen={setIsRelationshipModalOpen}
                />
              </div>

              {/* Right Column: Role-specific View */}
              <div className="space-y-6">
                {profile?.role === 'student' ? (
                  <StudentView 
                    profile={profile}
                    updateProfile={updateProfile}
                    addQuickSkill={addQuickSkill}
                    removeSkill={removeSkill}
                    getSkillLevel={getSkillLevel}
                    setIsStudentEditModalOpen={setIsStudentEditModalOpen}
                    handleOpenSkillsModal={handleOpenSkillsModal}
                    quickSkillInput={quickSkillInput}
                    setQuickSkillInput={setQuickSkillInput}
                    badges={badges}
                    applications={applications}
                    ratings={ratings}
                    setIsReviewModalOpen={setIsReviewModalOpen}
                    setSelectedApp={setSelectedApp}
                    loading={loading}
                  />
                ) : profile?.role === 'business' ? (
                  <BusinessView 
                    profile={profile}
                    updateProfile={updateProfile}
                    verificationUI={verificationUI}
                    setShowLinkedInModal={setShowLinkedInModal}
                    setIsBusinessEditModalOpen={setIsBusinessEditModalOpen}
                    ratings={ratings}
                  />
                ) : (
                  <div className="bg-white rounded-[32px] p-8 text-center border border-gray-100">
                    <p className="text-gray-500">Vui lòng chọn vai trò để xem chi tiết hồ sơ.</p>
                    <button 
                      onClick={() => setIsRoleModalOpen(true)}
                      className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                    >
                      Chọn vai trò
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

      {activeTab === 'activity' && (
        <motion.div
          key="activity"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <ActivitySection notifications={notifications} />
        </motion.div>
      )}

      {activeTab === 'saved' && (
        <motion.div
          key="saved"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <SavedSection 
          profile={profile}
          applications={applications}
        />
        </motion.div>
      )}
    </AnimatePresence>
  </div>

      {/* Personal Info Modal */}
      <PersonalInfoModal
        isOpen={isPersonalInfoModalOpen}
        onClose={() => setIsPersonalInfoModalOpen(false)}
        profile={profile}
        personalInfoData={personalInfoData}
        setPersonalInfoData={setPersonalInfoData}
        savePersonalInfo={savePersonalInfo}
      />

      {/* Relationship Modal */}
      <RelationshipModal
        isOpen={isRelationshipModalOpen}
        onClose={() => setIsRelationshipModalOpen(false)}
        selectedFriend={selectedFriend}
        relationshipType={relationshipType}
        setRelationshipType={setRelationshipType}
        relationshipTitle={relationshipTitle}
        setRelationshipTitle={setRelationshipTitle}
        handleAddRelationship={handleAddRelationship}
      />

      {/* Skills Selection Modal */}
      <SkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        predefinedSkills={PREDEFINED_SKILLS}
        tempSkills={tempSkills}
        toggleSkill={toggleSkill}
        saveSkills={saveSkills}
      />

      {/* Financial Modal */}
      <FinancialModal
        isOpen={isFinancialModalOpen}
        onClose={() => setIsFinancialModalOpen(false)}
        financialAction={financialAction}
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
        handleDeposit={handleDeposit}
        bankInfo={bankInfo}
        setBankInfo={setBankInfo}
        handleLinkBank={handleLinkBank}
        profile={profile}
      />
      {/* Role Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        profile={profile}
        handleRoleChange={handleRoleChange}
      />

      {/* LinkedIn Verification Modal */}
      <LinkedInModal
        isOpen={showLinkedInModal}
        onClose={() => setShowLinkedInModal(false)}
        linkedInUrl={linkedInUrl}
        setLinkedInUrl={setLinkedInUrl}
        linkedInConfirm={linkedInConfirm}
        setLinkedInConfirm={setLinkedInConfirm}
        handleLinkedInSubmit={handleLinkedInSubmit}
        t={t}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        selectedApp={selectedApp}
        reviewData={reviewData}
        setReviewData={setReviewData}
        handleSubmitReview={handleSubmitReview}
        submittingReview={submittingReview}
      />
      <StudentEditModal
        isOpen={isStudentEditModalOpen}
        onClose={() => setIsStudentEditModalOpen(false)}
        studentEditData={studentEditData}
        setStudentEditData={setStudentEditData}
        saveStudentProfile={saveStudentProfile}
      />

      {/* Business Profile Edit Modal */}
      <BusinessEditModal
        isOpen={isBusinessEditModalOpen}
        onClose={() => setIsBusinessEditModalOpen(false)}
        businessEditData={businessEditData}
        setBusinessEditData={setBusinessEditData}
        saveBusinessProfile={saveBusinessProfile}
        profile={profile}
        updateProfile={updateProfile}
      />

      {/* Name Change Request Modal */}
      <NameChangeModal
        isOpen={isNameChangeModalOpen}
        onClose={() => setIsNameChangeModalOpen(false)}
        profile={profile}
        nameChangeData={nameChangeData}
        setNameChangeData={setNameChangeData}
        handleProofUpload={handleProofUpload}
        handleNameChangeSubmit={handleNameChangeSubmit}
        submittingNameChange={submittingNameChange}
      />
    </div>
  );
}
