import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Scale, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Database, 
  AlertTriangle, 
  ChevronDown, 
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LegalGuide() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Học sinh lớp mấy có thể tham gia TeenTask?",
      a: "Học sinh từ 15 tuổi trở lên (lớp 10) có thể ứng tuyển việc làm với sự đồng ý của phụ huynh. Học sinh dưới 15 tuổi chỉ có thể xem thông tin và chuẩn bị hồ sơ."
    },
    {
      q: "Phụ huynh cần làm gì để cho con tham gia?",
      a: "Phụ huynh chỉ cần bấm vào link xác nhận được gửi qua email. Không cần tạo tài khoản hay cài app."
    },
    {
      q: "Doanh nghiệp có được phép tuyển học sinh dưới 18 tuổi không?",
      a: "Có, nhưng chỉ với các công việc được pháp luật cho phép, trong giờ học sinh được phép làm và sau khi có đồng ý bằng văn bản của phụ huynh."
    },
    {
      q: "Nếu gặp vấn đề trong quá trình làm việc, học sinh cần làm gì?",
      a: "Học sinh có thể bấm nút Báo cáo trong app, nhắn tin cho Admin qua kênh hỗ trợ, hoặc phụ huynh liên hệ trực tiếp. TeenTask cam kết xử lý trong 24 giờ làm việc."
    },
    {
      q: "TeenTask có thu phí học sinh không?",
      a: "Hoàn toàn miễn phí cho học sinh. TeenTask chỉ thu phí từ doanh nghiệp đăng tin và hoa hồng Job Shadowing."
    }
  ];

  const sectionVariants = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 1. HEADER - Nền gradient chuyên nghiệp */}
      <header className="bg-gradient-to-br from-[#1E1B4B] to-[#4F46E5] pt-24 pb-16 px-6 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-0 top-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors hidden md:flex"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
            <Scale size={20} className="text-amber-400" />
            <span className="text-sm font-black uppercase tracking-widest">Khung Pháp Lý & An Toàn</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            TeenTask hoạt động tuân thủ <br className="hidden md:block" />
            Bộ luật Lao động 2019 của Việt Nam
          </h1>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-indigo-100 text-lg font-medium max-w-2xl">
              Chúng tôi cam kết tạo ra môi trường trải nghiệm nghề nghiệp an toàn, minh bạch và đúng pháp luật cho thế hệ trẻ.
            </p>
            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-400 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              Đã được tư vấn pháp lý
            </div>
          </div>
        </motion.div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 space-y-12">
        
        {/* 2. SECTION 1 — Ai được phép tham gia? */}
        <motion.section 
          variants={sectionVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card A: Dưới 15 tuổi */}
          <div className="bg-red-50 border-2 border-red-100 rounded-[32px] p-8 shadow-sm">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <UserX size={28} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-black text-red-900">Dưới 15 tuổi</h3>
              <span className="px-3 py-1 bg-red-200 text-red-700 text-[10px] font-black uppercase rounded-full">Chỉ xem</span>
            </div>
            <p className="text-red-800 font-medium leading-relaxed">
              Chỉ được xem thông tin công việc và kiến tập, không thể ứng tuyển hoặc đặt vé tham gia các hoạt động có thu phí.
            </p>
          </div>

          {/* Card B: 15 – 17 tuổi */}
          <div className="bg-amber-50 border-2 border-amber-100 rounded-[32px] p-8 shadow-sm">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <UserCheck size={28} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-black text-amber-900">15 – 17 tuổi</h3>
              <span className="px-3 py-1 bg-amber-200 text-amber-700 text-[10px] font-black uppercase rounded-full">Cần PH xác nhận</span>
            </div>
            <ul className="space-y-2 text-amber-800 font-medium text-sm">
              <li className="flex items-center gap-2">• Tối đa 8 tiếng/ngày, 40 tiếng/tuần</li>
              <li className="flex items-center gap-2">• Bắt buộc có xác nhận phụ huynh</li>
              <li className="flex items-center gap-2">• Không làm việc sau 22:00</li>
              <li className="flex items-center gap-2">• Không làm môi trường độc hại</li>
            </ul>
          </div>

          {/* Card C: 18 tuổi trở lên */}
          <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[32px] p-8 shadow-sm">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle2 size={28} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-black text-emerald-900">18 tuổi trở lên</h3>
              <span className="px-3 py-1 bg-emerald-200 text-emerald-700 text-[10px] font-black uppercase rounded-full">Toàn quyền</span>
            </div>
            <p className="text-emerald-800 font-medium leading-relaxed">
              Đầy đủ quyền lao động theo pháp luật Việt Nam. Có thể tự quyết định các giao dịch và công việc tham gia.
            </p>
          </div>
        </motion.section>

        {/* 3. SECTION 2 — Công việc được phép & không được phép */}
        <motion.section 
          variants={sectionVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Cột trái: Được phép */}
          <div className="bg-white rounded-[32px] p-8 border border-emerald-100 shadow-sm">
            <h3 className="text-2xl font-black text-emerald-600 mb-8 flex items-center gap-3">
              <CheckCircle2 size={32} />
              Được phép trên TeenTask
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Thiết kế đồ họa, UI/UX",
                "Sản xuất nội dung, video TikTok",
                "Gia sư, hướng dẫn học thuật",
                "Hỗ trợ sự kiện, MC",
                "Khảo sát, nghiên cứu thị trường",
                "Lập trình, phát triển web cơ bản"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-bold text-emerald-900 leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cột phải: Không được phép */}
          <div className="bg-white rounded-[32px] p-8 border border-red-100 shadow-sm">
            <h3 className="text-2xl font-black text-red-600 mb-8 flex items-center gap-3">
              <XCircle size={32} />
              Không được phép
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Môi trường có hóa chất độc hại",
                "Làm việc sau 22:00",
                "Mang vác vật nặng trên 9kg",
                "Công việc ảnh hưởng tâm thần",
                "Bất kỳ công việc cần người lớn"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                  <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-bold text-red-900 leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 4. SECTION 3 — TeenTask bảo vệ bạn như thế nào? */}
        <motion.section 
          variants={sectionVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">TeenTask bảo vệ bạn như thế nào?</h2>
            <p className="text-gray-500 font-medium">Hệ thống an toàn đa lớp được thiết kế riêng cho học sinh.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-3">Xác minh Doanh nghiệp</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                100% doanh nghiệp được Admin duyệt giấy phép kinh doanh trước khi đăng tin.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-3">Phụ huynh Phê duyệt</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Mọi đơn ứng tuyển đều cần chữ ký điện tử của phụ huynh mới được gửi đi.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Database size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-3">Bảo mật Dữ liệu</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Dữ liệu được mã hóa, lưu trên Firebase với chuẩn bảo mật Google.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-3">Kênh Báo cáo</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Nút báo cáo vi phạm trên mọi bài đăng, xử lý trong 24 giờ làm việc.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 5. SECTION 4 — FAQ pháp lý (Accordion) */}
        <motion.section 
          variants={sectionVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Câu hỏi thường gặp về Pháp lý</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-indigo-50/50 transition-colors"
                >
                  <span className="font-bold text-gray-900">{faq.q}</span>
                  <ChevronDown 
                    size={20} 
                    className={cn("text-gray-400 transition-transform duration-300", openFaq === i && "rotate-180")} 
                  />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="px-5 pb-5 text-gray-600 text-sm font-medium leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 6. FOOTER CTA */}
        <motion.section 
          variants={sectionVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[40px] p-12 text-center text-white shadow-2xl shadow-indigo-200"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-6">Còn thắc mắc về pháp lý?</h2>
          <p className="text-indigo-100 mb-10 max-w-xl mx-auto font-medium">
            Đội ngũ TeenTask luôn sẵn sàng giải đáp mọi lo ngại của phụ huynh và học sinh về an toàn và pháp luật.
          </p>
          <button 
            onClick={() => navigate('/messages')}
            className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 mx-auto"
          >
            <MessageSquare size={24} />
            Liên hệ Admin
          </button>
        </motion.section>

      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
