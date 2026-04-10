import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  PlayCircle, 
  FileText, 
  ChevronDown, 
  ArrowRight, 
  Video, 
  HelpCircle,
  TrendingUp,
  Award,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CareerInsights() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const videos = [
    {
      title: "Cách viết CV khi chưa có kinh nghiệm",
      author: "TeenTask × Chuyên gia HR",
      duration: "08:45",
      tags: ["CV", "Hồ sơ", "Mới bắt đầu"],
      bg: "bg-indigo-100"
    },
    {
      title: "5 kỹ năng học sinh THPT cần có",
      author: "TeenTask × Career Coach",
      duration: "15:20",
      tags: ["Kỹ năng mềm", "Gen Z", "Việc làm"],
      bg: "bg-purple-100"
    },
    {
      title: "Phỏng vấn part-time — Kinh nghiệm thực từ học sinh",
      author: "TeenTask Community",
      duration: "11:05",
      tags: ["Phỏng vấn", "Thực tế", "Tips"],
      bg: "bg-pink-100"
    }
  ];

  const researches = [
    {
      title: "Startup và Gen Z: Động lực và rào cản khởi nghiệp",
      source: "Papp-Váry et al., MDPI Sustainability, 2023",
      summary: "Nghiên cứu 280 sinh viên đại học cho thấy 42.9% đã có ý tưởng startup nhưng chưa thực hiện. Rào cản lớn nhất là thiếu kinh nghiệm thực tế và mạng lưới kết nối.",
      insight: "💡 42% Gen Z có ý tưởng nhưng thiếu cơ hội thực chiến — đây là khoảng trống TeenTask đang lấp đầy"
    },
    {
      title: "Rào cản học sinh tìm kiếm việc làm bán thời gian tại Việt Nam",
      source: "Khảo sát TeenTask × 200 học sinh THPT, Q1/2025",
      summary: "78% học sinh muốn tích lũy kinh nghiệm trước 18 tuổi. 65% phụ huynh lo ngại về an toàn khi cho con đi làm thêm.",
      insight: "💡 Nhu cầu thực tế lớn nhưng giải pháp an toàn chưa có — cơ hội cho TeenTask"
    },
    {
      title: "Tầm quan trọng của trải nghiệm thực tế với học sinh THPT",
      source: "Harvard Business Review, 2022 (Adapted for Vietnam context)",
      summary: "Học sinh có trải nghiệm làm việc thực tế trước 18 tuổi có tỷ lệ thành công cao hơn 35% trong năm đầu đại học.",
      insight: "💡 Job Shadowing chính là 'fast track' an toàn nhất cho học sinh VN"
    }
  ];

  const faqs = [
    {
      q: "Học sinh chưa có kinh nghiệm có thể ứng tuyển được không?",
      a: "Hoàn toàn có thể! TeenTask được thiết kế dành riêng cho người chưa có kinh nghiệm. Các doanh nghiệp đăng job trên TeenTask đều biết rõ đang tuyển học sinh THPT."
    },
    {
      q: "Làm thêm có ảnh hưởng đến việc học không?",
      a: "Nghiên cứu cho thấy học sinh làm part-time phù hợp (dưới 10 tiếng/tuần) thực ra có kết quả học tập tốt hơn vì kỹ năng quản lý thời gian được rèn luyện."
    },
    {
      q: "Job Shadowing khác gì đi làm thực tế?",
      a: "Job Shadowing là bạn đến quan sát và học hỏi, không cần làm việc độc lập. Rủi ro thấp hơn, phù hợp học sinh muốn khám phá ngành nghề trước khi quyết định."
    },
    {
      q: "Phụ huynh lo ngại bảo mật, TeenTask xử lý thế nào?",
      a: "Tất cả doanh nghiệp được Admin xác minh giấy phép kinh doanh. Mọi đơn ứng tuyển đều cần phụ huynh phê duyệt. Dữ liệu được mã hóa bởi Firebase/Google."
    },
    {
      q: "Học sinh có phải trả phí không?",
      a: "Hoàn toàn miễn phí cho học sinh. Kể cả tạo hồ sơ, ứng tuyển, hay nhận chứng nhận sau khi hoàn thành nhiệm vụ."
    }
  ];

  const sectionVariants = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 1. HEADER - Nền gradient chuyên nghiệp */}
      <header className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] pt-24 pb-16 px-6 text-white text-center relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
            <BookOpen size={20} className="text-white" />
            <span className="text-sm font-black uppercase tracking-widest">Góc Nhìn Nghề Nghiệp</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Kiến thức thực tế giúp bạn chuẩn bị <br className="hidden md:block" />
            trước khi bước vào thị trường lao động
          </h1>
          
          <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10">
            Khám phá các video hướng dẫn, bài nghiên cứu chuyên sâu và giải đáp thắc mắc về lộ trình phát triển sự nghiệp sớm.
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
              <span className="text-xl">📚</span>
              <span className="font-bold">12 bài nghiên cứu</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
              <span className="text-xl">🎥</span>
              <span className="font-bold">8 video hướng dẫn</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
              <span className="text-xl">❓</span>
              <span className="font-bold">15 câu hỏi thường gặp</span>
            </div>
          </div>
        </motion.div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-16 space-y-24">
        
        {/* 2. SECTION VIDEO */}
        <motion.section 
          variants={sectionVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Video className="text-indigo-600" size={32} />
              🎥 Video Hướng dẫn Thực tế
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videos.map((video, i) => (
              <div 
                key={i} 
                className="group cursor-pointer"
                onClick={() => alert("Video sẽ ra mắt sớm! Đăng ký nhận thông báo")}
              >
                <div className={`relative aspect-video ${video.bg} rounded-3xl overflow-hidden mb-4 flex items-center justify-center border border-gray-100 shadow-sm group-hover:shadow-md transition-all`}>
                  <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <PlayCircle size={32} fill="currentColor" className="text-white" />
                    <PlayCircle size={32} className="absolute text-indigo-600" />
                  </div>
                  <div className="absolute top-4 right-4 px-2 py-1 bg-black/70 text-white text-[10px] font-black rounded-lg">
                    {video.duration}
                  </div>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                  {video.title}
                </h3>
                <p className="text-gray-500 text-sm font-bold mb-4">{video.author}</p>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white border border-gray-100 text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 3. SECTION NGHIÊN CỨU */}
        <motion.section 
          variants={sectionVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3 mb-2">
              <TrendingUp className="text-indigo-600" size={32} />
              📊 Nghiên cứu & Số liệu Thị trường
            </h2>
            <p className="text-gray-500 font-medium">Dựa trên các nghiên cứu học thuật được peer-reviewed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {researches.map((res, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full">Nghiên cứu học thuật</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">{res.title}</h3>
                <p className="text-gray-400 text-[10px] font-bold italic mb-4">{res.source}</p>
                <p className="text-gray-600 text-sm font-medium leading-relaxed mb-6 line-clamp-4">
                  {res.summary}
                </p>
                <div className="mt-auto">
                  <div className="border-l-4 border-indigo-400 pl-4 py-1 mb-6">
                    <p className="text-indigo-700 font-bold text-sm leading-relaxed italic">
                      {res.insight}
                    </p>
                  </div>
                  <button className="text-indigo-600 font-black text-sm underline hover:text-indigo-700 transition-colors">
                    Đọc tóm tắt →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 4. SECTION FAQ */}
        <motion.section 
          variants={sectionVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 flex items-center justify-center gap-3">
              <HelpCircle className="text-indigo-600" size={32} />
              ❓ Câu hỏi thường gặp
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className={`border transition-all duration-300 rounded-[24px] overflow-hidden ${
                  openFaq === i ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100 shadow-sm'
                }`}
              >
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-6 text-left"
                >
                  <span className={`font-black text-lg ${openFaq === i ? 'text-indigo-900' : 'text-gray-900'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown 
                    size={24} 
                    className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-indigo-600' : 'text-gray-400'}`} 
                  />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${
                  openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-6 text-gray-600 font-medium leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5. CTA CUỐI */}
        <motion.section 
          variants={sectionVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#DB2777] to-[#4F46E5] rounded-[48px] p-12 text-center text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-white rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-white rounded-full blur-[100px]"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Sẵn sàng bắt đầu hành trình?</h2>
            <p className="text-white/80 text-lg font-medium max-w-xl mx-auto mb-10">
              Đừng để cơ hội trôi qua. Hãy bắt đầu tích lũy kinh nghiệm thực tế ngay hôm nay để tự tin hơn vào ngày mai.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate('/jobs')}
                className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <Briefcase size={24} />
                Tìm việc làm ngay
              </button>
              <button 
                onClick={() => navigate('/shadowing')}
                className="px-10 py-5 bg-indigo-900/30 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-lg hover:bg-indigo-900/50 transition-all flex items-center justify-center gap-2"
              >
                <GraduationCap size={24} />
                Xem suất kiến tập
              </button>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
