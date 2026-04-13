import { ReactNode, useState, useEffect } from 'react';
import { Home, Briefcase, GraduationCap, MessageSquare, User, Heart, ShieldCheck, Bell, Search, Menu, X, LogOut, Settings, HelpCircle, Star, Info, PieChart, Calendar, Check, Rocket, Scale, BookOpen, AlertTriangle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useFirebase } from './FirebaseProvider';
import { auth, db } from './FirebaseProvider';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import SearchOverlay from './SearchOverlay';
import Clock from './Clock';
import OnboardingTutorial from './OnboardingTutorial';
import AppRatingWidget from './AppRatingWidget';
import MarketSurveyModal from './MarketSurveyModal';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile, switchRole, t } = useFirebase();
  const BOSS_EMAIL = "congapro60@gmail.com";
  const ADMIN_EMAILS = [
    BOSS_EMAIL.toLowerCase(),
    "cuong.vuviet@thedeweyschools.edu.vn".toLowerCase(),
    "vuvietcuonglmnx@gmail.com".toLowerCase()
  ];
  const userEmailLower = profile?.email?.toLowerCase();
  const isBoss = userEmailLower === BOSS_EMAIL.toLowerCase();
  const isAdmin = (profile?.role === 'admin' && profile?.isVerified) || (userEmailLower && ADMIN_EMAILS.includes(userEmailLower)) || isBoss;
  const userRole = profile?.role || 'student';
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [ads, setAds] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [marketTrends, setMarketTrends] = useState<any>({ topSkills: [], popularSalary: '' });
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('open-global-search', handleOpenSearch);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-global-search', handleOpenSearch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!profile || profile.uid === 'demo-user') {
      setUnreadNotifications(0);
      setUnreadMessages(0);
      return;
    }
    
    // Unread notifications
    const notifsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', profile.uid),
      where('read', '==', false)
    );
    
    const unsubNotifs = onSnapshot(notifsQuery, (snapshot) => {
      setUnreadNotifications(snapshot.size);
    }, (error) => {
      console.error("Error fetching unread notifications:", error);
    });

    // Unread messages - simple check for chats where user is participant
    // In a real app, we'd have an unreadCount per participant in the chat doc
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', profile.uid)
    );

    const unsubChats = onSnapshot(chatsQuery, (snapshot) => {
      // For now, we'll just count chats that have a lastMessageAt newer than some local "last seen" 
      // or if we had a proper unread field. Since we don't have a robust unread system yet,
      // we'll just keep it at 0 or implement a basic version if needed.
      // But let's at least ensure it's managed.
      setUnreadMessages(0); 
    });

    return () => {
      unsubNotifs();
      unsubChats();
    };
  }, [profile]);

  useEffect(() => {
    // Fetch ads for sidebar
    const qAds = query(collection(db, 'advertisements'), where('status', '==', 'approved'));
    const unsubAds = onSnapshot(qAds, (snapshot) => {
      if (!snapshot.empty) {
        setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setAds([
          { id: 'ad1', title: 'Khóa học TeenTask Pro', businessName: 'teentask.edu.vn', imageUrl: 'https://picsum.photos/seed/edu/200/200' },
          { id: 'ad2', title: 'Ưu đãi trà sữa 50%', businessName: 'gongcha.com.vn', imageUrl: 'https://picsum.photos/seed/milk/200/200' },
          { id: 'ad3', title: 'Vé xem phim 1k', businessName: 'cgv.vn', imageUrl: 'https://picsum.photos/seed/movie/200/200' },
        ]);
      }
    });

    // Fetch market trends for sidebar (Real-time from surveys)
    const qSurveys = collection(db, 'market_surveys');
    const unsubTrends = onSnapshot(qSurveys, (snapshot) => {
      if (!snapshot.empty) {
        const skillsCount: Record<string, number> = {};
        const salaryCount: Record<string, number> = {};

        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.desiredSkill) {
            skillsCount[data.desiredSkill] = (skillsCount[data.desiredSkill] || 0) + 1;
          }
          if (data.expectedSalary) {
            salaryCount[data.expectedSalary] = (salaryCount[data.expectedSalary] || 0) + 1;
          }
        });

        const topSkills = Object.entries(skillsCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        let popularSalary = '';
        let maxSalaryCount = 0;
        Object.entries(salaryCount).forEach(([salary, count]) => {
          if (count > maxSalaryCount) {
            maxSalaryCount = count;
            popularSalary = salary;
          }
        });

        setMarketTrends({ topSkills, popularSalary });
      } else {
        setMarketTrends({
          topSkills: [
            { name: 'Thiết kế đồ họa', count: 1250 },
            { name: 'Video Editing', count: 980 },
            { name: 'Content Writing', count: 850 }
          ],
          popularSalary: '25.000đ - 35.000đ/h'
        });
      }
    }, (error) => console.error("Error fetching market trends:", error));

    // Fetch events
    const qEvents = query(collection(db, 'events'), where('status', '==', 'active'), limit(3));
    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      if (!snapshot.empty) {
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setEvents([
          { id: '1', title: 'Workshop Design', date: Date.now() + 86400000 * 2, location: 'Online', time: '19:00' },
          { id: '2', title: 'Job Shadowing Day', date: Date.now() + 86400000 * 5, location: 'FPT Software', time: '08:00' }
        ]);
      }
    }, (error) => console.error("Error fetching events:", error));

    return () => {
      unsubAds();
      unsubTrends();
      unsubEvents();
    };
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000); // Change ad every 5 seconds
    return () => clearInterval(interval);
  }, [ads]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSwitchRole = async (role: string) => {
    if (!profile) return;

    // Handle Demo Mode
    if (profile.uid === 'demo-user') {
      localStorage.setItem('demoRole', role);
      window.location.reload();
      return;
    }

    // Only Boss can switch to admin
    if (role === 'admin' && !isBoss) return;
    
    try {
      await switchRole(role as any);
      setIsRoleSwitcherOpen(false);
    } catch (error: any) {
      alert(error.message);
      console.error("Error switching role:", error);
    }
  };

  const mainNavItems = [
    { id: 'nav-home', icon: Home, label: t('home'), path: '/' },
    { id: 'nav-messages', icon: MessageSquare, label: t('messages'), path: '/messages', badge: unreadMessages > 0 ? unreadMessages : undefined },
    { id: 'nav-notifications', icon: Bell, label: t('notifications'), path: '/notifications', badge: unreadNotifications > 0 ? unreadNotifications : undefined },
    { id: 'nav-career', icon: BookOpen, label: 'Kiến thức', path: '/career-insights' },
    { id: 'nav-edu-network', icon: Globe, label: 'Edu Network', path: '/edu-network', isNew: true },
    { id: 'nav-legal', icon: Scale, label: t('legalSafety'), path: '/legal' },
    { id: 'nav-about', icon: Info, label: t('aboutProject'), path: '/about' },
  ];

  const roleSpecificItems = {
    admin: [
      { id: 'nav-surveys', icon: PieChart, label: t('viewSurveys'), path: '/admin/surveys' },
      { id: 'nav-admin', icon: ShieldCheck, label: t('admin'), path: '/admin' },
    ],
    boss: [
      { id: 'nav-boss-manage', icon: Settings, label: t('manage'), path: '/boss-manage' },
      { id: 'nav-surveys', icon: PieChart, label: t('viewSurveys'), path: '/admin/surveys' },
      { id: 'nav-admin', icon: ShieldCheck, label: t('admin'), path: '/admin' },
    ],
    business: [
      { id: 'nav-jobs-manage', icon: Briefcase, label: t('manageJobs'), path: '/jobs-manage' },
      { id: 'nav-shadowing-manage', icon: GraduationCap, label: t('manageShadowing'), path: '/shadowing-manage' },
    ],
    parent: [
      { id: 'nav-monitoring', icon: ShieldCheck, label: t('monitoring'), path: '/monitoring' },
      { id: 'nav-jobs-manage', icon: Briefcase, label: t('manageJobs'), path: '/jobs-manage' },
      ...(profile?.isMentor ? [{ id: 'nav-shadowing-manage', icon: GraduationCap, label: t('manageShadowing'), path: '/shadowing-manage' }] : []),
    ],
    student: [
      { id: 'nav-mentors', icon: GraduationCap, label: 'Tìm Mentor', path: '/mentors', isNew: true },
      { id: 'nav-saved', icon: Heart, label: t('saved'), path: '/saved' },
    ]
  };

  const currentRoleItems = (isBoss && userRole === 'admin')
    ? roleSpecificItems.boss
    : isAdmin
      ? [...(userRole !== 'admin' ? (roleSpecificItems[userRole as keyof typeof roleSpecificItems] || []) : []), ...roleSpecificItems.admin]
      : (userRole !== 'admin' ? (roleSpecificItems[userRole as keyof typeof roleSpecificItems] || []) : []);

  const allNavItems = [...mainNavItems, ...currentRoleItems];

  const RightSidebarWidgets = () => (
    <div className="space-y-6">
      <AppRatingWidget />

      {/* Trending / Horoscope Widget */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Xu hướng Gen Z</h3>
          <Rocket size={16} className="text-orange-500" />
        </div>
        <div className="space-y-4">
          {marketTrends.topSkills.slice(0, 3).map((skill: any, i: number) => (
            <div key={i} className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-100 transition-colors">
                <span className="text-xs font-black">{i + 1}</span>
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors">{skill.name}</p>
                <p className="text-[10px] text-gray-400 font-bold">{skill.count} quan tâm</p>
              </div>
            </div>
          ))}
          
          {marketTrends.popularSalary && (
            <div className="pt-4 border-t border-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lương kỳ vọng</p>
              <p className="text-sm font-black text-green-600">{marketTrends.popularSalary}</p>
            </div>
          )}
        </div>
        <button className="w-full mt-6 py-3 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all">
          Xem chi tiết xu hướng
        </button>
      </div>

      {/* Calendar Widget */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Lịch sự kiện</h3>
          <Calendar size={16} className="text-indigo-600" />
        </div>
        <div className="space-y-4">
          {events.length > 0 ? events.map((event, i) => {
            const eventDate = new Date(event.date);
            const month = eventDate.getMonth() + 1;
            const day = eventDate.getDate();
            return (
              <div key={event.id || i} className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 ${i % 2 === 0 ? 'bg-indigo-600' : 'bg-amber-500'}`}>
                  <span className="text-[10px] font-black uppercase">Th{month}</span>
                  <span className="text-lg font-black leading-none">{day}</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">{event.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold">{event.location} • {event.time || '08:00'}</p>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-4 text-gray-500 text-sm">Chưa có sự kiện nào</div>
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="px-4 flex flex-wrap gap-x-4 gap-y-2">
        {['Quyền riêng tư', 'Điều khoản', 'Quảng cáo', 'Lựa chọn quảng cáo', 'Cookies', 'Xem thêm', 'TeenTask © 2026'].map((link, i) => (
          <span key={i} className="text-[10px] font-bold text-gray-400 hover:underline cursor-pointer">
            {link}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      {/* HEADER CHÍNH - Phong cách Facebook */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-[60] px-2 sm:px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div 
            onClick={() => navigate('/')}
            className="w-9 h-9 bg-[#1877F2] rounded-full flex items-center justify-center shadow-md cursor-pointer"
          >
            <GraduationCap size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h1 
              onClick={() => navigate('/')}
              className="text-xl font-black tracking-tighter text-[#1877F2] hidden sm:block cursor-pointer leading-none"
            >
              TEENTASK
            </h1>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest hidden lg:block">Học viện Kỹ năng Thực chiến</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 mx-2 sm:mx-4 flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 bg-[#F0F2F5] hover:bg-gray-200 rounded-full py-2 px-3 sm:px-4 flex items-center gap-2 sm:gap-3 text-gray-500 transition-all text-xs sm:text-sm group truncate"
          >
            <Search size={16} className="group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden md:inline truncate">{t('searchOnTeenTask')}</span>
            <span className="md:hidden inline truncate">{t('search')}...</span>
          </button>
          <div className="hidden lg:block shrink-0">
            <Clock />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {!profile ? (
            <button 
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-gradient-to-r from-[#1877F2] to-[#4F46E5] text-white rounded-full text-xs sm:text-sm font-black uppercase tracking-widest hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 border border-white/20"
            >
              <LogOut size={16} className="rotate-180" />
              <span>Đăng nhập</span>
            </button>
          ) : (
            <>
              <div className="relative">
                <button 
                  onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest mr-2 transition-all",
                    isBoss 
                      ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                      : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                  )}
                >
                  {isBoss ? "Boss" : "Vai trò"}: {userRole}
                  <Settings size={10} className={cn("transition-transform", isRoleSwitcherOpen && "rotate-90")} />
                </button>
                
                <AnimatePresence>
                  {isRoleSwitcherOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 z-[70] overflow-hidden p-1"
                    >
                      <div className="px-3 py-2 text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Đổi vai trò trải nghiệm</div>
                      {[
                        { id: 'student', label: 'Học sinh', color: 'text-blue-600' },
                        { id: 'parent', label: 'Phụ huynh', color: 'text-green-600' },
                        { id: 'business', label: 'Doanh nghiệp', color: 'text-purple-600' },
                        { id: 'admin', label: 'Quản trị viên', color: 'text-indigo-600', bossOnly: true },
                      ].filter(r => {
                        if (isBoss) return true;
                        if (r.bossOnly) return false;
                        // Student cannot switch to parent or business
                        if (userRole === 'student') return r.id === 'student';
                        // Parent and Business cannot switch to student
                        if (userRole === 'parent' || userRole === 'business') return r.id !== 'student';
                        return true;
                      }).map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleSwitchRole(r.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors flex items-center justify-between",
                            userRole === r.id ? "bg-gray-50 " + r.color : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          {r.label}
                          {userRole === r.id && <Check size={12} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {profile?.role === 'admin' && !isBoss && (
                <div className="hidden lg:flex items-center gap-1 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mr-2">
                  Admin
                </div>
              )}
              
              {profile?.isVip && (
                <div className="hidden lg:flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-600 text-[10px] font-black uppercase tracking-widest mr-2">
                  <Star size={12} fill="currentColor" />
                  VIP Member
                </div>
              )}
              
              <div className="hidden md:flex items-center gap-2">
                <button 
                  onClick={() => navigate('/search-users')}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all relative group"
                  title="Tìm kiếm người dùng"
                >
                  <Search size={20} />
                </button>
              </div>

              <button 
                onClick={() => navigate('/wallet')}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all relative group"
                title="Ví của tôi"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              </button>

              <button 
                id="user-profile-btn"
                onClick={() => navigate('/profile')}
                className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-transparent hover:border-gray-300 transition-all relative"
              >
                {userRole === 'business' && profile?.businessLogo ? (
                  <img src={profile.businessLogo} alt="Business Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={24} className="text-gray-500 m-auto" />
                )}
                {profile?.isVip && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Star size={8} className="text-white" fill="currentColor" />
                  </div>
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Thông báo hoàn thiện hồ sơ doanh nghiệp */}
      {userRole === 'business' && !profile?.businessName && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold">
            <AlertTriangle size={14} />
            <span>Bạn chưa hoàn thiện thông tin doanh nghiệp. Hãy cập nhật để tăng uy tín!</span>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 underline"
          >
            Cập nhật ngay
          </button>
        </div>
      )}

      {/* THANH ĐIỀU HƯỚNG TABS - Desktop & Mobile */}
      <nav className="bg-white border-b border-gray-200 sticky top-14 z-50 flex justify-center px-2 sm:px-4">
        <div className="flex w-full max-w-3xl justify-between">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              id={item.id}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex-1 flex flex-col items-center justify-center py-2 border-b-4 transition-all relative",
                  isActive 
                    ? "border-[#1877F2] text-[#1877F2]" 
                    : "border-transparent text-gray-500 hover:bg-gray-50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold mt-1 hidden sm:block">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-2 border-b-4 border-transparent text-gray-500 hover:bg-gray-50"
          >
            <Menu size={26} />
            <span className="text-[10px] font-bold mt-1 hidden sm:block">Menu</span>
          </button>
        </div>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MarketSurveyModal />

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <div className="flex-1 flex justify-center py-4 px-0 sm:px-4">
        <div className="w-full max-w-[1360px] flex gap-0 lg:gap-6 justify-center">
          {/* SIDEBAR TRÁI - Chỉ hiện trên Desktop */}
          <aside className="hidden lg:block w-[260px] xl:w-[280px] shrink-0 sticky top-32 h-fit space-y-2">
            <NavLink to="/profile" className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-xl transition-colors relative group">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 relative">
                {userRole === 'business' && profile?.businessLogo ? (
                  <img src={profile.businessLogo} alt="Business Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={20} className="text-gray-500 m-auto mt-2" />
                )}
                {profile?.isVip && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Star size={8} className="text-white" fill="currentColor" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">
                  {userRole === 'business' ? (profile?.businessName || 'Doanh nghiệp chưa đặt tên') : (profile?.displayName || 'Người dùng')}
                </span>
                {profile?.isVip && (
                  <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">VIP Member</span>
                )}
              </div>
            </NavLink>
            {allNavItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path}
                className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <item.icon size={24} className="text-[#1877F2]" />
                <span className="font-bold text-sm">{item.label}</span>
                {(item as any).isNew && (
                  <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto">
                    NEW
                  </span>
                )}
              </NavLink>
            ))}
            
            {/* Sponsored Section - Looping Ads */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mt-4 overflow-hidden">
              <h3 className="font-bold text-gray-500 mb-4 px-2 uppercase text-[10px] tracking-widest">Được tài trợ</h3>
              <div className="relative h-24">
                <AnimatePresence mode="wait">
                  {ads.length > 0 && (
                    <motion.div
                      key={ads[currentAdIndex].id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-2xl cursor-pointer group transition-all absolute inset-0"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img 
                          src={ads[currentAdIndex].imageUrl} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-gray-900 leading-tight truncate">{ads[currentAdIndex].title}</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 truncate">{ads[currentAdIndex].businessName}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </aside>

          {/* FEED CHÍNH - Hiển thị nội dung các trang */}
          <main className="flex-1 min-w-0 w-full max-w-[720px] px-2 sm:px-0">
            {children}
            
            {/* Widgets cho Mobile (hiện ở cuối feed) */}
            <div className="xl:hidden mt-8 mb-20 px-2">
              <RightSidebarWidgets />
            </div>
          </main>

          {/* SIDEBAR PHẢI - Chỉ hiện trên Desktop lớn */}
          <aside className="hidden xl:block w-[260px] xl:w-[280px] shrink-0 sticky top-32 h-fit space-y-6">
            <RightSidebarWidgets />
          </aside>
        </div>
      </div>

      <OnboardingTutorial />

      {/* MENU OVERLAY - Khi bấm vào nút Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#F0F2F5] shadow-2xl z-[101] overflow-y-auto"
            >
              <div className="p-4 flex items-center justify-between sticky top-0 bg-[#F0F2F5] z-10">
                <h2 className="text-2xl font-bold">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <NavLink to="/profile" onClick={() => setIsMenuOpen(false)} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors relative overflow-hidden">
                  {profile?.email === "congapro60@gmail.com" ? (
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                      <div className="absolute top-2 right-[-20px] w-24 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest text-center py-1 rotate-45 shadow-sm">
                        BOSS
                      </div>
                    </div>
                  ) : profile?.role === 'admin' ? (
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                      <div className="absolute top-2 right-[-20px] w-24 bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest text-center py-1 rotate-45 shadow-sm">
                        ADMIN
                      </div>
                    </div>
                  ) : profile?.isVip && (
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                      <div className="absolute top-2 right-[-20px] w-24 bg-amber-400 text-white text-[8px] font-black uppercase tracking-widest text-center py-1 rotate-45 shadow-sm">
                        VIP
                      </div>
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-100 relative">
                    {userRole === 'business' && profile?.businessLogo ? (
                      <img src={profile.businessLogo} alt="Business Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={28} className="text-gray-500 m-auto mt-2" />
                    )}
                    {profile?.isVip && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Star size={10} className="text-white" fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {userRole === 'business' ? (profile?.businessName || 'Doanh nghiệp chưa đặt tên') : (profile?.displayName || 'Người dùng')}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Xem trang cá nhân của bạn</p>
                  </div>
                </NavLink>

                <div className="grid grid-cols-2 gap-3">
                  {allNavItems.map((item) => (
                    <NavLink 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-2 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 relative"
                    >
                      <div className="w-10 h-10 bg-[#E7F3FF] rounded-full flex items-center justify-center">
                        <item.icon size={24} className="text-[#1877F2]" />
                      </div>
                      <span className="font-bold text-sm text-gray-700">{item.label}</span>
                      {(item as any).isNew && (
                        <span className="absolute top-3 right-3 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                      <Settings size={20} />
                    </div>
                    <span className="font-bold text-sm flex-1 text-left text-gray-700">{t('settingsPrivacy')}</span>
                  </button>
                  <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                      <HelpCircle size={20} />
                    </div>
                    <span className="font-bold text-sm flex-1 text-left text-gray-700">{t('helpSupport')}</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full p-4 flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600"
                  >
                    <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                      <LogOut size={20} />
                    </div>
                    <span className="font-bold text-sm flex-1 text-left">{t('logout')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
