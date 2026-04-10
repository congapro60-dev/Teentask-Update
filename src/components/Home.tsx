import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, TrendingUp, Star, Zap, Clock, CheckCircle2, ChevronRight, ChevronLeft, Briefcase, GraduationCap, Building2, Users, Award, Rocket, Sparkles, MessageSquare, Heart } from 'lucide-react';
import { useFirebase, handleFirestoreError, OperationType } from './FirebaseProvider';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, limit, addDoc, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { db, auth } from './FirebaseProvider';
import { cn } from '../lib/utils';
import { Advertisement, Job, ShadowingEvent, Course } from '../types';
import JobDetail from './JobDetail';
import ShadowingDetail from './ShadowingDetail';
import { MOCK_JOBS, MOCK_SHADOWING } from '../mockData';
import ParentVerificationModal from './ParentVerificationModal';
import VipAdsSlider from './VipAdsSlider';

export default function Home() {
  const { profile, toggleSaveJob, toggleSaveShadowing, toggleSaveCourse, t } = useFirebase();
  const navigate = useNavigate();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [shadowingEvents, setShadowingEvents] = useState<ShadowingEvent[]>([]);
  
  const [featuredUsers, setFeaturedUsers] = useState<any[]>([]);
  
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [selectedShadowing, setSelectedShadowing] = useState<any>(null);
  const [isShadowingDetailOpen, setIsShadowingDetailOpen] = useState(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);

  // New states for stats
  const [surveyStats, setSurveyStats] = useState({ total: 0, satisfiedRate: 0, npsRate: 0 });

  useEffect(() => {
    const qAds = query(collection(db, 'advertisements'), where('status', '==', 'approved'), limit(10));
    const unsubAds = onSnapshot(qAds, (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advertisement)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'advertisements'));

    const qCourses = query(collection(db, 'courses'), where('status', '==', 'active'), limit(10));
    const unsubCourses = onSnapshot(qCourses, (snapshot) => {
      if (!snapshot.empty) {
        setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
      } else {
        // Mock courses if none in DB
        setCourses([
          { id: 'c1', title: 'Kỹ năng giao tiếp đỉnh cao', provider: 'TeenTask Academy', imageUrl: 'https://picsum.photos/seed/course1/400/250', price: 299000, registeredCount: 45, totalSlots: 100, status: 'active', createdAt: Date.now() },
          { id: 'c2', title: 'Lập trình Python cơ bản', provider: 'FPT Software', imageUrl: 'https://picsum.photos/seed/course2/400/250', price: 500000, registeredCount: 80, totalSlots: 80, status: 'active', createdAt: Date.now() },
          { id: 'c3', title: 'Thiết kế đồ họa với Canva', provider: 'Design Hub', imageUrl: 'https://picsum.photos/seed/course3/400/250', price: 0, registeredCount: 120, totalSlots: 200, status: 'active', createdAt: Date.now() },
        ]);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'courses'));

    const qJobs = query(collection(db, 'jobs'), where('status', '==', 'active'), limit(10));
    const unsubJobs = onSnapshot(qJobs, (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'jobs'));

    const qShadowing = query(collection(db, 'shadowing_events'), limit(10));
    const unsubShadowing = onSnapshot(qShadowing, (snapshot) => {
      if (!snapshot.empty) {
        setShadowingEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      } else {
        setShadowingEvents(MOCK_SHADOWING as any);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'shadowing_events'));

    // Fetch Survey Stats
    const fetchSurveyStats = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'survey_responses'));
        if (!snapshot.empty) {
          const total = snapshot.size;
          let satisfied = 0;
          let promoters = 0;
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.easeOfUse >= 4) satisfied++;
            if (data.recommendScore >= 8) promoters++;
          });
          setSurveyStats({
            total,
            satisfiedRate: Math.round((satisfied / total) * 100),
            npsRate: Math.round((promoters / total) * 100)
          });
        }
      } catch (error) {
        console.error("Error fetching survey stats:", error);
      }
    };

    // Fetch Featured Users (Parents/Businesses)
    const fetchFeaturedUsers = async () => {
      try {
        const q = query(
          collection(db, 'users'), 
          where('role', 'in', ['parent', 'business']),
          limit(10)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setFeaturedUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          // Fallback to demo names as requested
          setFeaturedUsers([
            { id: 1, displayName: 'Mr. A', bio: 'Giám đốc Marketing', photoURL: 'https://i.pravatar.cc/150?u=mra', role: 'business' },
            { id: 2, displayName: 'Mrs. B', bio: 'Phụ huynh học sinh', photoURL: 'https://i.pravatar.cc/150?u=mrsb', role: 'parent' },
            { id: 3, displayName: 'Mr. C', bio: 'Chủ doanh nghiệp F&B', photoURL: 'https://i.pravatar.cc/150?u=mrc', role: 'business' },
            { id: 4, displayName: 'Mrs. D', bio: 'Chuyên gia tâm lý', photoURL: 'https://i.pravatar.cc/150?u=mrsd', role: 'parent' },
            { id: 5, displayName: 'Mr. E', bio: 'Kỹ sư phần mềm', photoURL: 'https://i.pravatar.cc/150?u=mre', role: 'business' },
          ]);
        }
      } catch (error) {
        console.error("Error fetching featured users:", error);
      }
    };

    // Seed Courses if empty (Boss only)
    const seedCourses = async () => {
      if (auth.currentUser?.email !== 'congapro60@gmail.com') return;
      try {
        const snapshot = await getDocs(collection(db, 'courses'));
        if (snapshot.empty) {
          const initialCourses = [
            { title: 'Kỹ năng giao tiếp đỉnh cao', provider: 'TeenTask Academy', imageUrl: 'https://picsum.photos/seed/course1/400/250', price: 299000, registeredCount: 45, totalSlots: 100, status: 'active', createdAt: Date.now() },
            { title: 'Lập trình Python cơ bản', provider: 'FPT Software', imageUrl: 'https://picsum.photos/seed/course2/400/250', price: 500000, registeredCount: 80, totalSlots: 80, status: 'active', createdAt: Date.now() },
            { title: 'Thiết kế đồ họa với Canva', provider: 'Design Hub', imageUrl: 'https://picsum.photos/seed/course3/400/250', price: 0, registeredCount: 120, totalSlots: 200, status: 'active', createdAt: Date.now() },
          ];
          for (const course of initialCourses) {
            await addDoc(collection(db, 'courses'), course);
          }
          console.log("Courses seeded successfully");
        }
      } catch (error) {
        console.error("Error seeding courses:", error);
      }
    };
    fetchSurveyStats();
    fetchFeaturedUsers();
    seedCourses();

    return () => {
      unsubAds();
      unsubCourses();
      unsubJobs();
      unsubShadowing();
    };
  }, []);

  const handleJobClick = (job: any) => {
    // Ensure job has all fields needed for detail view
    const fullJob = {
      ...job,
      company: job.companyName || job.company,
      logo: job.businessLogo || job.logo,
      jobStatus: job.status === 'active' ? 'Active' : (job.jobStatus || 'Active'),
      responsibilities: job.responsibilities || [job.description],
      qualifications: job.qualifications || [],
      benefits: job.benefits || []
    };
    setSelectedJob(fullJob);
    setIsJobDetailOpen(true);
  };

  const handleShadowingClick = (event: any) => {
    setSelectedShadowing(event);
    setIsShadowingDetailOpen(true);
  };

  const handleApplyJob = async (job: any) => {
    if (!profile) {
      navigate('/profile');
      return;
    }

    if (profile.role === 'student' && profile.parentEmail && profile.parentalVerification !== 'verified') {
      setIsParentModalOpen(true);
      return;
    }

    try {
      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        businessId: job.businessId,
        studentId: auth.currentUser?.uid,
        studentName: profile.displayName,
        studentPhoto: profile.photoURL,
        parentEmail: profile.parentEmail || null,
        parentStatus: profile.parentEmail ? 'pending' : 'approved',
        finalStatus: 'pending',
        createdAt: Date.now()
      });
      // Use a custom notification or just translate the alert for now
      alert(t('applySuccess'));
      setIsJobDetailOpen(false);
    } catch (error) {
      console.error("Error applying:", error);
    }
  };

  const handleChat = async (item: any, type: 'job' | 'shadowing') => {
    if (!auth.currentUser) {
      navigate('/profile');
      return;
    }

    const businessId = type === 'job' ? item.businessId : item.mentorId;
    const participants = [auth.currentUser.uid, businessId].sort();
    const chatId = participants.join('_');

    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          id: chatId,
          participants,
          participantDetails: {
            [auth.currentUser.uid]: {
              displayName: profile?.displayName || 'Học sinh',
              photoURL: profile?.photoURL,
              role: profile?.role || 'student'
            },
            [businessId]: {
              displayName: type === 'job' ? item.businessName : item.mentorName,
              photoURL: type === 'job' ? item.businessLogo : (item.mentorPhoto || `https://i.pravatar.cc/100?u=${item.mentorId}`),
              role: 'business'
            }
          },
          relatedTo: {
            type,
            id: item.id,
            title: item.title
          },
          createdAt: Date.now(),
          lastMessageAt: Date.now()
        });
      }

      navigate(`/messages/${chatId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const CarouselSection = ({ title, subtitle, icon: Icon, items, renderItem, viewAllPath }: any) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    return (
      <section className="py-6 border-b border-gray-100 bg-white mb-4">
        <div className="px-4 sm:px-6 flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#1877F2]">
              <Icon size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">{title}</h2>
              {subtitle && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{subtitle}</p>}
            </div>
          </div>
          <button 
            onClick={() => navigate(viewAllPath)}
            className="text-[#1877F2] text-xs font-bold hover:underline flex items-center gap-1"
          >
            {t('viewAll')} <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="relative group">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto px-4 sm:px-6 no-scrollbar snap-x snap-mandatory"
          >
            {items.map((item: any, index: number) => (
              <div key={item.id || index} className="snap-start">
                {renderItem(item)}
              </div>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>
    );
  };

  const getUserLevel = (score: number) => {
    if (score < 100) return { title: t('levelNewbie'), color: 'bg-gray-100 text-gray-600 border-gray-200' };
    if (score < 300) return { title: t('levelIntern'), color: 'bg-blue-50 text-[#1877F2] border-blue-200' };
    if (score < 600) return { title: t('levelEmployee'), color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
    if (score < 1000) return { title: t('levelExpert'), color: 'bg-purple-50 text-purple-600 border-purple-200' };
    return { title: t('levelMaster'), color: 'bg-amber-50 text-amber-600 border-amber-200' };
  };

  return (
    <div className="pb-20">
      {/* Guest Welcome Hero */}
      {!profile && (
        <section className="px-4 sm:px-6 py-12 bg-gradient-to-br from-[#1877F2] via-[#4F46E5] to-[#7C3AED] mb-6 relative overflow-hidden rounded-b-[64px] shadow-2xl shadow-blue-100">
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                <Sparkles size={14} className="text-amber-300" />
                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{t('exploreFuture')}</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
                {t('welcomeHeroTitle').split('Academy')[0]} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                  {t('welcomeHeroTitle').includes('Academy') ? 'Academy' : 'Học viện Kỹ năng Thực chiến'}
                </span>
              </h1>
              
              <p className="text-white/80 text-base sm:text-lg mb-10 leading-relaxed max-w-4xl mx-auto font-medium">
                {t('welcomeHeroSubtitle')}
              </p>
              
              <div className="max-w-6xl mx-auto mb-10">
                <VipAdsSlider />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-[#1877F2] rounded-[24px] font-black uppercase tracking-widest text-sm shadow-[0_20px_40px_-12px_rgba(255,255,255,0.3)] hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                  {t('loginNow')}
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/quick-survey')}
                  className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all"
                >
                  {t('quickSurvey')}
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-blue-400/20 rounded-full blur-[100px]"></div>
          
          {/* Floating Icons */}
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [12, 15, 12] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-10 top-20 hidden lg:block opacity-20"
          >
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center">
              <Rocket size={40} className="text-white" />
            </div>
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [-12, -15, -12] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-10 bottom-20 hidden lg:block opacity-20"
          >
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center">
              <Award size={32} className="text-white" />
            </div>
          </motion.div>
        </section>
      )}

      {/* Welcome & Quick Stats */}
      {profile && (
        <section className="px-4 sm:px-6 py-6 bg-white border-b border-gray-100 mb-4">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-xs text-gray-400 font-black uppercase tracking-[0.2em] mb-1">{t('goodMorning')}</h2>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-2 flex-wrap">
                <span className="truncate max-w-full">{profile?.displayName || t('welcomeTeenTasker')}</span>
                {profile?.isVip && <Star size={24} className="text-amber-500 shrink-0" fill="currentColor" />}
                <span className="text-[#1877F2] shrink-0">👋</span>
              </h1>
              {profile?.isVip && (
                <div className="mt-1 flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-amber-600 text-[8px] font-black uppercase tracking-widest w-fit">
                  <Star size={10} fill="currentColor" />
                  VIP Member
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('level')}</span>
                <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs shadow-sm ${getUserLevel(profile.trustScore).color}`}>
                  {getUserLevel(profile.trustScore).title}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <VipAdsSlider />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider mb-1">{t('jobs')}</p>
              <p className="text-xl font-black text-[#1877F2]">24</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider mb-1">{t('shadowing')}</p>
              <p className="text-xl font-black text-purple-600">12</p>
            </div>
            <div 
              onClick={() => navigate('/trust-score')}
              className="bg-amber-50 p-3 rounded-2xl border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-1">{t('points')}</p>
              <p className="text-xl font-black text-amber-600">{profile?.trustScore ?? 0}</p>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="px-4 sm:px-6 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Award, label: t('tasks'), color: 'bg-amber-500', path: '/tasks' },
            { icon: Building2, label: t('companies'), color: 'bg-blue-500', path: '/companies' },
            { icon: Star, label: t('vip'), color: 'bg-purple-500', path: '/vip' },
            { icon: Heart, label: t('saved'), color: 'bg-red-500', path: '/saved' },
          ].map((action, i) => (
            <button 
              key={i}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-active:scale-95 ${action.color}`}>
                <action.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-600">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* New Section: Community Feedback */}
      {surveyStats.total > 0 && (
        <section className="px-4 sm:px-6 mb-8">
          <div className="bg-gradient-to-br from-[#1877F2] to-[#4F46E5] rounded-[32px] p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <MessageSquare size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">{t('communityFeedback')}</h2>
                  <p className="text-xs text-white/80 font-medium">{t('feedbackData').replace('{total}', surveyStats.total.toString())}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={16} className="text-pink-300" fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/80">{t('satisfied')}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{surveyStats.satisfiedRate}</span>
                    <span className="text-sm font-bold text-white/80">%</span>
                  </div>
                  <p className="text-[10px] text-white/70 mt-1">{t('satisfiedDesc')}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} className="text-amber-300" fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/80">{t('recommend')}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{surveyStats.npsRate}</span>
                    <span className="text-sm font-bold text-white/80">%</span>
                  </div>
                  <p className="text-[10px] text-white/70 mt-1">{t('recommendDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured News Carousel */}
      <CarouselSection 
        title={t('featuredNews')} 
        icon={Zap}
        items={[
          { id: 'news-info', title: 'Thông tin dự án & Hướng dẫn sử dụng', image: 'https://picsum.photos/seed/project/400/250', date: t('newest'), path: '/about' },
          { id: 'news-survey', title: 'Tham gia khảo sát dự án TeenTask', image: 'https://picsum.photos/seed/survey/400/250', date: t('newest'), path: '/survey' },
          { id: 1, title: 'TeenTask ra mắt tính năng mới', image: 'https://picsum.photos/seed/news1/400/250', date: t('hoursAgo').replace('{count}', '2'), path: '/news' },
          { id: 2, title: 'Top 10 công việc mùa hè cho học sinh', image: 'https://picsum.photos/seed/news2/400/250', date: t('hoursAgo').replace('{count}', '5'), path: '/news' },
          { id: 3, title: 'Kỹ năng cần thiết trong kỷ nguyên AI', image: 'https://picsum.photos/seed/news3/400/250', date: t('daysAgo').replace('{count}', '1'), path: '/news' },
        ]}
        renderItem={(item: any) => (
          <div 
            onClick={() => navigate(item.path || '/news')}
            className="w-[280px] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <img src={item.image} alt={item.title} className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
            <div className="p-4">
              <span className="text-[10px] font-bold text-[#1877F2] uppercase tracking-wider">{item.date}</span>
              <h4 className="font-bold text-gray-900 mt-1 line-clamp-2">{item.title}</h4>
            </div>
          </div>
        )}
        viewAllPath="/news"
      />

      {/* Skill Courses Carousel */}
      <CarouselSection 
        title={t('skillCourses')} 
        icon={GraduationCap}
        items={courses}
        renderItem={(course: any) => {
          const isSaved = profile?.savedCourses?.includes(course.id);
          const isFull = course.registeredCount >= course.totalSlots;
          
          return (
            <div className="w-[320px] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer" 
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveCourse(course.id);
                  }}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-full transition-all z-10 backdrop-blur-md",
                    isSaved ? "bg-red-500 text-white" : "bg-black/20 text-white hover:bg-red-500"
                  )}
                >
                  <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
                </button>
                {course.price === 0 && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    {t('free')}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h4 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">{course.title}</h4>
                <p className="text-xs text-gray-500 mb-4">{course.provider}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('tuition')}</span>
                    <span className="text-lg font-black text-[#1877F2]">
                      {course.price === 0 ? '0đ' : `${course.price.toLocaleString('vi-VN')}đ`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('registered')}</span>
                    <span className={cn("text-xs font-bold", isFull ? "text-red-500" : "text-gray-700")}>
                      {course.registeredCount}/{course.totalSlots}
                    </span>
                  </div>
                </div>
                
                <button 
                  disabled={isFull}
                  className={cn(
                    "w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                    isFull 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-blue-50 text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                  )}
                >
                  {isFull ? t('noSlots') : t('registerNow')}
                </button>
              </div>
            </div>
          );
        }}
        viewAllPath="/courses"
      />

      {/* Jobs Carousel */}
      <CarouselSection 
        title={t('featuredJobs')} 
        subtitle={t('jobSubtitle')}
        icon={Briefcase}
        items={jobs.length > 0 ? jobs : MOCK_JOBS}
        renderItem={(job: any) => {
          const isSaved = profile?.savedJobs?.includes(job.id);
          return (
            <div 
              onClick={() => handleJobClick(job)}
              className="w-[240px] p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-[#1877F2] transition-all relative group cursor-pointer hover:shadow-md"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveJob(job.id);
                }}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-full transition-all z-10",
                  isSaved ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
                )}
              >
                <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1877F2] mb-4">
                {job.businessLogo || job.logo ? (
                  <img src={job.businessLogo || job.logo} alt={job.businessName || job.company} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                ) : (
                  <Briefcase size={24} />
                )}
              </div>
              <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">{job.title}</h4>
              <p className="text-xs text-gray-500 mb-4">{job.businessName || job.company}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-[#1877F2]">{typeof job.salary === 'number' ? `${job.salary.toLocaleString('vi-VN')}đ` : job.salary}</span>
                <span className="text-[10px] font-bold text-gray-400">{job.location}</span>
              </div>
            </div>
          );
        }}
        viewAllPath="/jobs"
      />

      {/* Shadowing Carousel */}
      <CarouselSection 
        title={t('shadowingTitle')} 
        subtitle={t('shadowingSubtitle')}
        icon={GraduationCap}
        items={shadowingEvents.length > 0 ? shadowingEvents : MOCK_SHADOWING}
        renderItem={(item: any) => {
          const isSaved = profile?.savedShadowing?.includes(item.id.toString());
          return (
            <div 
              onClick={() => handleShadowingClick(item)}
              className="w-[280px] relative rounded-3xl overflow-hidden aspect-[4/3] shadow-md group cursor-pointer hover:shadow-xl transition-all"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveShadowing(item.id.toString());
                }}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-full transition-all z-10",
                  isSaved ? "bg-red-500 text-white" : "bg-white/20 backdrop-blur-md text-white hover:bg-red-500"
                )}
              >
                <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <img src={item.imageUrl || item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 flex flex-col justify-end">
                <h4 className="text-white font-bold text-lg leading-tight mb-2">{item.title}</h4>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md overflow-hidden">
                    <img src={item.mentorPhoto || `https://i.pravatar.cc/100?u=${item.mentorId || item.mentor}`} alt={item.mentorName || item.mentor} referrerPolicy="no-referrer" />
                  </div>
                  <p className="text-white/80 text-[10px] font-medium">{item.mentorName || item.mentor} @ {item.companyName || item.company}</p>
                </div>
              </div>
            </div>
          );
        }}
        viewAllPath="/shadowing"
      />

      {/* Businesses Carousel */}
      <CarouselSection 
        title={t('featuredBusinesses')} 
        icon={Building2}
        items={[
          { id: 1, name: 'FPT Software', logo: 'https://picsum.photos/seed/fpt/100/100', jobs: 15 },
          { id: 2, name: 'Vinamilk', logo: 'https://picsum.photos/seed/vinamilk/100/100', jobs: 8 },
          { id: 3, name: 'Viettel', logo: 'https://picsum.photos/seed/viettel/100/100', jobs: 12 },
          { id: 4, name: 'Grab', logo: 'https://picsum.photos/seed/grab/100/100', jobs: 20 },
          { id: 5, name: 'Shopee', logo: 'https://picsum.photos/seed/shopee/100/100', jobs: 25 },
        ]}
        renderItem={(item: any) => (
          <div className="w-[140px] p-4 bg-white border border-gray-100 rounded-3xl text-center shadow-sm hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto mb-3 overflow-hidden border border-gray-50">
              <img src={item.logo} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <h4 className="font-bold text-gray-900 text-xs mb-1 line-clamp-1">{item.name}</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.jobs} {t('jobs').toLowerCase()}</p>
          </div>
        )}
        viewAllPath="/companies"
      />

      {/* TopCV Section */}
      <section className="px-4 sm:px-6 py-6 bg-white border-b border-gray-100 mb-4">
        <div className="bg-gradient-to-br from-[#1877F2] to-[#4F46E5] rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl shadow-blue-100">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-amber-400" size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">TeenTask TopCV</span>
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tight">{t('createCvTitle')}</h3>
            <p className="text-white/80 text-xs mb-6 max-w-[200px]">{t('createCvDesc')}</p>
            <button 
              onClick={() => navigate('/cv-builder')}
              className="bg-white text-[#1877F2] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform active:scale-95"
            >
              {t('createCvNow')}
            </button>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </section>

      {/* Featured Parents & Businesses Carousel */}
      <CarouselSection 
        title={t('featuredUsers')} 
        icon={Users}
        items={featuredUsers}
        renderItem={(item: any) => (
          <div className="w-[160px] text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-3 p-1 bg-gradient-to-br from-[#1877F2] to-[#4F46E5] shadow-lg">
              <div className="w-full h-full rounded-full bg-white p-1">
                <img 
                  src={item.photoURL || `https://i.pravatar.cc/150?u=${item.id}`} 
                  alt={item.displayName} 
                  className="w-full h-full rounded-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </div>
            </div>
            <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.displayName || t('user')}</h4>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider line-clamp-1">
              {item.bio || (item.role === 'parent' ? t('parent') : t('business'))}
            </p>
          </div>
        )}
        viewAllPath="/mentors"
      />

      {/* Success Stories */}
      <section className="px-4 sm:px-6 py-6 bg-white mb-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center text-pink-500">
            <Sparkles size={18} />
          </div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">{t('successStories')}</h2>
        </div>
        <div className="space-y-4">
          <div className="bg-pink-50/50 rounded-[32px] p-6 border border-pink-100">
            <div className="flex items-center gap-4 mb-4">
              <img src="https://i.pravatar.cc/100?u=success1" alt="student" className="w-12 h-12 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Minh Anh, 17 {t('yearsOld')}</h4>
                <p className="text-[10px] text-pink-600 font-black uppercase tracking-wider">{t('student')} THPT Phan Đình Phùng</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 italic leading-relaxed">
              {t('successStory1')}
            </p>
          </div>
          <div className="bg-blue-50/50 rounded-[32px] p-6 border border-blue-100">
            <div className="flex items-center gap-4 mb-4">
              <img src="https://i.pravatar.cc/100?u=success2" alt="student" className="w-12 h-12 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Đức Huy, 16 {t('yearsOld')}</h4>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider">{t('student')} THPT Chu Văn An</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 italic leading-relaxed">
              {t('successStory2')}
            </p>
          </div>
        </div>
      </section>

      <JobDetail 
        job={selectedJob}
        isOpen={isJobDetailOpen}
        onClose={() => setIsJobDetailOpen(false)}
        onApply={handleApplyJob}
        onChat={(job) => handleChat(job, 'job')}
        isSaved={profile?.savedJobs?.includes(selectedJob?.id)}
        onToggleSave={(e) => {
          e.stopPropagation();
          toggleSaveJob(selectedJob.id);
        }}
      />

      <ShadowingDetail 
        event={selectedShadowing}
        isOpen={isShadowingDetailOpen}
        onClose={() => setIsShadowingDetailOpen(false)}
        onChat={(event) => handleChat(event, 'shadowing')}
      />

      <ParentVerificationModal 
        isOpen={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
        onSuccess={() => setIsParentModalOpen(false)}
      />
    </div>
  );
}
