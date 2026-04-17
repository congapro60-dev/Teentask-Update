import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'motion/react';
import { collection, getDocs } from 'firebase/firestore';
import { db, useFirebase } from './FirebaseProvider';
import { ShieldCheck, Briefcase, GraduationCap, FileText, CheckCircle2, XCircle, AlertCircle, BookOpen, Award, ChevronRight, ChevronDown, Globe, LogIn, Search, Users } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useFirebase();
  const [stats, setStats] = useState({ users: '100+', jobs: '30+', apps: '50+' });

  useEffect(() => {
    const fetchStats = async () => {
      // Add a timeout to prevent long loading if Firestore is unavailable
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      try {
        const statsPromise = (async () => {
          const usersSnap = await getDocs(collection(db, 'users'));
          const jobsSnap = await getDocs(collection(db, 'jobs'));
          const appsSnap = await getDocs(collection(db, 'applications'));
          return {
            users: `${usersSnap.size}+`,
            jobs: `${jobsSnap.size}+`,
            apps: `${appsSnap.size}+`
          };
        })();

        const result = await Promise.race([statsPromise, timeoutPromise]) as any;
        setStats(result);
      } catch (error) {
        console.log('Using fallback stats for landing page (timeout or connectivity issue)');
        // Fallback to initial state if it fails or timeouts
      }
    };
    fetchStats();
  }, []);

  const handleDemoAccess = (role: 'student' | 'parent' | 'business') => {
    localStorage.setItem('demoRole', role);
    localStorage.setItem('isDemoMode', 'true');
    window.location.reload();
  };

  const criteriaList = [
    t('dedicated1418'),
    t('parentVerificationRequired'),
    t('paidJobShadowing'),
    t('businessVerification'),
    t('vnLaborLaw'),
    t('specializedTeenCv'),
    t('twoWayRating'),
    t('freeForStudents')
  ];

  const platforms = [
    { 
      name: "TeenTask", 
      isHighlight: true,
      data: ['✅', '✅', '✅', '✅', '✅', '✅', '✅', '✅'] 
    },
    { 
      name: "TopCV", 
      isHighlight: false,
      data: ['❌', '❌', '❌', '✅', '⚠️', '❌', '✅', '❌'] 
    },
    { 
      name: t('platformViecLamTot'), 
      isHighlight: false,
      data: ['❌', '❌', '❌', '✅', '⚠️', '❌', '⚠️', '❌'] 
    },
    { 
      name: t('platformFacebookGroups'), 
      isHighlight: false,
      data: ['❌', '❌', '❌', '❌', '❌', '❌', '❌', '✅'] 
    }
  ];

  const renderIcon = (value: string) => {
    if (value === '✅') return <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />;
    if (value === '❌') return <XCircle className="w-6 h-6 text-rose-500 mx-auto" />;
    if (value === '⚠️') return <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />;
    return <span className="text-gray-500">{value}</span>;
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const heroImageVariants = {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 1, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Language Switcher Floating */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed top-6 right-6 z-[100] flex gap-2"
      >
        <button 
          onClick={() => setLanguage('vi')}
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all border ${
            language === 'vi' 
              ? 'bg-white text-indigo-700 border-white shadow-lg scale-110' 
              : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
          }`}
        >
          VI
        </button>
        <button 
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all border ${
            language === 'en' 
              ? 'bg-white text-indigo-700 border-white shadow-lg scale-110' 
              : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
          }`}
        >
          EN
        </button>
      </motion.div>

      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#4F46E5] px-6 py-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
              x: [0, 20, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px]"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -40, 0],
              y: [0, 20, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[100px]"
          ></motion.div>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-8">
            <motion.span whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm border border-white/20 flex items-center gap-2 cursor-default">
              <ShieldCheck size={16} className="text-emerald-400" /> {t('parentVerification')}
            </motion.span>
            <motion.span whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm border border-white/20 flex items-center gap-2 cursor-default">
              <Briefcase size={16} className="text-blue-400" /> {t('realJobs')}
            </motion.span>
            <motion.span whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm border border-white/20 flex items-center gap-2 cursor-default">
              <GraduationCap size={16} className="text-purple-400" /> {t('jobShadowing')}
            </motion.span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-[0.9]">
            {t('heroTitle')}
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-white/80 max-w-2xl mb-4 leading-relaxed font-medium">
            {t('heroSubtitle')}
          </motion.p>
          <motion.p variants={itemVariants} className="text-lg text-white/60 italic mb-12 font-serif opacity-80">
            {t('heroQuote')}
          </motion.p>

          {/* 1. BADGE "KHÔNG CẦN CÀI APP" — Ý tưởng từ Claude AI */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <CheckCircle2 size={14} className="text-emerald-400" /> {t('noInstallNeeded')}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <Globe size={14} className="text-blue-300" /> {t('useOnBrowser')}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <ShieldCheck size={14} className="text-amber-300" /> {t('googleOAuthSecurity')}
            </span>
          </motion.div>

          {/* 2. STEPPER "3 BƯỚC ĐƠN GIẢN" — Ý tưởng từ Claude AI */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center gap-4 mb-12 flex-wrap"
          >
            <div className="flex flex-col items-center group cursor-default">
              <div className="w-8 h-8 rounded-full bg-white text-indigo-700 font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">1</div>
              <div className="flex items-center gap-1 text-white text-sm font-medium mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <Globe size={14} /> {t('step1')}
              </div>
            </div>
            
            <ChevronRight size={20} className="text-white/40 mt-[-20px] hidden sm:block animate-pulse" />
            
            <div className="flex flex-col items-center group cursor-default">
              <div className="w-8 h-8 rounded-full bg-white text-indigo-700 font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">2</div>
              <div className="flex items-center gap-1 text-white text-sm font-medium mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <LogIn size={14} /> {t('step2')}
              </div>
            </div>

            <ChevronRight size={20} className="text-white/40 mt-[-20px] hidden sm:block" />

            <div className="flex flex-col items-center group cursor-default">
              <div className="w-8 h-8 rounded-full bg-white text-indigo-700 font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">3</div>
              <div className="flex items-center gap-1 text-white text-sm font-medium mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <Search size={14} /> {t('step3')}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/profile')}
              className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-black text-lg shadow-xl"
            >
              {t('startNowFree')}
            </motion.button>
            <motion.button 
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/quick-survey')}
              className="px-8 py-4 bg-transparent text-white border-2 border-white/30 rounded-2xl font-bold text-lg transition-colors"
            >
              {t('quickSurveyBtn')}
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex flex-col items-center text-white/70 cursor-pointer hover:text-white transition-colors"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="text-sm font-medium mb-2 uppercase tracking-widest text-center">{t('scrollDownInfo')}</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronDown size={24} />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION: CHÚNG TÔI LÀ GÌ? */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">{t('whatIsTeenTask')}</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('newDefinition')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: GraduationCap,
                title: t('practicalAcademy'),
                desc: t('practicalAcademyDesc'),
                color: 'bg-blue-50 text-blue-600'
              },
              {
                icon: Users,
                title: t('connectedCommunity'),
                desc: t('connectedCommunityDesc'),
                color: 'bg-indigo-50 text-indigo-600'
              },
              {
                icon: Award,
                title: t('recognizedCert'),
                desc: t('recognizedCertDesc'),
                color: 'bg-pink-50 text-pink-600'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="p-8 rounded-[40px] border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all group cursor-default"
              >
                <div className={`w-16 h-16 ${item.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1.2: HÀNH TRÌNH 3 BƯỚC */}
      <section className="py-24 bg-white px-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              {t('journeyTitle')}
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              {t('journeySubtitle')}
            </p>
          </div>

          <div className="relative">
            {/* Desktop Connectors (Arrows) */}
            <div className="hidden md:block absolute top-1/2 left-[30%] -translate-y-1/2 z-0">
              <ChevronRight size={48} className="text-gray-200" />
            </div>
            <div className="hidden md:block absolute top-1/2 left-[64%] -translate-y-1/2 z-0">
              <ChevronRight size={48} className="text-gray-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {/* Bước 1: HỌC HỎI (LEARN) */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-100 transition-all"
              >
                <div className="absolute -bottom-4 -right-4 text-7xl font-black text-indigo-100/50 group-hover:scale-110 transition-transform">01</div>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <BookOpen size={32} className="text-indigo-600" />
                </div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">{t('step1Learn')}</span>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{t('equipKnowledge')}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t('equipKnowledgeDesc')}
                </p>
                <button 
                  onClick={() => navigate('/career-insights')}
                  className="text-indigo-600 font-bold hover:underline flex items-center gap-2"
                >
                  → {t('viewCareerInsights')}
                </button>
              </motion.div>

              {/* Mobile Connector */}
              <div className="md:hidden flex justify-center py-2">
                <ChevronDown size={32} className="text-gray-300" />
              </div>

              {/* Bước 2: THỰC HÀNH (PRACTICE) */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="bg-purple-50 border-2 border-purple-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:shadow-purple-100 transition-all"
              >
                <div className="absolute -bottom-4 -right-4 text-7xl font-black text-purple-100/50 group-hover:scale-110 transition-transform">02</div>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Briefcase size={32} className="text-purple-600" />
                </div>
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 block">{t('step2Practice')}</span>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{t('realPractice')}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t('realPracticeDesc')}
                </p>
                <button 
                  onClick={() => navigate('/jobs')}
                  className="text-purple-600 font-bold hover:underline flex items-center gap-2"
                >
                  → {t('viewJobs')}
                </button>
              </motion.div>

              {/* Mobile Connector */}
              <div className="md:hidden flex justify-center py-2">
                <ChevronDown size={32} className="text-gray-300" />
              </div>

              {/* Bước 3: CHỨNG MINH (PROVE) */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-pink-50 border-2 border-pink-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:shadow-pink-100 transition-all"
              >
                <div className="absolute -bottom-4 -right-4 text-7xl font-black text-pink-100/50 group-hover:scale-110 transition-transform">03</div>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Award size={32} className="text-pink-600" />
                </div>
                <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-2 block">{t('step3Prove')}</span>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{t('proveAbility')}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t('proveAbilityDesc')}
                </p>
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-pink-600 font-bold hover:underline flex items-center gap-2"
                >
                  → {t('viewSampleProfile')}
                </button>
              </motion.div>
            </div>
          </div>

          {/* Highlight Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 text-white text-center shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-xl md:text-2xl font-bold leading-relaxed">
                {t('pioneerPlatform')}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 1.5: PAIN POINTS */}
      <section className="py-24 bg-white px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('whatIsYourProblem')}</h2>
            <p className="text-xl text-gray-500">{t('solvePainPoints')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Học sinh */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-blue-50 rounded-3xl p-8 border border-blue-100 hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-2xl font-black text-blue-900 mb-4">{t('student1418')}</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-blue-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>{t('studentPain1')}</span>
                </li>
                <li className="flex items-start gap-2 text-blue-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>{t('studentPain2')}</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-blue-200">
                <p className="font-bold text-blue-900 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  {t('teenTaskSolutionStudent')}
                </p>
              </div>
            </motion.div>

            {/* Phụ huynh */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-black text-emerald-900 mb-4">{t('parents')}</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-emerald-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>{t('parentPain1')}</span>
                </li>
                <li className="flex items-start gap-2 text-emerald-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>{t('parentPain2')}</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-emerald-200">
                <p className="font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  {t('teenTaskSolutionParent')}
                </p>
              </div>
            </motion.div>

            {/* Doanh nghiệp */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-amber-50 rounded-3xl p-8 border border-amber-100 hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Briefcase size={32} />
              </div>
              <h3 className="text-2xl font-black text-amber-900 mb-4">{t('businessMentor')}</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-amber-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>{t('businessPain1')}</span>
                </li>
                <li className="flex items-start gap-2 text-amber-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>{t('businessPain2')}</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-amber-200">
                <p className="font-bold text-amber-900 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  {t('teenTaskSolutionBusiness')}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: SỐ LIỆU */}
      <section className="py-20 bg-white px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100"
          >
            <motion.div variants={itemVariants} className="text-center py-6">
              {/* Cập nhật nội dung 2: Thay "7M+" bằng "~3M" và thêm nguồn */}
              <div className="text-5xl font-black text-indigo-600 mb-2">~3M</div>
              <div className="text-gray-500 font-medium text-lg">{t('vietnamStudents')}</div>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter font-bold">{t('sourceMOET')}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center py-6">
              {/* Cập nhật nội dung 1: Thay "0" bằng "1st" và cập nhật mô tả */}
              <div className="text-5xl font-black text-rose-500 mb-2">1st</div>
              <div className="text-gray-500 font-medium text-lg">{t('pioneerInVN')}</div>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center py-6">
              <div className="text-5xl font-black text-fuchsia-600 mb-2">3</div>
              <div className="text-gray-500 font-medium text-lg">{t('threeParties')}</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 3: TÍNH NĂNG CHÍNH */}
      <section id="features" className="py-24 bg-gray-50 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('allInOne')}</h2>
            <p className="text-xl text-gray-500">{t('comprehensiveEcosystem')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Briefcase size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('jobMarket')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('jobMarketDesc')}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('jobShadowing')}</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{t('shadowingSubtitle')}</p>
              
              {/* Hiển thị 3 gói kiến tập dạng card ngang */}
              <div className="flex flex-row gap-3 overflow-x-auto pt-3 pb-2 hide-scrollbar">
                {/* Card Explorer */}
                <div className="min-w-[200px] flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm shrink-0">
                  <div className="font-bold text-gray-800 mb-1">🥉 {t('explorerPackage')}</div>
                  <div className="text-gray-500 text-xs mb-2">{t('threeHours')} · {t('tenFifteenStudents')}</div>
                  <div className="text-emerald-600 text-xs font-medium">✅ Certificate</div>
                </div>

                {/* Card Insider */}
                <div className="min-w-[200px] flex-1 bg-indigo-50 border border-indigo-300 rounded-xl p-3 text-sm shrink-0 relative">
                  <div className="absolute -top-2 right-2 bg-indigo-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">{t('popular')}</div>
                  <div className="font-bold text-indigo-900 mb-1">🥈 {t('insiderPackage')}</div>
                  <div className="text-indigo-600/70 text-xs mb-2">{t('halfDay')} · {t('fiveEightStudents')}</div>
                  <div className="text-emerald-600 text-xs font-medium">{t('insiderFeatures')}</div>
                </div>

                {/* Card Elite */}
                <div className="min-w-[200px] flex-1 bg-amber-50 border border-amber-400 rounded-xl p-3 text-sm shrink-0 relative">
                  <div className="absolute -top-2 right-2 bg-amber-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">{t('exclusive')}</div>
                  <div className="font-bold text-amber-900 mb-1">🥇 {t('elitePackage')}</div>
                  <div className="text-amber-700/70 text-xs mb-2">{t('fullDay')} · {t('threeFiveSlots')}</div>
                  <div className="text-emerald-600 text-xs font-medium">{t('eliteFeatures')}</div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic mt-2">{t('fromPrice')} · {t('parentApproveBefore')}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('absoluteSafety')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('absoluteSafetyDesc')}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('teenCv')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('teenCvDesc')}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 4: SO SÁNH NỀN TẢNG (Moved from Admin) */}
      <section className="py-24 bg-white px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('whyChooseTeenTask')}</h2>
            <p className="text-xl text-gray-500">{t('comparePlatforms')}</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
              <div className="min-w-[800px] flex">
                {/* Cột Tiêu chí */}
                <div className="w-64 shrink-0 bg-gray-50 border-r border-gray-200">
                  <div className="h-20 flex items-center px-6 border-b border-gray-200">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('criteria')}</span>
                  </div>
                  {criteriaList.map((criteria, idx) => (
                    <div key={idx} className="h-16 flex items-center px-6 border-b border-gray-100 last:border-0">
                      <span className="text-sm font-medium text-gray-700">{criteria}</span>
                    </div>
                  ))}
                </div>

                {/* Các cột Nền tảng */}
                <div className="flex-1 flex">
                  {platforms.map((platform, pIdx) => (
                    <div 
                      key={pIdx} 
                      className={`flex-1 min-w-[140px] flex flex-col border-r border-gray-100 last:border-0 ${platform.isHighlight ? 'bg-indigo-50/50' : 'bg-white'}`}
                    >
                      <div className={`h-20 flex items-center justify-center px-4 border-b border-gray-200 ${platform.isHighlight ? 'bg-indigo-600' : 'bg-white'}`}>
                        <span className={`text-base font-black text-center ${platform.isHighlight ? 'text-white text-lg' : 'text-gray-900'}`}>
                          {platform.name}
                        </span>
                      </div>
                      {platform.data.map((val, vIdx) => (
                        <div key={vIdx} className={`h-16 flex items-center justify-center border-b border-gray-100 last:border-0 ${platform.isHighlight ? 'bg-indigo-50/30' : ''}`}>
                          {renderIcon(val)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 5: SOCIAL PROOF */}
      <section className="py-20 bg-indigo-50 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl font-black text-indigo-900 mb-12">{t('trustedByCommunity')}</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div>
              <div className="text-4xl font-black text-indigo-600 mb-2">{stats.users}</div>
              <div className="text-indigo-900/70 font-medium">{t('registeredStudents')}</div>
            </div>
            <div>
              <div className="text-4xl font-black text-indigo-600 mb-2">{stats.jobs}</div>
              <div className="text-indigo-900/70 font-medium">{t('activeJobs')}</div>
            </div>
            <div>
              <div className="text-4xl font-black text-indigo-600 mb-2">{stats.apps}</div>
              <div className="text-indigo-900/70 font-medium">{t('totalApplications')}</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 5.5: DEMO ACCESS */}
      <section className="py-24 bg-white px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('experienceDemoTitle')}</h2>
            <p className="text-xl text-gray-500">{t('experienceDemoSubtitle')}</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="p-8 rounded-[40px] bg-blue-50 border-2 border-blue-100 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm text-blue-600">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-xl font-black text-blue-900 mb-4">{t('demoAsStudent')}</h3>
              <p className="text-blue-700/70 mb-8 text-sm">{t('demoAsStudentDesc')}</p>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDemoAccess('student')}
                className="mt-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                {t('tryDemoNow')}
              </motion.button>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="p-8 rounded-[40px] bg-emerald-50 border-2 border-emerald-100 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm text-emerald-600">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-emerald-900 mb-4">{t('demoAsParent')}</h3>
              <p className="text-emerald-700/70 mb-8 text-sm">{t('demoAsParentDesc')}</p>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDemoAccess('parent')}
                className="mt-auto px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
              >
                {t('tryDemoNow')}
              </motion.button>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="p-8 rounded-[40px] bg-amber-50 border-2 border-amber-100 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm text-amber-600">
                <Briefcase size={32} />
              </div>
              <h3 className="text-xl font-black text-amber-900 mb-4">{t('demoAsBusiness')}</h3>
              <p className="text-amber-700/70 mb-8 text-sm">{t('demoAsBusinessDesc')}</p>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDemoAccess('business')}
                className="mt-auto px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
              >
                {t('tryDemoNow')}
              </motion.button>
            </motion.div>
          </motion.div>
          
          <div className="mt-12 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-4 justify-center">
            <AlertCircle className="text-indigo-600" />
            <p className="text-indigo-900 font-medium text-sm">
              {t('demoModeNotice')}
            </p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 6: CTA CUỐI */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-center">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black text-white mb-8">{t('readyToStart')}</motion.h2>
          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className="px-10 py-5 bg-white text-indigo-700 rounded-2xl font-black text-xl shadow-2xl transition-transform flex items-center justify-center gap-3 mx-auto"
          >
            <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
            {t('loginWithGoogleFree')}
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
