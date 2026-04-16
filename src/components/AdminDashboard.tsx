import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, UserCheck, Search, AlertCircle, Briefcase, MessageSquare, Megaphone, UserCog, Zap, PieChart as PieChartIcon, TrendingUp, ClipboardList } from 'lucide-react';
import { collection, getDocs, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, useFirebase } from './FirebaseProvider';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Import sub-components
import UserTab from './admin/UserTab';
import ContentTab from './admin/ContentTab';
import FinancialTab from './admin/FinancialTab';
import MarketTab from './admin/MarketTab';
import SupportTab from './admin/SupportTab';

export default function AdminDashboard() {
  const { profile, loading: firebaseLoading } = useFirebase();
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'messages' | 'ads' | 'name_changes' | 'financial' | 'market' | 'applications'>('users');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);
  const [financialTabMode, setFinancialTabMode] = useState<'realtime' | 'simulator'>('realtime');
  
  // Shared Data for Financials and Market
  const [jobs, setJobs] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [shadowingBookings, setShadowingBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // AI Market Insight states
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiChartData, setAiChartData] = useState<any[] | null>(null);
  const [aiHeatmapData, setAiHeatmapData] = useState<any[] | null>(null);
  const [aiLastUpdated, setAiLastUpdated] = useState<Date | null>(null);

  // Survey Data for Financial Simulator
  const [surveyPricingData, setSurveyPricingData] = useState<any>(null);

  useEffect(() => {
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (s) => setJobs(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubAds = onSnapshot(collection(db, 'advertisements'), (s) => setAds(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubBookings = onSnapshot(collection(db, 'shadowing_bookings'), (s) => setShadowingBookings(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubConfig = onSnapshot(doc(db, 'settings', 'admin'), (doc) => {
      if (doc.exists()) setAutoApprove(doc.data().autoApprove || false);
      setLoading(false);
    });

    const fetchSurveyPricing = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'market_surveys'));
        if (!snapshot.empty) {
          const total = snapshot.size;
          const counts: Record<string, number> = { 'Có, nếu chất lượng tốt': 0, 'Không, tôi chỉ muốn miễn phí': 0 };
          const studentBudgets: Record<string, number> = {};
          const parentBudgets: Record<string, number> = {};
          const businessBudgets: Record<string, number> = {};

          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.payForShadowing) counts[data.payForShadowing] = (counts[data.payForShadowing] || 0) + 1;
            if (data.skillCourseBudget) studentBudgets[data.skillCourseBudget] = (studentBudgets[data.skillCourseBudget] || 0) + 1;
            if (data.monthlyDevelopmentBudget) parentBudgets[data.monthlyDevelopmentBudget] = (parentBudgets[data.monthlyDevelopmentBudget] || 0) + 1;
            if (data.recruitmentBudget) businessBudgets[data.recruitmentBudget] = (businessBudgets[data.recruitmentBudget] || 0) + 1;
          });

          const formatBudget = (budgets: Record<string, number>) => {
            const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);
            return Object.entries(budgets).map(([name, value]) => ({ name, value: Math.round((value / totalBudget) * 100) || 0 }));
          };

          setSurveyPricingData({
            distribution: [
              { name: 'Sẵn sàng trả phí', value: Math.round((counts['Có, nếu chất lượng tốt'] / total) * 100) || 0 },
              { name: 'Chỉ muốn miễn phí', value: Math.round((counts['Không, tôi chỉ muốn miễn phí'] / total) * 100) || 0 }
            ],
            popularPrice: counts['Có, nếu chất lượng tốt'] > counts['Không, tôi chỉ muốn miễn phí'] ? 'Có, nếu chất lượng tốt' : 'Không, tôi chỉ muốn miễn phí',
            popularPercentage: Math.round((Math.max(counts['Có, nếu chất lượng tốt'], counts['Không, tôi chỉ muốn miễn phí']) / total) * 100) || 0,
            totalResponses: total,
            avgValue: counts['Có, nếu chất lượng tốt'] > counts['Không, tôi chỉ muốn miễn phí'] ? 300000 : 0,
            studentCourseBudget: formatBudget(studentBudgets),
            parentMonthlyBudget: formatBudget(parentBudgets),
            businessRecruitmentBudget: formatBudget(businessBudgets)
          });
        }
      } catch (error) { console.error("Error fetching survey pricing:", error); }
    };
    fetchSurveyPricing();

    return () => {
      unsubJobs(); unsubAds(); unsubBookings(); unsubUsers(); unsubConfig();
    };
  }, []);

  const [simData, setSimData] = useState({
    jobsPerMonth: 100, jobSuccessRate: 30, avgSalary: 100000, jobCommission: 10,
    shadowingPerMonth: 31, avgTicketPrice: 280000, shadowingCommission: 15,
    bannersPerMonth: 5, bannerFee: 2000000, premiumPosts: 20, premiumFee: 200000, fixedCost: 5000000,
    sponsorshipPerMonth: 0, // Tài trợ/tháng (VND)
  });

  const financials = useMemo(() => {
    const jobRevenue = simData.jobsPerMonth * (simData.jobSuccessRate / 100) * simData.avgSalary * (simData.jobCommission / 100);
    const shadowingRevenue = simData.shadowingPerMonth * simData.avgTicketPrice * (simData.shadowingCommission / 100);
    const adRevenue = (simData.bannersPerMonth * simData.bannerFee) + (simData.premiumPosts * simData.premiumFee);
    // Cập nhật công thức doanh thu: Thêm sponsorshipPerMonth vào tổng
    const totalRevenue = jobRevenue + shadowingRevenue + adRevenue + simData.sponsorshipPerMonth;
    const fixedCost = simData.fixedCost;
    const profit = totalRevenue - fixedCost;
    const breakEvenJobs = Math.ceil(fixedCost / (simData.avgSalary * simData.jobCommission / 100));
    const monthlyData = Array.from({length: 12}, (_, i) => ({
      month: `T${i+1}`,
      revenue: Math.round(totalRevenue * Math.pow(1.15, i)),
      cost: fixedCost
    }));
    const revenueBreakdown = [
      { name: 'Việc làm', value: jobRevenue },
      { name: 'Shadowing', value: shadowingRevenue },
      { name: 'Quảng cáo', value: adRevenue },
      { name: '🤝 Tài trợ', value: simData.sponsorshipPerMonth } // Thêm dòng hiển thị Tài trợ
    ].filter(item => item.value > 0);
    return { jobRevenue, shadowingRevenue, adRevenue, totalRevenue, profit, fixedCost, breakEvenJobs, monthlyData, revenueBreakdown };
  }, [simData]);

  const realFinancials = useMemo(() => {
    const approvedJobsCount = jobs.filter(j => j.isApproved).length;
    const realJobRevenue = approvedJobsCount * 100000; 
    const shadowingBookingsCount = shadowingBookings.length;
    const realShadowingRevenue = shadowingBookingsCount * 50000;
    const approvedAdsCount = ads.filter(a => a.status === 'approved').length;
    const realAdRevenue = approvedAdsCount * 500000;
    const totalRevenue = realJobRevenue + realShadowingRevenue + realAdRevenue;
    const fixedCost = simData.fixedCost;
    const profit = totalRevenue - fixedCost;
    const revenueBreakdown = [
      { name: 'Việc làm', value: realJobRevenue },
      { name: 'Shadowing', value: realShadowingRevenue },
      { name: 'Quảng cáo', value: realAdRevenue }
    ].filter(item => item.value > 0);
    return { approvedJobsCount, shadowingBookingsCount, approvedAdsCount, jobRevenue: realJobRevenue, shadowingRevenue: realShadowingRevenue, adRevenue: realAdRevenue, totalRevenue, profit, fixedCost, revenueBreakdown };
  }, [jobs, shadowingBookings, ads, simData.fixedCost]);

  const marketStats = useMemo(() => {
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalJobs = jobs.length;
    const approvalRate = jobs.length > 0 ? Math.round((jobs.filter(j => j.isApproved).length / jobs.length) * 100) : 0;
    const shadowingSold = shadowingBookings.length;
    return { totalStudents, totalJobs, approvalRate, shadowingSold };
  }, [users, jobs, shadowingBookings]);

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const fetchMarketDataFromAI = async () => {
    if (!process.env.GEMINI_API_KEY) { alert('Vui lòng cấu hình GEMINI_API_KEY.'); return; }
    setIsAILoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: profile?.geminiApiKey || process.env.GEMINI_API_KEY || '' });
      const prompt = `Phân tích thị trường việc làm Gen Z tại VN. Trả về JSON: { "chartData": [{ "name": "kỹ năng", "value": % }], "heatmapData": [{ "id": 1, "city": "tên", "jobs": số, "percentage": % }] }`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      const text = response.text;
      if (text) {
        const data = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
        setAiChartData(data.chartData); setAiHeatmapData(data.heatmapData); setAiLastUpdated(new Date());
      }
    } catch (error) { console.error('AI Error:', error); } finally { setIsAILoading(false); }
  };

  const handleExportBCTC = async () => {
    const element = document.querySelector('.financial-content') as HTMLElement;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#F8FAFC' });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`BCTC_TeenTask_${new Date().toLocaleDateString()}.pdf`);
  };

  const handleExportSlides = async () => {
    const content = document.querySelector('.financial-content') as HTMLElement;
    if (!content) return;
    const canvas = await html2canvas(content, { scale: 2, useCORS: true, backgroundColor: '#f3f4f6' });
    const pdf = new jsPDF('l', 'mm', [297, 167]);
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 297, (canvas.height * 297) / canvas.width);
    pdf.save(`Slide_TeenTask_${new Date().toLocaleDateString()}.pdf`);
  };

  const handleExportPitchSummary = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const htmlContent = `
      <html><head><title>TeenTask - Pitch Summary</title><style>body{font-family:sans-serif;padding:40px;}table{width:100%;border-collapse:collapse;margin:20px 0;}th,td{border:1px solid #ddd;padding:12px;text-align:left;}th{background:#f4f4f4;}</style></head>
      <body><h1>TeenTask — Kế hoạch Tài chính Pitch Round 3</h1><h2>BẢNG 1: Chi phí vận hành</h2><table><tr><td>Fixed</td><td>1,300,000đ/tháng</td></tr><tr><td>Variable</td><td>3,700,000đ/tháng</td></tr><tr style="background:#eee"><td>TỔNG</td><td>5,000,000đ/tháng</td></tr></table>
      <h2>BẢNG 2: Job Shadowing</h2><table><tr><th>Gói</th><th>Giá</th><th>Thời lượng</th><th>Quy mô</th><th>Quyền lợi</th></tr><tr><td>Explorer</td><td>150,000đ</td><td>3h</td><td>10-15 HS</td><td>Certificate</td></tr><tr><td>Insider</td><td>350,000đ</td><td>5h</td><td>5-8 HS</td><td>Cert + Lunch</td></tr><tr><td>Elite</td><td>700,000đ</td><td>8h</td><td>3-5 HS</td><td>Full package</td></tr></table>
      <h2>BẢNG 3: Dự báo</h2><table><tr><th>Giai đoạn</th><th>Doanh thu</th><th>Chi phí</th><th>Kết quả</th></tr><tr><td>T1-3</td><td>~3.2M</td><td>5M</td><td>Lỗ 1.7M</td></tr><tr><td>T4-6</td><td>~8.7M</td><td>5M</td><td>Lãi 3.7M</td></tr><tr><td>T7-12</td><td>~19.5M</td><td>5.5M</td><td>Lãi 14M</td></tr></table>
      <div style="background:#e6fffa;padding:20px;text-align:center;border:1px solid #38b2ac;border-radius:8px"><strong>🎯 Hòa vốn dự kiến: Tháng 4-5</strong></div>
      <script>window.onload=()=>window.print()</script></body></html>`;
    printWindow.document.write(htmlContent); printWindow.document.close();
  };

  const toggleAutoApprove = async () => {
    await setDoc(doc(db, 'settings', 'admin'), { autoApprove: !autoApprove }, { merge: true });
  };

  const isAdmin = profile?.role === 'admin' || profile?.email === 'congapro60@gmail.com';

  if (firebaseLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 text-center"><AlertCircle size={48} className="text-red-500 mx-auto mb-4" /><h2 className="text-2xl font-black">Truy cập bị từ chối</h2></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2"><ShieldCheck size={16} className="text-indigo-600" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hệ thống quản trị</span></div>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900">Bảng điều khiển</h1>
          </div>
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 gap-1 overflow-x-auto">
            {[
              { id: 'users', label: 'Người dùng', icon: UserCheck },
              { id: 'jobs', label: 'Công việc', icon: Briefcase },
              { id: 'messages', label: 'Tin nhắn', icon: MessageSquare },
              { id: 'ads', label: 'Quảng cáo', icon: Megaphone },
              { id: 'name_changes', label: 'Đổi tên', icon: UserCog },
              { id: 'applications', label: 'Đơn ứng tuyển', icon: ClipboardList },
              { id: 'financial', label: 'Tài chính', icon: PieChartIcon },
              { id: 'market', label: 'Thị trường', icon: TrendingUp },
            ].map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setFilter('pending'); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab !== 'financial' && activeTab !== 'market' && (
          <div className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center justify-between">
            <div className="relative w-full lg:max-w-md shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:border-indigo-600 outline-none shadow-sm" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
              <div className="flex items-center justify-between sm:justify-start gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-200 shrink-0">
                <div className="flex items-center gap-2"><Zap size={16} className={autoApprove ? "text-green-500" : "text-gray-400"} fill={autoApprove ? "currentColor" : "none"} /><span className="text-sm font-bold text-gray-700">Duyệt tự động</span></div>
                <button onClick={toggleAutoApprove} className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", autoApprove ? 'bg-green-500' : 'bg-gray-300')}><span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", autoApprove ? 'translate-x-6' : 'translate-x-1')} /></button>
              </div>
              <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 gap-1 shrink-0 min-w-max">
                {[
                  { id: 'all', label: 'Tất cả' },
                  ...(activeTab === 'applications' ? [{ id: 'parent', label: 'Qua Phụ huynh' }, { id: 'teacher', label: 'Qua Giáo viên' }] : [{ id: 'pending', label: 'Chờ duyệt' }, { id: 'verified', label: 'Đã duyệt' }, { id: 'rejected', label: 'Từ chối' }, { id: 'linkedin_pending', label: 'Chờ duyệt LinkedIn' }]),
                  ...(activeTab === 'users' ? [{ id: 'business', label: 'Doanh nghiệp' }, { id: 'school', label: 'Nhà trường' }, { id: 'teacher', label: 'Giáo viên' }, { id: 'ngo', label: 'NGO' }] : [])
                ].map((f) => (
                  <button key={f.id} onClick={() => setFilter(f.id as any)} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap", filter === f.id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')}>{f.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'users' || activeTab === 'name_changes') && <UserTab activeTab={activeTab} filter={filter} searchQuery={searchQuery} />}
        {(activeTab === 'jobs' || activeTab === 'ads' || activeTab === 'applications') && <ContentTab activeTab={activeTab} filter={filter} searchQuery={searchQuery} />}
        {activeTab === 'messages' && <SupportTab filter={filter} searchQuery={searchQuery} />}
        {activeTab === 'financial' && <FinancialTab financialTabMode={financialTabMode} setFinancialTabMode={setFinancialTabMode} simData={simData} setSimData={setSimData} financials={financials} realFinancials={realFinancials} surveyPricingData={surveyPricingData} handleExportBCTC={handleExportBCTC} handleExportSlides={handleExportSlides} handleExportPitchSummary={handleExportPitchSummary} formatVND={formatVND} />}
        {activeTab === 'market' && <MarketTab isAILoading={isAILoading} fetchMarketDataFromAI={fetchMarketDataFromAI} marketStats={marketStats} chartData={aiChartData || []} heatmapData={aiHeatmapData || []} aiLastUpdated={aiLastUpdated} />}
      </div>
    </div>
  );
}
