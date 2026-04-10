import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit2, Trash2, Users, Briefcase, MapPin, DollarSign, Clock, X, 
  CheckCircle2, User, ShieldCheck, ExternalLink, Sparkles, Loader2, 
  ClipboardList, Lightbulb, FileText as FileTextIcon, Calendar, 
  Video, Target, Award, ChevronRight, Info
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth, useFirebase } from './FirebaseProvider';
import { useNavigate } from 'react-router-dom';

type TabType = 'slots' | 'workshops' | 'tasks';

const ManageShadowing: React.FC = () => {
  const { profile } = useFirebase();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('slots');
  const [loading, setLoading] = useState(true);

  // Data states
  const [slots, setSlots] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // Modal states
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [showCreateWorkshop, setShowCreateWorkshop] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [newSlot, setNewSlot] = useState({
    title: '',
    description: '',
    mentorName: '',
    date: '',
    price: 0,
    slotsTotal: 1,
    location: 'Văn phòng công ty',
    category: 'Công nghệ',
  });

  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    price: 0,
    slotsTotal: 10,
    location: 'Online (Zoom/Meet)',
    skills: '',
  });

  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    daysToComplete: 7,
    outputRequired: '',
    skillsLearned: '',
    maxStudents: 5,
  });

  // Fetch data based on active tab
  useEffect(() => {
    if (!profile?.uid) return;

    setLoading(true);
    let collectionName = '';
    if (activeTab === 'slots') collectionName = 'shadowing_events';
    else if (activeTab === 'workshops') collectionName = 'shadowing_workshops';
    else collectionName = 'shadowing_tasks';

    const q = query(
      collection(db, collectionName),
      where('businessId', '==', profile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (activeTab === 'slots') setSlots(data);
      else if (activeTab === 'workshops') setWorkshops(data);
      else setTasks(data);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${activeTab}:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab, profile?.uid]);

  // Handlers
  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setActionLoading(true);
    try {
      await addDoc(collection(db, 'shadowing_events'), {
        ...newSlot,
        businessId: profile.uid,
        companyName: profile.businessName || profile.displayName,
        mentorId: profile.uid,
        slotsRemaining: newSlot.slotsTotal,
        createdAt: Date.now(),
        status: 'active'
      });
      setShowCreateSlot(false);
      setNewSlot({ title: '', description: '', mentorName: '', date: '', price: 0, slotsTotal: 1, location: 'Văn phòng công ty', category: 'Công nghệ' });
    } catch (error) {
      console.error("Error creating slot:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setActionLoading(true);
    try {
      await addDoc(collection(db, 'shadowing_workshops'), {
        ...newWorkshop,
        businessId: profile.uid,
        businessName: profile.businessName || profile.displayName,
        slotsRemaining: newWorkshop.slotsTotal,
        createdAt: Date.now(),
        status: 'active'
      });
      setShowCreateWorkshop(false);
      setNewWorkshop({ title: '', description: '', date: '', time: '', price: 0, slotsTotal: 10, location: 'Online (Zoom/Meet)', skills: '' });
    } catch (error) {
      console.error("Error creating workshop:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setActionLoading(true);
    try {
      await addDoc(collection(db, 'shadowing_tasks'), {
        ...newTask,
        businessId: profile.uid,
        businessName: profile.businessName || profile.displayName,
        createdAt: Date.now(),
        status: 'active'
      });
      setShowCreateTask(false);
      setNewTask({ name: '', description: '', daysToComplete: 7, outputRequired: '', skillsLearned: '', maxStudents: 5 });
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (id: string, collectionName: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa mục này?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Section */}
      <div className="bg-white p-6 pb-0 rounded-b-[40px] shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award size={14} className="text-[#DB2777]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Chương trình</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-gray-900">Quản lý Kiến tập</h1>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'slots') setShowCreateSlot(true);
              else if (activeTab === 'workshops') setShowCreateWorkshop(true);
              else setShowCreateTask(true);
            }}
            className="w-12 h-12 bg-[#DB2777] text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-200 hover:bg-[#BE185D] transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 mt-6">
          {[
            { id: 'slots', label: 'Suất 1-1', icon: <User size={16} /> },
            { id: 'workshops', label: 'Workshop Nhóm', icon: <Video size={16} /> },
            { id: 'tasks', label: 'Nhiệm vụ', icon: <Target size={16} /> },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative flex items-center gap-2 ${
                activeTab === tab.id ? 'text-[#DB2777]' : 'text-gray-400 hover:text-gray-600'
              }`}
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

      <div className="p-6">
        {/* Info Banner */}
        <div className="mb-8 bg-indigo-50 border border-indigo-100 rounded-[32px] p-6 flex gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Info size={24} />
          </div>
          <div>
            <h4 className="font-black text-indigo-900 mb-1">
              {activeTab === 'slots' && "Kiến tập 1-1: Dành cho học sinh muốn trải nghiệm sâu."}
              {activeTab === 'workshops' && "Workshop Nhóm: Chia sẻ kiến thức cho nhiều học sinh."}
              {activeTab === 'tasks' && "Nhiệm vụ: Giao việc cụ thể để học sinh thực hành."}
            </h4>
            <p className="text-indigo-800/70 text-sm font-medium leading-relaxed">
              {activeTab === 'slots' && "Hãy chọn Mentor có tâm và thời gian phù hợp để hướng dẫn các bạn nhỏ."}
              {activeTab === 'workshops' && "Tổ chức các buổi Zoom hoặc gặp mặt trực tiếp để truyền cảm hứng nghề nghiệp."}
              {activeTab === 'tasks' && "Học sinh hoàn thành nhiệm vụ sẽ nhận được chứng nhận từ doanh nghiệp của bạn."}
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
                    title={slot.title} 
                    subtitle={`Mentor: ${slot.mentorName}`}
                    info1={`${slot.slotsRemaining}/${slot.slotsTotal} chỗ`}
                    info2={slot.location}
                    onDelete={() => handleDeleteItem(slot.id, 'shadowing_events')}
                  />
                )) : <EmptyState icon={<User size={48} />} text="Chưa có suất kiến tập 1-1 nào" />
              )}

              {activeTab === 'workshops' && (
                workshops.length > 0 ? workshops.map(ws => (
                  <ShadowCard 
                    key={ws.id} 
                    title={ws.title} 
                    subtitle={ws.date}
                    info1={`${ws.slotsRemaining}/${ws.slotsTotal} người`}
                    info2={ws.location}
                    onDelete={() => handleDeleteItem(ws.id, 'shadowing_workshops')}
                  />
                )) : <EmptyState icon={<Video size={48} />} text="Chưa có workshop nhóm nào" />
              )}

              {activeTab === 'tasks' && (
                tasks.length > 0 ? tasks.map(task => (
                  <ShadowCard 
                    key={task.id} 
                    title={task.name} 
                    subtitle={`Hạn: ${task.daysToComplete} ngày`}
                    info1={`Max: ${task.maxStudents} HS`}
                    info2={`Output: ${task.outputRequired}`}
                    onDelete={() => handleDeleteItem(task.id, 'shadowing_tasks')}
                  />
                )) : <EmptyState icon={<Target size={48} />} text="Chưa có nhiệm vụ nào" />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateSlot && (
          <Modal title="Tạo suất Kiến tập 1-1" onClose={() => setShowCreateSlot(false)}>
            <form onSubmit={handleCreateSlot} className="space-y-4">
              <Input label="Tiêu đề" value={newSlot.title} onChange={v => setNewSlot({...newSlot, title: v})} placeholder="VD: Một ngày làm Designer" />
              <Input label="Tên Mentor" value={newSlot.mentorName} onChange={v => setNewSlot({...newSlot, mentorName: v})} placeholder="VD: Nguyễn Văn A" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Ngày diễn ra" type="date" value={newSlot.date} onChange={v => setNewSlot({...newSlot, date: v})} />
                <Input label="Số chỗ" type="number" value={newSlot.slotsTotal} onChange={v => setNewSlot({...newSlot, slotsTotal: parseInt(v)})} />
              </div>
              <Input label="Địa điểm" value={newSlot.location} onChange={v => setNewSlot({...newSlot, location: v})} />
              <button disabled={actionLoading} className="w-full py-4 bg-[#DB2777] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-pink-100 mt-4">
                {actionLoading ? <Loader2 className="animate-spin mx-auto" /> : "Đăng suất kiến tập"}
              </button>
            </form>
          </Modal>
        )}

        {showCreateWorkshop && (
          <Modal title="Tạo Workshop Nhóm" onClose={() => setShowCreateWorkshop(false)}>
            <form onSubmit={handleCreateWorkshop} className="space-y-4">
              <Input label="Tên Workshop" value={newWorkshop.title} onChange={v => setNewWorkshop({...newWorkshop, title: v})} placeholder="VD: Kỹ năng giao tiếp trong công việc" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Ngày" type="date" value={newWorkshop.date} onChange={v => setNewWorkshop({...newWorkshop, date: v})} />
                <Input label="Giờ" type="time" value={newWorkshop.time} onChange={v => setNewWorkshop({...newWorkshop, time: v})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Số lượng" type="number" value={newWorkshop.slotsTotal} onChange={v => setNewWorkshop({...newWorkshop, slotsTotal: parseInt(v)})} />
                <Input label="Phí (VNĐ)" type="number" value={newWorkshop.price} onChange={v => setNewWorkshop({...newWorkshop, price: parseInt(v)})} />
              </div>
              <Input label="Địa điểm/Link" value={newWorkshop.location} onChange={v => setNewWorkshop({...newWorkshop, location: v})} />
              <button disabled={actionLoading} className="w-full py-4 bg-[#DB2777] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-pink-100 mt-4">
                {actionLoading ? <Loader2 className="animate-spin mx-auto" /> : "Đăng Workshop"}
              </button>
            </form>
          </Modal>
        )}

        {showCreateTask && (
          <Modal title="Tạo Nhiệm vụ Thực hành" onClose={() => setShowCreateTask(false)}>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <Input label="Tên nhiệm vụ" value={newTask.name} onChange={v => setNewTask({...newTask, name: v})} placeholder="VD: Thiết kế logo cho dự án mới" />
              <textarea 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="Mô tả chi tiết nhiệm vụ..."
                rows={3}
                value={newTask.description}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Hạn (ngày)" type="number" value={newTask.daysToComplete} onChange={v => setNewTask({...newTask, daysToComplete: parseInt(v)})} />
                <Input label="Số HS tối đa" type="number" value={newTask.maxStudents} onChange={v => setNewTask({...newTask, maxStudents: parseInt(v)})} />
              </div>
              <Input label="Output yêu cầu" value={newTask.outputRequired} onChange={v => setNewTask({...newTask, outputRequired: v})} placeholder="VD: File PDF báo cáo" />
              <Input label="Kỹ năng đạt được" value={newTask.skillsLearned} onChange={v => setNewTask({...newTask, skillsLearned: v})} placeholder="VD: Photoshop, Tư duy sáng tạo" />
              <button disabled={actionLoading} className="w-full py-4 bg-[#DB2777] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-pink-100 mt-4">
                {actionLoading ? <Loader2 className="animate-spin mx-auto" /> : "Tạo nhiệm vụ"}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-components
const ShadowCard = ({ title, subtitle, info1, info2, onDelete }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex justify-between items-center group"
  >
    <div className="flex-1">
      <h3 className="text-lg font-black text-gray-900 mb-1">{title}</h3>
      <p className="text-sm font-bold text-gray-400 mb-3">{subtitle}</p>
      <div className="flex gap-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">{info1}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{info2}</span>
      </div>
    </div>
    <div className="flex gap-2">
      <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
        <Edit2 size={18} />
      </button>
      <button onClick={onDelete} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all">
        <Trash2 size={18} />
      </button>
    </div>
  </motion.div>
);

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
      className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl"
    >
      <div className="p-8 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X /></button>
      </div>
      <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
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

export default ManageShadowing;
