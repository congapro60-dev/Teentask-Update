import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, UserCheck, Building2, School, Briefcase, Users, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './FirebaseProvider';

export default function EduNetwork() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ schools: 0, teachers: 0, jobs: 0 });
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Stats
        const schoolsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'business'), where('orgType', '==', 'school')));
        const teachersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'business'), where('orgType', '==', 'teacher')));
        const jobsSnap = await getDocs(query(collection(db, 'jobs'), where('businessOrgType', 'in', ['school', 'teacher']), where('status', '==', 'active')));
        
        setStats({
          schools: schoolsSnap.size,
          teachers: teachersSnap.size,
          jobs: jobsSnap.size
        });

        // Fetch Partners
        const partnersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'business'),
          where('orgType', 'in', ['school', 'teacher']),
          where('isVerified', '==', true),
          limit(6)
        );
        const partnersSnap = await getDocs(partnersQuery);
        
        const partnersData = await Promise.all(partnersSnap.docs.map(async (doc) => {
          const data = doc.data();
          // Fetch job count for each partner
          const partnerJobsQuery = query(collection(db, 'jobs'), where('businessId', '==', doc.id), where('status', '==', 'active'));
          const partnerJobsSnap = await getDocs(partnerJobsQuery);
          
          return {
            id: doc.id,
            ...data,
            jobCount: partnerJobsSnap.size
          };
        }));
        
        setPartners(partnersData);
      } catch (error) {
        console.error("Error fetching EduNetwork data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#1E1B4B] via-[#4F46E5] to-[#7C3AED] min-h-[220px] flex flex-col items-center justify-center px-4 py-12 text-center relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center"
        >
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full mb-4 font-bold backdrop-blur-sm border border-white/10">
            🆕 Tính năng mới
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            TeenTask Edu Network
          </h1>
          <p className="text-white/80 text-base italic max-w-2xl mb-8">
            Mạng lưới kết nối Nhà trường · Giáo viên Hướng nghiệp · Cơ hội Thực tế
          </p>

          <div className="flex flex-wrap justify-center gap-4 w-full max-w-3xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 text-center border border-white/10 flex-1 min-w-[140px]">
              <div className="text-2xl md:text-3xl font-black text-white">
                {loading ? <span className="animate-pulse">...</span> : (stats.schools > 0 ? stats.schools : '10+')}
              </div>
              <div className="text-white/70 text-xs font-medium mt-1">Trường đối tác</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 text-center border border-white/10 flex-1 min-w-[140px]">
              <div className="text-2xl md:text-3xl font-black text-white">
                {loading ? <span className="animate-pulse">...</span> : (stats.teachers > 0 ? stats.teachers : '25+')}
              </div>
              <div className="text-white/70 text-xs font-medium mt-1">Giáo viên</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 text-center border border-white/10 flex-1 min-w-[140px]">
              <div className="text-2xl md:text-3xl font-black text-white">
                {loading ? <span className="animate-pulse">...</span> : (stats.jobs > 0 ? stats.jobs : '50+')}
              </div>
              <div className="text-white/70 text-xs font-medium mt-1">Cơ hội học tập</div>
            </div>
          </div>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* SECTION 1: GIÁ TRỊ CHO TỪNG BÊN */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-center text-[#1E1B4B] mb-10"
        >
          Tại sao tham gia Edu Network?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: School */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-t-[#4F46E5] flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
              <GraduationCap size={32} />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-gray-900">Dành cho Nhà trường</h3>
            </div>
            <div className="mb-6">
              <span className="bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full px-3 py-1">
                🏫 School Partner
              </span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Đăng job nội bộ cho học sinh của trường",
                "Xem thống kê học sinh đang tích lũy kinh nghiệm gì",
                "Kết nối với doanh nghiệp muốn tuyển học sinh của trường",
                "Logo trường xuất hiện trên profile học sinh — marketing miễn phí"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <div className="mt-0.5 text-green-500 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => navigate('/profile')}
              className="bg-indigo-600 text-white rounded-xl px-4 py-3 w-full text-sm font-semibold hover:bg-indigo-700 transition-colors mt-auto"
            >
              Đăng ký Nhà trường →
            </button>
          </motion.div>

          {/* Card 2: Teacher */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-t-[#7C3AED] flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
              <UserCheck size={32} />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-gray-900">Dành cho Giáo viên</h3>
            </div>
            <div className="mb-6">
              <span className="bg-purple-50 text-purple-600 text-xs font-bold rounded-full px-3 py-1">
                👨‍🏫 Career Advisor
              </span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Gợi ý job phù hợp cho từng học sinh",
                "Xây dựng thương hiệu cá nhân trong lĩnh vực hướng nghiệp",
                "Tổ chức workshop và Job Shadowing cho học sinh",
                "Tích lũy điểm uy tín khi học sinh được việc nhờ lời gợi ý"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <div className="mt-0.5 text-green-500 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => navigate('/profile')}
              className="bg-purple-600 text-white rounded-xl px-4 py-3 w-full text-sm font-semibold hover:bg-purple-700 transition-colors mt-auto"
            >
              Đăng ký Giáo viên →
            </button>
          </motion.div>

          {/* Card 3: Business */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-t-[#DB2777] flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-4">
              <Building2 size={32} />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-gray-900">Dành cho Doanh nghiệp</h3>
            </div>
            <div className="mb-6">
              <span className="bg-pink-50 text-pink-600 text-xs font-bold rounded-full px-3 py-1">
                🏢 Business Partner
              </span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Tiếp cận học sinh từ trường cụ thể theo yêu cầu",
                "Giáo viên đứng ra giới thiệu = ứng viên chất lượng hơn",
                "Đặt hàng trực tiếp với nhà trường về nhân lực cần thiết",
                "Xây dựng quan hệ dài hạn với cộng đồng giáo dục"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <div className="mt-0.5 text-green-500 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => navigate('/profile')}
              className="bg-pink-600 text-white rounded-xl px-4 py-3 w-full text-sm font-semibold hover:bg-pink-700 transition-colors mt-auto"
            >
              Tham gia ngay →
            </button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: CÁC TRƯỜNG ĐỐI TÁC */}
      <section className="py-16 px-4 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold text-[#1E1B4B] mb-2"
            >
              Các Đơn vị Giáo dục Đối tác
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 text-sm max-w-xl mx-auto"
            >
              Những nhà trường và giáo viên đang đồng hành cùng TeenTask
            </motion.p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 h-24 animate-pulse"></div>
              ))}
            </div>
          ) : partners.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => navigate(`/company/${partner.id}`)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all group"
                >
                  <div className="shrink-0">
                    {partner.photoURL || partner.businessLogo ? (
                      <img 
                        src={partner.photoURL || partner.businessLogo} 
                        alt={partner.displayName || partner.businessName} 
                        className="w-12 h-12 rounded-full object-cover border border-gray-100 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold group-hover:scale-105 transition-transform">
                        {(partner.businessName || partner.displayName || 'A').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {partner.businessName || partner.displayName}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        partner.orgType === 'school' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {partner.orgType === 'school' ? '🏫 Nhà trường' : '👨‍🏫 Giáo viên'}
                      </span>
                    </div>
                    {partner.jobCount > 0 && (
                      <p className="text-gray-400 text-[10px] mt-1 truncate">
                        {partner.jobCount} cơ hội đang mở
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-3xl p-12 text-center border border-dashed border-gray-200"
            >
              <School size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có đối tác nào</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                Hãy là người đầu tiên tham gia Edu Network và mang lại cơ hội cho học sinh!
              </p>
              <button 
                onClick={() => navigate('/profile')}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Đăng ký ngay
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* SECTION 3: LUỒNG HOẠT ĐỘNG */}
      <section className="py-16 px-4 max-w-5xl mx-auto overflow-hidden">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-center text-[#1E1B4B] mb-16"
        >
          Edu Network hoạt động như thế nào?
        </motion.h2>

        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-6 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] border-t-2 border-dashed border-indigo-200 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
            {[
              {
                icon: School,
                color: "text-indigo-600",
                bg: "bg-indigo-100",
                title: "Nhà trường / GV đăng ký",
                desc: "Xác minh thông tin và tham gia Edu Network với tư cách Partner"
              },
              {
                icon: Briefcase,
                color: "text-purple-600",
                bg: "bg-purple-100",
                title: "Đăng cơ hội học tập",
                desc: "Job nội bộ, Job Shadowing, Workshop hướng nghiệp"
              },
              {
                icon: Users,
                color: "text-pink-600",
                bg: "bg-pink-100",
                title: "Học sinh kết nối",
                desc: "Tìm thấy cơ hội phù hợp được Thầy/Cô gợi ý và xác nhận"
              },
              {
                icon: Award,
                color: "text-amber-600",
                bg: "bg-amber-100",
                title: "Tích lũy thực tế",
                desc: "Hoàn thành → nhận badge → bổ sung Teen CV"
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center flex flex-col items-center"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm border-4 border-white ${step.bg} ${step.color} relative z-10`}>
                  <step.icon size={20} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-2 max-w-[160px]">{step.title}</h4>
                <p className="text-xs text-gray-500 max-w-[160px] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA ĐĂNG KÝ */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#4F46E5] to-[#DB2777]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-white mb-4"
          >
            Sẵn sàng tham gia Edu Network?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Dù bạn là nhà trường, giáo viên, hay doanh nghiệp — TeenTask có chỗ cho bạn
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => navigate('/profile')}
              className="w-full sm:w-auto bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:scale-105 transition-transform active:scale-95"
            >
              Đăng ký tham gia
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="w-full sm:w-auto border-2 border-white/80 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              Xem Demo
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
