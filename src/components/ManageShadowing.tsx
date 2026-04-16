import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit2, Trash2, Users, Briefcase, MapPin, DollarSign, Clock, X, 
  CheckCircle2, User, ShieldCheck, ExternalLink, Sparkles, Loader2, 
  ClipboardList, Lightbulb, FileText as FileTextIcon, Calendar, 
  Video, Target, Award, ChevronRight, Info, AlertCircle, Check, 
  ArrowRight, Filter, Search
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth, useFirebase } from './FirebaseProvider';
import { useNavigate } from 'react-router-dom';
import { ShadowingEvent, PracticalTask, Application } from '../types';
import { cn } from '../lib/utils';

type TabType = 'slots' | 'workshops' | 'tasks';

const ManageShadowing: React.FC = () => {
  const { profile, approveApplication, rejectApplication } = useFirebase();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('slots');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalStudents: 0,
    trustScore: profile?.trustScore || 0
  });

  // Data states
  const [slots, setSlots] = useState<ShadowingEvent[]>([]);
  const [workshops, setWorkshops] = useState<ShadowingEvent[]>([]);
  const [tasks, setTasks] = useState<PracticalTask[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCandidatesModal, setShowCandidatesModal] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    mentorName: '',
    mentorTitle: '',
    date: '',
    time: '',
    price: 0,
    slotsTotal: 1,
    location: 'Văn phòng công ty',
    category: 'Công nghệ',
    level: 'Cơ bản',
    type: '1-1',
    durationDays: 7,
    requiredOutput: '',
    skillsGained: '',
    tier: 'explorer',
    tierLabel: 'Explorer',
    durationHours: 3,
    maxStudents: 15,
    perks: ['Certificate PDF', 'Q&A với mentor'],
    includesLunch: false,
    includesCertificate: true,
    includesBadge: false,
    includesLinkedIn: false,
    includesGiftBag: false,
    mentorLevel: 'senior'
  });

  // Fetch data
  useEffect(() => {
    if (profile?.uid === 'demo-user') {
      setSlots([
        {
          id: 'demo-slot-1',
          mentorId: 'demo-user',
          companyId: 'demo-user',
          companyName: 'Người dùng Demo',
          companyLogo: 'https://ui-avatars.com/api/?name=Demo',
          title: '1 ngày làm Software Engineer',
          description: 'Trải nghiệm 1 ngày làm việc thực tế tại công ty công nghệ.',
          mentorName: 'Nguyễn Văn B',
          mentorTitle: 'Senior Developer',
          date: Date.now() + 86400000 * 5,
          time: '09:00',
          price: 150000,
          slotsTotal: 5,
          slotsRemaining: 3,
          location: 'Văn phòng công ty',
          category: 'Công nghệ',
          level: 'Cơ bản',
          type: '1-1',
          status: 'upcoming',
          createdAt: Date.now() - 86400000,
          tier: 'explorer',
          tierLabel: 'Explorer',
          durationHours: 3,
          maxStudents: 5,
          perks: ['Certificate PDF', 'Q&A với mentor'],
          includesLunch: false,
          includesCertificate: true,
          includesBadge: false,
          includesLinkedIn: false,
          includesGiftBag: false,
          mentorLevel: 'senior'
        }
      ]);
      setWorkshops([]);
      setTasks([]);
      setApplications([
        {
          id: 'demo-app-2',
          jobId: 'demo-slot-1',
          businessId: 'demo-user',
          studentId: 'demo-student-2',
          studentName: 'Trần Thị C',
          studentEmail: 'tranthic@demo.com',
          studentPhone: '0987654321',
          studentSchool: 'THPT Chuyên',
          studentClass: '12A1',
          parentEmail: 'parent@demo.com',
          guardianName: 'Trần Văn D',
          guardianRelation: 'Bố',
          guardianPhone: '0123456789',
          coverLetter: 'Em rất muốn tìm hiểu về ngành IT.',
          status: 'pending',
          parentStatus: 'approved',
          finalStatus: 'pending',
          createdAt: Date.now() - 86400000,
        }
      ]);
      setLoading(false);
      return;
    }

    if (!profile?.uid) return;

    setLoading(true);
    
    // Listen to shadowing events (both 1-1 and workshops)
    const qEvents = query(
      collection(db, 'shadowing_events'),
      where('companyId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShadowingEvent));
      setSlots(allEvents.filter(e => e.type === '1-1'));
      setWorkshops(allEvents.filter(e => e.type === 'workshop'));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching events:", error);
      setLoading(false);
    });

    // Listen to tasks
    const qTasks = query(
      collection(db, 'practical_tasks'),
      where('businessId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PracticalTask)));
    });

    // Listen to applications for this business
    const qApps = query(
      collection(db, 'applications'),
      where('businessId', '==', profile.uid)
    );

    const unsubApps = onSnapshot(qApps, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
      setApplications(apps);
      
      // Calculate stats
      const completedApps = apps.filter(a => a.finalStatus === 'accepted' || a.finalStatus === 'completed');
      setStats(prev => ({
        ...prev,
        totalStudents: completedApps.length,
        totalIncome: completedApps.reduce((acc, curr) => acc + (curr.status === 'paid' ? 300000 : 0), 0) // Simplified for demo
      }));
    });

    return () => {
      unsubEvents();
      unsubTasks();
      unsubApps();
    };
  }, [profile?.uid]);

  // Handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.uid === 'demo-user') {
      alert('Đây là chế độ Demo. Đã tạo mới (mô phỏng).');
      setShowCreateModal(false);
      resetForm();
      return;
    }
    if (!profile?.uid) return;
    setActionLoading(true);
    try {
      if (activeTab === 'tasks') {
        await addDoc(collection(db, 'practical_tasks'), {
          businessId: profile.uid,
          businessName: profile.businessName || profile.displayName,
          title: formData.title,
          description: formData.description,
          durationDays: formData.durationDays,
          requiredOutput: formData.requiredOutput,
          skillsGained: formData.skillsGained.split(',').map((s: string) => s.trim()),
          maxStudents: formData.slotsTotal,
          currentStudents: 0,
          status: 'active',
          createdAt: Date.now()
        });
      } else {
        await addDoc(collection(db, 'shadowing_events'), {
          companyId: profile.uid,
          companyName: profile.businessName || profile.displayName,
          mentorId: profile.uid,
          mentorName: formData.mentorName,
          mentorTitle: formData.mentorTitle,
          title: formData.title,
          description: formData.description,
          date: new Date(formData.date).getTime(),
          time: formData.time,
          price: formData.price,
          slotsTotal: formData.slotsTotal,
          slotsRemaining: formData.slotsTotal,
          location: formData.location,
          category: formData.category,
          type: activeTab === 'slots' ? '1-1' : 'workshop',
          status: 'upcoming',
          level: formData.level,
          tier: formData.tier,
          tierLabel: formData.tierLabel,
          durationHours: formData.durationHours,
          maxStudents: formData.maxStudents,
          perks: formData.perks,
          customPerks: formData.customPerks.split(',').map((s: string) => s.trim()).filter(Boolean),
          roadmap: formData.roadmap.filter((r: any) => r.step.trim()),
          includesLunch: formData.includesLunch,
          includesCertificate: formData.includesCertificate,
          includesBadge: formData.includesBadge,
          includesLinkedIn: formData.includesLinkedIn,
          includesGiftBag: formData.includesGiftBag,
          mentorLevel: formData.mentorLevel,
          createdAt: Date.now()
        });
      }
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Error creating:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (app: Application) => {
    if (!window.confirm(`Duyệt ứng viên ${app.studentName}?`)) return;
    setActionLoading(true);
    try {
      await approveApplication(app.id, app.jobId, 'shadowing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (app: Application) => {
    if (!window.confirm(`Từ chối ứng viên ${app.studentName}?`)) return;
    setActionLoading(true);
    try {
      await rejectApplication(app.id);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      mentorName: profile?.displayName || '',
      mentorTitle: '',
      date: '',
      time: '',
      price: 0,
      slotsTotal: activeTab === 'slots' ? 1 : 10,
      location: activeTab === 'workshops' ? 'Online (Zoom/Meet)' : 'Văn phòng công ty',
      category: 'Công nghệ',
      level: 'Cơ bản',
      type: activeTab === 'slots' ? '1-1' : 'workshop',
      durationDays: 7,
      requiredOutput: '',
      skillsGained: '',
      tier: 'explorer',
      tierLabel: 'Explorer',
      durationHours: 3,
      maxStudents: 15,
      perks: ['Certificate PDF', 'Q&A với mentor'],
      customPerks: '',
      roadmap: [
        { step: 'Giới thiệu', description: 'Làm quen và giới thiệu về công việc' },
        { step: 'Quan sát', description: 'Theo dõi quy trình làm việc thực tế' },
        { step: 'Thực hành', description: 'Thực hiện task nhỏ dưới sự hướng dẫn' }
      ],
      includesLunch: false,
      includesCertificate: true,
      includesBadge: false,
      includesLinkedIn: false,
      includesGiftBag: false,
      mentorLevel: 'senior'
    });
  };

  const handleUpdateStatus = async (id: string, collectionName: string, newStatus: string) => {
    if (!window.confirm(`Xác nhận đổi trạng thái sang: ${newStatus}?`)) return;
    if (profile?.uid === 'demo-user') {
      alert(`Đây là chế độ Demo. Đã đổi trạng thái sang ${newStatus} (mô phỏng).`);
      return;
    }
    try {
      await updateDoc(doc(db, collectionName, id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id: string, collectionName: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa mục này?")) return;
    if (profile?.uid === 'demo-user') {
      alert('Đây là chế độ Demo. Đã xóa mục này (mô phỏng).');
      return;
    }
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Section */}
      <div className="bg-white p-6 pb-0 rounded-b-[40px] shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award size={14} className="text-[#DB2777]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Học viện TeenTask</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-gray-900">Quản lý Kiến tập</h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="w-12 h-12 bg-[#DB2777] text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-200 hover:bg-[#BE185D] transition-all active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 mt-6">
          {[
            { id: 'slots', label: 'Suất 1-1', icon: <User size={16} /> },
            { id: 'workshops', label: 'Workshop', icon: <Video size={16} /> },
            { id: 'tasks', label: 'Nhiệm vụ', icon: <Target size={16} /> },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "pb-4 text-sm font-black uppercase tracking-widest transition-all relative flex items-center gap-2",
                activeTab === tab.id ? 'text-[#DB2777]' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabShadow" className="absolute bottom-0 left-0 right-0 h-1 bg-[#DB2777] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tổng thu nhập</p>
            <h3 className="text-2xl font-black text-emerald-600">{stats.totalIncome.toLocaleString()}đ</h3>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Học sinh</p>
            <h3 className="text-2xl font-black text-indigo-600">{stats.totalStudents}</h3>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TrustScore</p>
            <h3 className="text-2xl font-black text-amber-500">{stats.trustScore}</h3>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-8 bg-indigo-50 border border-indigo-100 rounded-[32px] p-6 flex gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Info size={24} />
          </div>
          <div>
            <h4 className="font-black text-indigo-900 mb-1">
              {activeTab === 'slots' && "Kiến tập 1-1: Kèm cặp sát sao, định hướng cá nhân."}
              {activeTab === 'workshops' && "Workshop Nhóm: Lan tỏa kiến thức, truyền cảm hứng cộng đồng."}
              {activeTab === 'tasks' && "Nhiệm vụ thực hành: Học đi đôi với hành, tạo ra sản phẩm thực tế."}
            </h4>
            <p className="text-indigo-800/70 text-sm font-medium leading-relaxed">
              {activeTab === 'slots' && "Chọn Mentor có kinh nghiệm để giúp học sinh hiểu rõ về nghề nghiệp thực tế."}
              {activeTab === 'workshops' && "Tổ chức các buổi chia sẻ kỹ năng mềm hoặc kiến thức chuyên môn tập trung."}
              {activeTab === 'tasks' && "Giao các bài tập nhỏ có tính ứng dụng cao để học sinh tích lũy Portfolio."}
            </p>
          </div>
        </div>

        {/* Content List */}
        <div className="grid gap-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[#DB2777]" size={40} />
            </div>
          ) : (
            <>
              {activeTab === 'slots' && (
                slots.length > 0 ? slots.map(slot => (
                  <ShadowCard 
                    key={slot.id} 
                    item={slot}
                    type="shadowing_events"
                    candidates={applications.filter(a => a.jobId === slot.id)}
                    onUpdateStatus={(s: string) => handleUpdateStatus(slot.id, 'shadowing_events', s)}
                    onDelete={() => handleDelete(slot.id, 'shadowing_events')}
                    onViewCandidates={() => setShowCandidatesModal({ item: slot, apps: applications.filter(a => a.jobId === slot.id) })}
                  />
                )) : <EmptyState icon={<User size={48} />} text="Chưa có suất kiến tập 1-1 nào" />
              )}

              {activeTab === 'workshops' && (
                workshops.length > 0 ? workshops.map(ws => (
                  <ShadowCard 
                    key={ws.id} 
                    item={ws}
                    type="shadowing_events"
                    candidates={applications.filter(a => a.jobId === ws.id)}
                    onUpdateStatus={(s: string) => handleUpdateStatus(ws.id, 'shadowing_events', s)}
                    onDelete={() => handleDelete(ws.id, 'shadowing_events')}
                    onViewCandidates={() => setShowCandidatesModal({ item: ws, apps: applications.filter(a => a.jobId === ws.id) })}
                  />
                )) : <EmptyState icon={<Video size={48} />} text="Chưa có workshop nhóm nào" />
              )}

              {activeTab === 'tasks' && (
                tasks.length > 0 ? tasks.map(task => (
                  <ShadowCard 
                    key={task.id} 
                    item={task}
                    type="practical_tasks"
                    candidates={applications.filter(a => a.jobId === task.id)}
                    onUpdateStatus={(s: string) => handleUpdateStatus(task.id, 'practical_tasks', s)}
                    onDelete={() => handleDelete(task.id, 'practical_tasks')}
                    onViewCandidates={() => setShowCandidatesModal({ item: task, apps: applications.filter(a => a.jobId === task.id) })}
                  />
                )) : <EmptyState icon={<Target size={48} />} text="Chưa có nhiệm vụ nào" />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal title={`Tạo ${activeTab === 'slots' ? 'Kiến tập 1-1' : activeTab === 'workshops' ? 'Workshop' : 'Nhiệm vụ'}`} onClose={() => setShowCreateModal(false)}>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Tiêu đề / Tên" value={formData.title} onChange={(v: string) => setFormData({...formData, title: v})} placeholder="VD: Một ngày làm UI/UX Designer" />
              
              {activeTab !== 'tasks' && (
                <>
                  <div className="mb-6">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Chọn Gói Kiến Tập</label>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Explorer */}
                      <div 
                        onClick={() => {
                          const minPrice = 150000;
                          setFormData({
                            ...formData, 
                            tier: 'explorer', 
                            tierLabel: 'Explorer', 
                            price: Math.max(formData.price, minPrice), 
                            durationHours: 3, 
                            maxStudents: 15, 
                            slotsTotal: 15, 
                            perks: ['Certificate PDF', 'Q&A với mentor'], 
                            includesLunch: false, 
                            includesCertificate: true, 
                            includesBadge: false, 
                            includesLinkedIn: false, 
                            includesGiftBag: false
                          });
                        }}
                        className={cn("cursor-pointer rounded-2xl p-4 border-2 transition-all", formData.tier === 'explorer' ? "border-gray-400 bg-gray-50" : "border-gray-100 hover:border-gray-200 bg-white")}
                      >
                        <div className="text-xl mb-1">🥉</div>
                        <div className="font-black text-gray-900 text-sm">Explorer</div>
                        <div className="text-[10px] text-gray-500 font-bold mt-1">Sàn 150k • 3h</div>
                      </div>
                      {/* Insider */}
                      <div 
                        onClick={() => {
                          const minPrice = 350000;
                          setFormData({
                            ...formData, 
                            tier: 'insider', 
                            tierLabel: 'Insider', 
                            price: Math.max(formData.price, minPrice), 
                            durationHours: 5, 
                            maxStudents: 8, 
                            slotsTotal: 8, 
                            perks: ['Certificate + Badge hồ sơ', 'Thực hành task nhỏ', 'Q&A', 'Bữa trưa'], 
                            includesLunch: true, 
                            includesCertificate: true, 
                            includesBadge: true, 
                            includesLinkedIn: false, 
                            includesGiftBag: false
                          });
                        }}
                        className={cn("cursor-pointer rounded-2xl p-4 border-2 transition-all relative", formData.tier === 'insider' ? "border-indigo-500 bg-indigo-50" : "border-indigo-100 hover:border-indigo-200 bg-white")}
                      >
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap">Phổ biến</div>
                        <div className="text-xl mb-1">🥈</div>
                        <div className="font-black text-indigo-900 text-sm">Insider</div>
                        <div className="text-[10px] text-indigo-600/70 font-bold mt-1">Sàn 350k • 5h</div>
                      </div>
                      {/* Elite */}
                      <div 
                        onClick={() => {
                          const minPrice = 700000;
                          setFormData({
                            ...formData, 
                            tier: 'elite', 
                            tierLabel: 'Elite', 
                            price: Math.max(formData.price, minPrice), 
                            durationHours: 8, 
                            maxStudents: 5, 
                            slotsTotal: 5, 
                            perks: ['Certificate + Badge', 'LinkedIn recommendation', 'Shadowing cá nhân', 'Task thực tế', 'Bữa trưa', 'Networking session', 'Gift bag'], 
                            includesLunch: true, 
                            includesCertificate: true, 
                            includesBadge: true, 
                            includesLinkedIn: true, 
                            includesGiftBag: true
                          });
                        }}
                        className={cn("cursor-pointer rounded-2xl p-4 border-2 transition-all", formData.tier === 'elite' ? "border-amber-500 bg-amber-50" : "border-amber-100 hover:border-amber-200 bg-white")}
                      >
                        <div className="text-xl mb-1">🥇</div>
                        <div className="font-black text-amber-900 text-sm">Elite</div>
                        <div className="text-[10px] text-amber-600/70 font-bold mt-1">Sàn 700k • 8h</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Tên Mentor" value={formData.mentorName} onChange={(v: string) => setFormData({...formData, mentorName: v})} />
                    <Input label="Chức danh Mentor" value={formData.mentorTitle} onChange={(v: string) => setFormData({...formData, mentorTitle: v})} placeholder="VD: Senior Designer" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Ngày diễn ra" type="date" value={formData.date} onChange={(v: string) => setFormData({...formData, date: v})} />
                    <Input label="Giờ" type="time" value={formData.time} onChange={(v: string) => setFormData({...formData, time: v})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Cấp độ" value={formData.level} onChange={(v: string) => setFormData({...formData, level: v})} options={['Cơ bản', 'Nâng cao', 'Chuyên sâu']} />
                    <Input 
                      label="Phí (VNĐ)" 
                      type="number" 
                      value={formData.price} 
                      onChange={(v: string) => {
                        const val = parseInt(v);
                        const floor = formData.tier === 'elite' ? 700000 : formData.tier === 'insider' ? 350000 : 150000;
                        setFormData({...formData, price: val});
                      }} 
                      onBlur={(e: any) => {
                        const val = parseInt(e.target.value);
                        const floor = formData.tier === 'elite' ? 700000 : formData.tier === 'insider' ? 350000 : 150000;
                        if (val < floor) {
                          alert(`Giá tối thiểu cho gói ${formData.tierLabel} là ${floor.toLocaleString()}đ`);
                          setFormData({...formData, price: floor});
                        }
                      }}
                    />
                  </div>

                  <Input label="Quyền lợi bổ sung" value={formData.customPerks} onChange={(v: string) => setFormData({...formData, customPerks: v})} placeholder="VD: Tặng sách chuyên ngành, Review CV (cách nhau bằng dấu phẩy)" />

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lộ trình kiến tập (Roadmap)</label>
                    {formData.roadmap.map((step: any, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                          value={step.step}
                          onChange={e => {
                            const newRoadmap = [...formData.roadmap];
                            newRoadmap[idx].step = e.target.value;
                            setFormData({...formData, roadmap: newRoadmap});
                          }}
                          placeholder={`Bước ${idx + 1}`}
                        />
                        <input 
                          className="flex-[2] px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                          value={step.description}
                          onChange={e => {
                            const newRoadmap = [...formData.roadmap];
                            newRoadmap[idx].description = e.target.value;
                            setFormData({...formData, roadmap: newRoadmap});
                          }}
                          placeholder="Mô tả ngắn"
                        />
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, roadmap: [...formData.roadmap, { step: '', description: '' }]})}
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                    >
                      + Thêm bước lộ trình
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'tasks' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Hạn hoàn thành (ngày)" type="number" value={formData.durationDays} onChange={(v: string) => setFormData({...formData, durationDays: parseInt(v)})} />
                    <Input label="Số lượng HS" type="number" value={formData.slotsTotal} onChange={(v: string) => setFormData({...formData, slotsTotal: parseInt(v)})} />
                  </div>
                  <Input label="Output yêu cầu" value={formData.requiredOutput} onChange={(v: string) => setFormData({...formData, requiredOutput: v})} placeholder="VD: File PDF báo cáo, Link Figma" />
                  <Input label="Kỹ năng đạt được" value={formData.skillsGained} onChange={(v: string) => setFormData({...formData, skillsGained: v})} placeholder="VD: Photoshop, Figma (cách nhau bằng dấu phẩy)" />
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                {activeTab !== 'tasks' && <Input label="Số chỗ" type="number" value={formData.slotsTotal} onChange={(v: string) => setFormData({...formData, slotsTotal: parseInt(v)})} />}
                <Input label="Địa điểm" value={formData.location} onChange={(v: string) => setFormData({...formData, location: v})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mô tả chi tiết</label>
                <textarea 
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 outline-none min-h-[100px]"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả nội dung, yêu cầu và lợi ích..."
                />
              </div>

              <button disabled={actionLoading} className="w-full py-4 bg-[#DB2777] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-pink-100 mt-4 hover:bg-[#BE185D] transition-all active:scale-95">
                {actionLoading ? <Loader2 className="animate-spin mx-auto" /> : "Đăng chương trình"}
              </button>
            </form>
          </Modal>
        )}

        {showCandidatesModal && (
          <Modal title="Danh sách ứng viên" onClose={() => setShowCandidatesModal(null)}>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                <h4 className="font-black text-gray-900 text-sm">{showCandidatesModal.item.title || showCandidatesModal.item.name}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Tổng cộng: {showCandidatesModal.apps.length} ứng viên</p>
              </div>
              
              {showCandidatesModal.apps.length > 0 ? (
                <div className="space-y-3">
                  {showCandidatesModal.apps.map((app: Application) => (
                    <div key={app.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                          {app.studentPhoto ? <img src={app.studentPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <User size={20} className="m-auto mt-2 text-gray-400" />}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-gray-900">{app.studentName}</h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                              app.parentStatus === 'approved' ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50"
                            )}>
                              PH: {app.parentStatus === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </span>
                            <span className="text-[8px] text-gray-400 font-bold">{app.studentClass} • {app.studentSchool}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/student/${app.studentId}`)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <ChevronRight size={18} />
                        </button>
                        {app.finalStatus === 'pending' && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleApprove(app)}
                              className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-100 transition-all"
                              title="Duyệt"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => handleReject(app)}
                              className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center hover:bg-rose-100 transition-all"
                              title="Từ chối"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Users size={40} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400 font-bold text-sm">Chưa có ứng viên đăng ký</p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-components
const ShadowCard = ({ item, type, candidates, onUpdateStatus, onDelete, onViewCandidates }: any) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'ongoing': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      case 'closed': return 'text-red-600 bg-red-50';
      case 'active': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Sắp tới';
      case 'ongoing': return 'Đang diễn ra';
      case 'completed': return 'Đã kết thúc';
      case 'closed': return 'Đã đóng';
      case 'active': return 'Đang tuyển';
      default: return status;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm group hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg", getStatusColor(item?.status))}>
              {getStatusLabel(item?.status)}
            </span>
            {item?.level && (
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">
                {item?.level}
              </span>
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              {item?.type === '1-1' ? 'Kiến tập 1-1' : item?.type === 'workshop' ? 'Workshop' : 'Nhiệm vụ'}
            </span>
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-1 leading-tight">{item?.title || item?.name}</h3>
          <p className="text-sm font-bold text-gray-400">
            {item?.mentorName ? `Mentor: ${item?.mentorName}` : `Hạn: ${item?.durationDays} ngày`}
          </p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
          >
            <Edit2 size={18} />
          </button>
          
          <AnimatePresence>
            {showStatusMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 p-2"
              >
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-3 py-2 border-b border-gray-50">Đổi trạng thái</p>
                {(type === 'practical_tasks' ? ['active', 'closed'] : ['upcoming', 'ongoing', 'completed', 'closed']).map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      onUpdateStatus(s);
                      setShowStatusMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors flex items-center justify-between",
                      item?.status === s ? "bg-gray-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {getStatusLabel(s)}
                    {item?.status === s && <Check size={12} />}
                  </button>
                ))}
                <div className="h-px bg-gray-50 my-1" />
                <button 
                  onClick={() => {
                    onDelete();
                    setShowStatusMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} /> Xóa mục này
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
            <Users size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Ứng viên</p>
            <p className="text-xs font-black text-gray-900">{candidates?.length || 0}/{item?.slotsTotal || item?.maxStudents}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
            <Calendar size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Thời gian</p>
            <p className="text-xs font-black text-gray-900">{item?.date ? new Date(item.date).toLocaleDateString('vi-VN') : `${item?.durationDays} ngày`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
            <MapPin size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Địa điểm</p>
            <p className="text-xs font-black text-gray-900 truncate max-w-[100px]">{item?.location || item?.outputRequired}</p>
          </div>
        </div>
        <button 
          onClick={onViewCandidates}
          className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 rounded-2xl py-2 px-4 hover:bg-indigo-100 transition-all active:scale-95"
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Chi tiết</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ icon, text }: any) => (
  <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
      {icon}
    </div>
    <p className="text-gray-500 font-bold">{text}</p>
  </div>
);

const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl"
    >
      <div className="p-8 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X /></button>
      </div>
      <div className="p-8 max-h-[80vh] overflow-y-auto no-scrollbar">
        {children}
      </div>
    </motion.div>
  </div>
);

const Input = ({ label, type = "text", ...props }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type}
      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all"
      {...props}
      onChange={e => props.onChange(e.target.value)}
    />
  </div>
);

const Select = ({ label, value, onChange, options }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <select 
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all appearance-none"
    >
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default ManageShadowing;
