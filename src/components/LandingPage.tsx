import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './FirebaseProvider';
import { ShieldCheck, Briefcase, GraduationCap, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: '100+', jobs: '30+', apps: '50+' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // We try to fetch real counts, but if security rules block it for unauthenticated users,
        // it will fall back to the default values.
        const usersSnap = await getDocs(collection(db, 'users'));
        const jobsSnap = await getDocs(collection(db, 'jobs'));
        const appsSnap = await getDocs(collection(db, 'applications'));
        
        setStats({
          users: `${usersSnap.size}+`,
          jobs: `${jobsSnap.size}+`,
          apps: `${appsSnap.size}+`
        });
      } catch (error) {
        console.log('Using fallback stats for landing page');
      }
    };
    fetchStats();
  }, []);

  const criteriaList = [
    "Dành riêng cho 14–18 tuổi",
    "Xác minh phụ huynh bắt buộc",
    "Job Shadowing có thu phí",
    "Xác minh doanh nghiệp",
    "Tuân thủ luật lao động VN",
    "Teen CV chuyên biệt",
    "Hệ thống đánh giá 2 chiều",
    "Miễn phí cho học sinh"
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
      name: "Việc làm tốt", 
      isHighlight: false,
      data: ['❌', '❌', '❌', '✅', '⚠️', '❌', '⚠️', '❌'] 
    },
    { 
      name: "Facebook Groups", 
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

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#4F46E5] px-6 py-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[100px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm border border-white/20 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" /> Xác minh phụ huynh
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm border border-white/20 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-400" /> Việc làm thực tế
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm border border-white/20 flex items-center gap-2">
              <GraduationCap size={16} className="text-purple-400" /> Job Shadowing
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight">
            TeenTask
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mb-12 leading-relaxed">
            Sàn việc làm đầu tiên dành riêng cho học sinh Việt Nam 14–18 tuổi. An toàn, minh bạch và định hướng tương lai.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={() => navigate('/profile')}
              className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform"
            >
              Bắt đầu ngay — Miễn phí
            </button>
            <button 
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-transparent text-white border-2 border-white/30 rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors"
            >
              Tìm hiểu thêm
            </button>
          </div>
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
            <h2 className="text-4xl font-black text-gray-900 mb-4">Vấn đề của bạn là gì?</h2>
            <p className="text-xl text-gray-500">TeenTask ra đời để giải quyết những nỗi đau thực tế nhất.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Học sinh */}
            <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-2xl font-black text-blue-900 mb-4">Học sinh (14-18 tuổi)</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-blue-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Muốn đi làm thêm nhưng toàn gặp lừa đảo, đa cấp.</span>
                </li>
                <li className="flex items-start gap-2 text-blue-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Cần kinh nghiệm thực tế để apply học bổng nhưng không ai nhận.</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-blue-200">
                <p className="font-bold text-blue-900 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  TeenTask cung cấp Job an toàn & Mentor xịn.
                </p>
              </div>
            </div>

            {/* Phụ huynh */}
            <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-black text-emerald-900 mb-4">Phụ huynh</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-emerald-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Sợ con bị bóc lột sức lao động, ảnh hưởng việc học.</span>
                </li>
                <li className="flex items-start gap-2 text-emerald-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Không kiểm soát được con đang làm việc với ai, ở đâu.</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-emerald-200">
                <p className="font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  Phụ huynh phê duyệt mọi giao dịch & theo dõi sát sao.
                </p>
              </div>
            </div>

            {/* Doanh nghiệp */}
            <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Briefcase size={32} />
              </div>
              <h3 className="text-2xl font-black text-amber-900 mb-4">Doanh nghiệp / Mentor</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-amber-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Cần nhân sự làm task nhỏ (nhập liệu, design cơ bản) nhưng ngân sách thấp.</span>
                </li>
                <li className="flex items-start gap-2 text-amber-800">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Muốn chia sẻ kinh nghiệm nhưng không có kênh tiếp cận học sinh.</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-amber-200">
                <p className="font-bold text-amber-900 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  Nguồn nhân lực trẻ dồi dào & Nền tảng Mentor chuyên nghiệp.
                </p>
              </div>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="text-center py-6">
              <div className="text-5xl font-black text-indigo-600 mb-2">7M+</div>
              <div className="text-gray-500 font-medium text-lg">Học sinh THPT Việt Nam</div>
            </div>
            <div className="text-center py-6">
              <div className="text-5xl font-black text-rose-500 mb-2">0</div>
              <div className="text-gray-500 font-medium text-lg">Nền tảng tương tự tồn tại</div>
            </div>
            <div className="text-center py-6">
              <div className="text-5xl font-black text-fuchsia-600 mb-2">3</div>
              <div className="text-gray-500 font-medium text-lg">Bên được phục vụ: Học sinh, PH, DN</div>
            </div>
          </div>
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
            <h2 className="text-4xl font-black text-gray-900 mb-4">Tất cả trong một nền tảng</h2>
            <p className="text-xl text-gray-500">Hệ sinh thái toàn diện giúp học sinh phát triển kỹ năng và kiếm thu nhập an toàn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Briefcase size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sàn Việc Làm</h3>
              <p className="text-gray-600 leading-relaxed">Job phù hợp lứa tuổi, có kiểm duyệt kỹ càng. Đảm bảo môi trường làm việc an toàn và chuyên nghiệp.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Job Shadowing</h3>
              <p className="text-gray-600 leading-relaxed">Kiến tập cùng chuyên gia thực thụ. Trải nghiệm một ngày làm việc thực tế để định hướng nghề nghiệp.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">An Toàn Tuyệt Đối</h3>
              <p className="text-gray-600 leading-relaxed">Phụ huynh phê duyệt mọi giao dịch và đơn ứng tuyển. Hệ thống đánh giá 2 chiều minh bạch.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Teen CV</h3>
              <p className="text-gray-600 leading-relaxed">Hồ sơ chuyên biệt cho học sinh. Ghi nhận kỹ năng mềm, hoạt động ngoại khóa và điểm uy tín.</p>
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
            <h2 className="text-4xl font-black text-gray-900 mb-4">Vì sao chọn TeenTask?</h2>
            <p className="text-xl text-gray-500">So sánh với các nền tảng tuyển dụng và mạng xã hội khác.</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
              <div className="min-w-[800px] flex">
                {/* Cột Tiêu chí */}
                <div className="w-64 shrink-0 bg-gray-50 border-r border-gray-200">
                  <div className="h-20 flex items-center px-6 border-b border-gray-200">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tiêu chí</span>
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
          <h2 className="text-3xl font-black text-indigo-900 mb-12">Được tin dùng bởi cộng đồng</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div>
              <div className="text-4xl font-black text-indigo-600 mb-2">{stats.users}</div>
              <div className="text-indigo-900/70 font-medium">Học sinh đã đăng ký</div>
            </div>
            <div>
              <div className="text-4xl font-black text-indigo-600 mb-2">{stats.jobs}</div>
              <div className="text-indigo-900/70 font-medium">Job đang tuyển</div>
            </div>
            <div>
              <div className="text-4xl font-black text-indigo-600 mb-2">{stats.apps}</div>
              <div className="text-indigo-900/70 font-medium">Lượt ứng tuyển</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 6: CTA CUỐI */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Sẵn sàng bắt đầu hành trình?</h2>
          <button 
            onClick={() => navigate('/profile')}
            className="px-10 py-5 bg-white text-indigo-700 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-3 mx-auto"
          >
            <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
            Đăng nhập với Google — Miễn phí
          </button>
        </motion.div>
      </section>
    </div>
  );
}
