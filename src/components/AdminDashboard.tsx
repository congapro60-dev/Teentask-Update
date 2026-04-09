import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, UserCheck, UserX, Search, Filter, Clock, CheckCircle2, XCircle, AlertCircle, Eye, X, Briefcase, MessageSquare, Megaphone, Send, UserCog, Zap, PieChart as PieChartIcon, Download, TrendingUp, MapPin, Star, Users, BarChart2, Sparkles, Loader2, Scale, Award, Shield, Zap as ZapIcon, ClipboardList } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, addDoc, orderBy, limit, getDoc, setDoc } from 'firebase/firestore';
import { db, useFirebase } from './FirebaseProvider';
import { Job, Advertisement } from '../types';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from '@google/genai';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function AdminDashboard() {
  const { profile, loading: firebaseLoading } = useFirebase();
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'messages' | 'ads' | 'transactions' | 'name_changes' | 'financial' | 'market'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [nameChangeRequests, setNameChangeRequests] = useState<any[]>([]);
  const [shadowingBookings, setShadowingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected' | 'approved'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [selectedNameChange, setSelectedNameChange] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [financialTabMode, setFinancialTabMode] = useState<'realtime' | 'simulator'>('realtime');
  
  // AI Market Insight states
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiChartData, setAiChartData] = useState<any[] | null>(null);
  const [aiHeatmapData, setAiHeatmapData] = useState<any[] | null>(null);
  const [aiLastUpdated, setAiLastUpdated] = useState<Date | null>(null);

  // AI Competitors states
  const [isAICompetitorLoading, setIsAICompetitorLoading] = useState(false);
  const [aiCompetitorData, setAiCompetitorData] = useState<any[] | null>(null);
  const [aiCompetitorLastUpdated, setAiCompetitorLastUpdated] = useState<Date | null>(null);

  // Survey Data for Financial Simulator
  const [surveyPricingData, setSurveyPricingData] = useState<{
    distribution: { name: string; value: number }[];
    popularPrice: string;
    popularPercentage: number;
    totalResponses: number;
    avgValue: number;
  } | null>(null);

  useEffect(() => {
    const fetchSurveyPricing = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'market_surveys'));
        if (!snapshot.empty) {
          const total = snapshot.size;
          const counts: Record<string, number> = {
            'Có, nếu chất lượng tốt': 0,
            'Không, tôi chỉ muốn miễn phí': 0
          };

          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.payForShadowing) {
              counts[data.payForShadowing] = (counts[data.payForShadowing] || 0) + 1;
            }
          });

          const distribution = [
            { name: 'Sẵn sàng trả phí', value: Math.round((counts['Có, nếu chất lượng tốt'] / total) * 100) || 0 },
            { name: 'Chỉ muốn miễn phí', value: Math.round((counts['Không, tôi chỉ muốn miễn phí'] / total) * 100) || 0 }
          ];

          const popularPrice = counts['Có, nếu chất lượng tốt'] > counts['Không, tôi chỉ muốn miễn phí'] 
            ? 'Có, nếu chất lượng tốt' 
            : 'Không, tôi chỉ muốn miễn phí';
          
          const popularPercentage = Math.round((counts[popularPrice] / total) * 100) || 0;

          // Estimate average ticket price based on willingness to pay
          // If they are willing to pay, we assume a base ticket price of 300k
          const avgValue = popularPrice === 'Có, nếu chất lượng tốt' ? 300000 : 0;

          setSurveyPricingData({
            distribution,
            popularPrice,
            popularPercentage,
            totalResponses: total,
            avgValue
          });
        }
      } catch (error) {
        console.error("Error fetching survey pricing:", error);
      }
    };

    fetchSurveyPricing();
  }, []);

  // Thêm state cho simulator tài chính
  const [simData, setSimData] = useState({
    jobsPerMonth: 100,        // Số job mới/tháng
    jobSuccessRate: 30,       // % job thành công
    avgSalary: 500000,        // Lương TB mỗi job (VND)
    jobCommission: 10,        // % hoa hồng sàn việc làm
    shadowingPerMonth: 50,    // Số suất kiến tập/tháng
    avgTicketPrice: 300000,   // Giá vé TB (VND)
    shadowingCommission: 15,  // % hoa hồng Job Shadowing
    bannersPerMonth: 5,       // Số banner/tháng
    bannerFee: 2000000,       // Phí banner (VND)
    premiumPosts: 20,         // Số tin Premium/tháng
    premiumFee: 200000,       // Phí tin Premium (VND)
    fixedCost: 2000000,       // Chi phí cố định (VND)
  });

  // Hàm tính toán tài chính (tự động cập nhật khi simData thay đổi)
  const financials = useMemo(() => {
    const jobRevenue = simData.jobsPerMonth * (simData.jobSuccessRate / 100) 
      * simData.avgSalary * (simData.jobCommission / 100);
    const shadowingRevenue = simData.shadowingPerMonth 
      * simData.avgTicketPrice * (simData.shadowingCommission / 100);
    const adRevenue = (simData.bannersPerMonth * simData.bannerFee) 
      + (simData.premiumPosts * simData.premiumFee);
    const totalRevenue = jobRevenue + shadowingRevenue + adRevenue;
    const fixedCost = simData.fixedCost; // Sử dụng chi phí cố định từ simData
    const profit = totalRevenue - fixedCost;
    const breakEvenJobs = Math.ceil(fixedCost / 
      (simData.avgSalary * simData.jobCommission / 100));
    
    // Dữ liệu 12 tháng với tăng trưởng 15%/tháng
    const monthlyData = Array.from({length: 12}, (_, i) => ({
      month: `T${i+1}`,
      revenue: Math.round(totalRevenue * Math.pow(1.15, i)),
      cost: fixedCost
    }));

    const revenueBreakdown = [
      { name: 'Việc làm', value: jobRevenue },
      { name: 'Shadowing', value: shadowingRevenue },
      { name: 'Quảng cáo', value: adRevenue }
    ].filter(item => item.value > 0);
    
    return { jobRevenue, shadowingRevenue, adRevenue, 
             totalRevenue, profit, fixedCost, breakEvenJobs, monthlyData, revenueBreakdown };
  }, [simData]);

  // Hàm tính toán dữ liệu thực tế từ database
  const realFinancials = useMemo(() => {
    // 1. Doanh thu từ Job (Giả định mỗi job được duyệt thu phí 100.000đ hoặc tính theo % lương nếu có)
    // Ở đây ta đếm số lượng job đã duyệt và nhân với một mức phí giả định (ví dụ 100k/job)
    const approvedJobsCount = jobs.filter(j => j.isApproved).length;
    const realJobRevenue = approvedJobsCount * 100000; 

    // 2. Doanh thu từ Job Shadowing (Giả định mỗi lượt booking thu hoa hồng 50.000đ)
    const shadowingBookingsCount = shadowingBookings.length;
    const realShadowingRevenue = shadowingBookingsCount * 50000;

    // 3. Doanh thu từ Quảng cáo (Giả định mỗi quảng cáo được duyệt thu phí 500.000đ)
    const approvedAdsCount = ads.filter(a => a.status === 'approved').length;
    const realAdRevenue = approvedAdsCount * 500000;

    const totalRevenue = realJobRevenue + realShadowingRevenue + realAdRevenue;
    const fixedCost = simData.fixedCost; // Mirror simulation fixed cost
    const profit = totalRevenue - fixedCost;

    const revenueBreakdown = [
      { name: 'Việc làm', value: realJobRevenue },
      { name: 'Shadowing', value: realShadowingRevenue },
      { name: 'Quảng cáo', value: realAdRevenue }
    ].filter(item => item.value > 0);

    return {
      approvedJobsCount,
      shadowingBookingsCount,
      approvedAdsCount,
      jobRevenue: realJobRevenue,
      shadowingRevenue: realShadowingRevenue,
      adRevenue: realAdRevenue,
      totalRevenue,
      profit,
      fixedCost,
      revenueBreakdown
    };
  }, [jobs, shadowingBookings, ads, simData.fixedCost]);

  // Hàm format tiền Việt Nam
  const formatVND = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const marketStats = useMemo(() => {
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalJobs = jobs.length;
    const approvalRate = jobs.length > 0 ? Math.round((jobs.filter(j => j.isApproved).length / jobs.length) * 100) : 0;
    const shadowingSold = shadowingBookings.length;

    return { totalStudents, totalJobs, approvalRate, shadowingSold };
  }, [users, jobs, shadowingBookings]);

  const chartData = aiChartData || [
    { name: 'Design', value: 45 },
    { name: 'Video/TikTok', value: 38 },
    { name: 'Event', value: 30 },
    { name: 'F&B', value: 25 },
    { name: 'Gia sư', value: 20 },
    { name: 'Lập trình', value: 15 },
  ];

  const heatmapData = aiHeatmapData || [
    { id: 1, city: 'TP.HCM', jobs: 1250, percentage: 100 },
    { id: 2, city: 'Hà Nội', jobs: 980, percentage: 78 },
    { id: 3, city: 'Đà Nẵng', jobs: 450, percentage: 36 },
    { id: 4, city: 'Bình Dương', jobs: 320, percentage: 25 },
    { id: 5, city: 'Cần Thơ', jobs: 150, percentage: 12 },
  ];

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

  const defaultPlatforms = [
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

  const platforms = aiCompetitorData || defaultPlatforms;

  const fetchMarketDataFromAI = async () => {
    if (!process.env.GEMINI_API_KEY) {
      alert('Vui lòng cấu hình GEMINI_API_KEY trong biến môi trường.');
      return;
    }
    
    setIsAILoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Bạn là một chuyên gia nghiên cứu thị trường việc làm tại Việt Nam.
        Hãy cung cấp dữ liệu thị trường thực tế mới nhất (hoặc ước tính sát thực tế nhất) về nhu cầu việc làm part-time, freelance dành cho học sinh/sinh viên (Gen Z) tại Việt Nam.
        
        Trả về DUY NHẤT một chuỗi JSON hợp lệ với cấu trúc sau (không kèm markdown, không kèm text giải thích):
        {
          "chartData": [
            { "name": "Tên kỹ năng (ngắn gọn)", "value": phần_trăm_nhu_cầu_từ_0_đến_100 }
            // Trả về đúng 6 kỹ năng top đầu
          ],
          "heatmapData": [
            { "id": 1, "city": "Tên tỉnh/thành", "jobs": số_lượng_job_ước_tính, "percentage": phần_trăm_so_với_top_1_từ_0_đến_100 }
            // Trả về đúng 5 tỉnh/thành phố top đầu
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text;
      if (text) {
        // Clean up markdown if AI still returns it
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);
        
        if (data.chartData && data.heatmapData) {
          setAiChartData(data.chartData);
          setAiHeatmapData(data.heatmapData);
          setAiLastUpdated(new Date());
        }
      }
    } catch (error) {
      console.error('Error fetching AI market data:', error);
      alert('Có lỗi xảy ra khi lấy dữ liệu từ AI. Vui lòng thử lại sau.');
    } finally {
      setIsAILoading(false);
    }
  };

  const fetchCompetitorDataFromAI = async () => {
    if (!process.env.GEMINI_API_KEY) {
      alert('Vui lòng cấu hình GEMINI_API_KEY trong biến môi trường.');
      return;
    }
    
    setIsAICompetitorLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Bạn là một chuyên gia phân tích thị trường việc làm tại Việt Nam.
        Hãy đánh giá và so sánh 4 nền tảng tìm việc: "TeenTask", "TopCV", "Việc làm tốt", "Facebook Groups" dựa trên 8 tiêu chí sau dành cho đối tượng học sinh 14-18 tuổi.
        
        Sử dụng các ký hiệu:
        "✅" (Có / Tốt)
        "❌" (Không có / Kém)
        "⚠️" (Có một phần / Trung bình)

        Lưu ý: TeenTask là nền tảng chuyên biệt cho học sinh 14-18 tuổi, bắt buộc xác minh phụ huynh, có Job Shadowing, tuân thủ luật lao động, có Teen CV, đánh giá 2 chiều và miễn phí cho học sinh. Hãy đánh giá TeenTask full ✅. Các nền tảng khác đánh giá khách quan theo thực tế.

        Trả về DUY NHẤT một chuỗi JSON hợp lệ với cấu trúc sau (không kèm markdown, không kèm text giải thích):
        [
          { 
            "name": "TeenTask", 
            "isHighlight": true,
            "data": ["✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅"] 
          },
          { 
            "name": "TopCV", 
            "isHighlight": false,
            "data": ["❌", "❌", "❌", "✅", "⚠️", "❌", "✅", "❌"] 
          },
          { 
            "name": "Việc làm tốt", 
            "isHighlight": false,
            "data": ["❌", "❌", "❌", "✅", "⚠️", "❌", "⚠️", "❌"] 
          },
          { 
            "name": "Facebook Groups", 
            "isHighlight": false,
            "data": ["❌", "❌", "❌", "❌", "❌", "❌", "❌", "✅"] 
          }
        ]
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text;
      if (text) {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);
        
        if (Array.isArray(data) && data.length > 0) {
          setAiCompetitorData(data);
          setAiCompetitorLastUpdated(new Date());
        }
      }
    } catch (error) {
      console.error('Error fetching AI competitor data:', error);
      alert('Có lỗi xảy ra khi lấy dữ liệu từ AI. Vui lòng thử lại sau.');
    } finally {
      setIsAICompetitorLoading(false);
    }
  };

  // Thêm style cho print
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        .financial-content, .financial-content * { visibility: visible; }
        .financial-content { position: absolute; left: 0; top: 0; width: 100%; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const BOSS_EMAIL = "congapro60@gmail.com";
  const ADMIN_EMAIL = "cuong.vuviet@thedeweyschools.edu.vn";
  const userEmailLower = profile?.email?.toLowerCase();
  const isBoss = userEmailLower === BOSS_EMAIL.toLowerCase();
  const isAdmin = (profile?.role === 'admin' && profile?.isVerified) || userEmailLower === ADMIN_EMAIL.toLowerCase() || isBoss;

  useEffect(() => {
    if (firebaseLoading || !isAdmin) return;
    
    // Fetch settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'admin'), (doc) => {
      if (doc.exists()) {
        setAutoApprove(doc.data().autoApprove || false);
      }
    });

    setLoading(true);
    const unsubUsers = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error in users listener:", error);
    });

    const unsubJobs = onSnapshot(query(collection(db, 'jobs')), (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
    }, (error) => {
      console.error("Error in jobs listener:", error);
    });

    const unsubAds = onSnapshot(query(collection(db, 'advertisements')), (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advertisement)));
    }, (error) => {
      console.error("Error in ads listener:", error);
    });

    const unsubMessages = onSnapshot(query(collection(db, 'support_messages'), orderBy('createdAt', 'desc')), (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error in messages listener:", error);
    });

    const unsubTransactions = onSnapshot(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')), (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error in transactions listener:", error);
    });

    const unsubNameChanges = onSnapshot(query(collection(db, 'name_change_requests'), orderBy('createdAt', 'desc')), (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNameChangeRequests(requests);
      
      // Auto-approve logic
      if (autoApprove) {
        requests.forEach(async (req: any) => {
          if (req.status === 'pending') {
            await handleApproveNameChange(req.id, 'approved', req.newName, req.userId);
          }
        });
      }
    }, (error) => {
      console.error("Error in name changes listener:", error);
    });

    const unsubShadowingBookings = onSnapshot(query(collection(db, 'shadowing_bookings')), (snapshot) => {
      setShadowingBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error in shadowing bookings listener:", error);
    });

    setLoading(false);
    return () => {
      unsubSettings();
      unsubUsers();
      unsubJobs();
      unsubAds();
      unsubMessages();
      unsubTransactions();
      unsubNameChanges();
      unsubShadowingBookings();
    };
  }, [firebaseLoading, isAdmin, autoApprove]);

  const toggleAutoApprove = async () => {
    try {
      await setDoc(doc(db, 'settings', 'admin'), { autoApprove: !autoApprove }, { merge: true });
    } catch (error) {
      console.error("Error toggling auto-approve:", error);
    }
  };

  const handleExportBCTC = async () => {
    const element = document.querySelector('.financial-content') as HTMLElement;
    if (!element) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F8FAFC'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BCTC_TeenTask_${financialTabMode === 'realtime' ? 'ThucTe' : 'MoPhong'}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error("Error exporting BCTC:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo tài chính.");
    }
  };

  const handleExportSlides = async () => {
    const content = document.querySelector('.financial-content') as HTMLElement;
    if (!content) return;

    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f3f4f6'
      });

      const imgData = canvas.toDataURL('image/png');
      // Use landscape orientation for slides (16:9 aspect ratio roughly)
      const pdf = new jsPDF('l', 'mm', [297, 167]); 
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Slide_TeenTask_${financialTabMode === 'realtime' ? 'ThucTe' : 'MoPhong'}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error("Error exporting Slides:", error);
      alert("Có lỗi xảy ra khi xuất slide trình chiếu.");
    }
  };

  const handleVerify = async (userId: string, status: 'verified' | 'rejected') => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        verificationStatus: status,
        isVerified: status === 'verified'
      });
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating verification status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveJob = async (jobId: string, status: boolean) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'jobs', jobId), { isApproved: status });
      setSelectedJob(null);
    } catch (error) {
      console.error("Error approving job:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAd = async (adId: string, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'advertisements', adId), { status });
      setSelectedAd(null);
    } catch (error) {
      console.error("Error approving ad:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveNameChange = async (requestId: string, status: 'approved' | 'rejected', newName: string, userId: string) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'name_change_requests', requestId), { 
        status,
        reviewedAt: Date.now()
      });
      
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', userId), { displayName: newName });
        
        // Send notification
        await addDoc(collection(db, 'notifications'), {
          userId,
          title: 'Yêu cầu đổi tên đã được phê duyệt',
          message: `Tên hiển thị của bạn đã được đổi thành "${newName}".`,
          type: 'system',
          read: false,
          createdAt: Date.now()
        });
      } else {
        // Send notification for rejection
        await addDoc(collection(db, 'notifications'), {
          userId,
          title: 'Yêu cầu đổi tên bị từ chối',
          message: 'Yêu cầu đổi tên của bạn không được phê duyệt. Vui lòng kiểm tra lại minh chứng.',
          type: 'system',
          read: false,
          createdAt: Date.now()
        });
      }
      setSelectedNameChange(null);
    } catch (error) {
      console.error("Error approving name change:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setActionLoading(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: selectedMessage.userId,
        title: 'Phản hồi từ quản trị viên',
        message: replyText,
        type: 'message',
        read: false,
        createdAt: Date.now()
      });
      await updateDoc(doc(db, 'support_messages', selectedMessage.id), {
        replied: true,
        replyText: replyText,
        repliedAt: Date.now()
      });
      setReplyText('');
      setSelectedMessage(null);
      alert('Đã gửi phản hồi!');
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredData = () => {
    if (activeTab === 'users') {
      return users.filter(user => {
        const matchesFilter = filter === 'all' || user.verificationStatus === filter;
        const matchesSearch = !searchQuery || 
                             ((user.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase())) ||
                             ((user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
      });
    } else if (activeTab === 'jobs') {
      return jobs.filter(job => {
        const matchesFilter = filter === 'all' || (filter === 'pending' ? !job.isApproved : job.isApproved);
        const matchesSearch = !searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      });
    } else if (activeTab === 'ads') {
      return ads.filter(ad => {
        const matchesFilter = filter === 'all' || ad.status === filter;
        const matchesSearch = !searchQuery || ad.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      });
    } else if (activeTab === 'name_changes') {
      return nameChangeRequests.filter(req => {
        const matchesFilter = filter === 'all' || req.status === filter;
        const matchesSearch = !searchQuery || 
                             req.newName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             req.currentName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      });
    } else {
      return messages.filter(msg => {
        const matchesFilter = filter === 'all' || (filter === 'pending' ? !msg.replied : msg.replied);
        const matchesSearch = !searchQuery || msg.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      });
    }
  };

  if (firebaseLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-500">Bạn không có quyền truy cập vào trang quản trị này.</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#4F46E5', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-[#4F46E5]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hệ thống quản trị</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900">Bảng điều khiển</h1>
          </div>

          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 gap-1 overflow-x-auto">
            {[
              { id: 'users', label: 'Người dùng', icon: UserCheck },
              { id: 'jobs', label: 'Công việc', icon: Briefcase },
              { id: 'messages', label: 'Tin nhắn', icon: MessageSquare },
              { id: 'ads', label: 'Quảng cáo', icon: Megaphone },
              { id: 'name_changes', label: 'Đổi tên', icon: UserCog },
              { id: 'financial', label: 'Tài chính', icon: PieChartIcon },
              { id: 'market', label: 'Thị trường', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setFilter('pending'); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-100' 
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab !== 'financial' && activeTab !== 'market' && (
          <>
            <div className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center justify-between">
              <div className="relative w-full lg:max-w-md shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all shadow-sm"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
                <div className="flex items-center justify-between sm:justify-start gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-200 shrink-0">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className={autoApprove ? "text-green-500" : "text-gray-400"} fill={autoApprove ? "currentColor" : "none"} />
                    <span className="text-sm font-bold text-gray-700">Duyệt tự động</span>
                  </div>
                  <button
                    onClick={toggleAutoApprove}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                      autoApprove ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      autoApprove ? 'translate-x-6' : 'translate-x-1'
                    )} />
                  </button>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 gap-1 shrink-0 min-w-max">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'pending', label: 'Chờ duyệt' },
                    { id: 'verified', label: 'Đã duyệt' },
                    { id: 'rejected', label: 'Từ chối' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as any)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                        filter === f.id 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {activeTab === 'users' && filteredData().map((user: any) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4">
                    <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-2xl object-cover border border-gray-100" referrerPolicy="no-referrer" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{user.displayName}</h3>
                        {user.isVip && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[8px] font-black rounded-full uppercase tracking-widest border border-yellow-200">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.role}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    user.verificationStatus === 'verified' ? 'bg-green-50 text-green-600 border-green-100' :
                    user.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    user.verificationStatus === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-gray-50 text-gray-500 border-gray-100'
                  }`}>
                    {user.verificationStatus === 'verified' ? 'Đã duyệt' :
                     user.verificationStatus === 'pending' ? 'Chờ duyệt' :
                     user.verificationStatus === 'rejected' ? 'Từ chối' : 'Chưa gửi'}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> Chi tiết
                  </button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'jobs' && filteredData().map((job: any) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{job.title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{job.businessName}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    job.isApproved ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {job.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> Chi tiết
                  </button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'ads' && filteredData().map((ad: any) => (
              <motion.div
                key={ad.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{ad.title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{ad.businessName}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    ad.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                    ad.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {ad.status === 'approved' ? 'Đã duyệt' : ad.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                  </div>
                </div>
                <img src={ad.imageUrl} className="w-full h-32 object-cover rounded-2xl mb-4" alt="" referrerPolicy="no-referrer" />
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedAd(ad)}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> Chi tiết
                  </button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'messages' && filteredData().map((msg: any) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{msg.userName}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(msg.createdAt).toLocaleString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    msg.replied ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {msg.replied ? 'Đã trả lời' : 'Chưa trả lời'}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{msg.message}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedMessage(msg)}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={14} /> {msg.replied ? 'Xem lại' : 'Trả lời'}
                  </button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'name_changes' && filteredData().map((req: any) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{req.currentName} → {req.newName}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    req.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 
                    req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {req.status === 'approved' ? 'Đã duyệt' : req.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">Lí do: {req.reason}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedNameChange(req)}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> Chi tiết
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

            {filteredData().length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold">Không có mục nào cần xử lý</p>
              </div>
            )}
          </>
        )}

        {/* Tab Tài chính */}
        {activeTab === 'financial' && (
          <div className="financial-content space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-black text-gray-900">
                {financialTabMode === 'realtime' ? 'Thống kê Thực tế' : 'Mô phỏng Tài chính'}
              </h2>
              
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-1 rounded-xl flex">
                  <button
                    onClick={() => setFinancialTabMode('realtime')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      financialTabMode === 'realtime' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    Thực tế
                  </button>
                  <button
                    onClick={() => setFinancialTabMode('simulator')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      financialTabMode === 'simulator' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    Mô phỏng
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleExportSlides} 
                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-bold hover:bg-amber-100 transition-colors"
                  >
                    <Download size={16} /> Xuất Slide
                  </button>
                  <button 
                    onClick={handleExportBCTC} 
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                  >
                    <Download size={16} /> Xuất BCTC
                  </button>
                </div>
              </div>
            </div>

            {financialTabMode === 'realtime' ? (
              <div className="space-y-6">
                {/* Real-time Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-indigo-500">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Briefcase size={20} /></div>
                      <h3 className="font-bold text-gray-600">Sàn Việc Làm</h3>
                    </div>
                    <div className="text-2xl font-black text-gray-900 mb-1">{formatVND(realFinancials.jobRevenue)}</div>
                    <p className="text-sm text-gray-500">{realFinancials.approvedJobsCount} job đã duyệt</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-purple-500">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Eye size={20} /></div>
                      <h3 className="font-bold text-gray-600">Job Shadowing</h3>
                    </div>
                    <div className="text-2xl font-black text-gray-900 mb-1">{formatVND(realFinancials.shadowingRevenue)}</div>
                    <p className="text-sm text-gray-500">{realFinancials.shadowingBookingsCount} lượt booking</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-pink-500">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-pink-50 rounded-lg text-pink-600"><Megaphone size={20} /></div>
                      <h3 className="font-bold text-gray-600">Quảng cáo</h3>
                    </div>
                    <div className="text-2xl font-black text-gray-900 mb-1">{formatVND(realFinancials.adRevenue)}</div>
                    <p className="text-sm text-gray-500">{realFinancials.approvedAdsCount} quảng cáo</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
                    <h3 className="font-bold text-indigo-100 mb-2">💰 Tổng doanh thu</h3>
                    <div className="text-3xl font-black">{formatVND(realFinancials.totalRevenue)}</div>
                    <div className="text-sm text-indigo-200 mt-1">tính đến hiện tại</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card: Cơ cấu doanh thu thực tế */}
                  <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                    <h3 className="font-black text-lg mb-4">📊 Cơ cấu doanh thu thực tế</h3>
                    <div className="h-[250px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={realFinancials.revenueBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {realFinancials.revenueBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatVND(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4 mt-4">
                      {realFinancials.revenueBreakdown.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm font-bold mb-1">
                            <span className="text-gray-600">{item.name}</span>
                            <span className="text-indigo-600">{formatVND(item.value)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${realFinancials.totalRevenue > 0 ? (item.value / realFinancials.totalRevenue) * 100 : 0}%`,
                                backgroundColor: COLORS[idx % COLORS.length]
                              }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card: Lợi nhuận thực tế */}
                  <div className={cn(
                    "rounded-2xl shadow-sm p-5 border",
                    realFinancials.profit > 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  )}>
                    <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                      ⚖️ Lợi nhuận thực tế
                    </h3>
                    <div className="flex items-start gap-3 mb-3">
                      {realFinancials.profit > 0 ? (
                        <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
                      ) : (
                        <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                      )}
                      <div>
                        <div className={cn("font-bold text-lg", realFinancials.profit > 0 ? "text-green-800" : "text-red-800")}>
                          {realFinancials.profit > 0 ? "Đã có lợi nhuận!" : "Đang lỗ"}
                        </div>
                        <div className={cn("text-sm font-medium", realFinancials.profit > 0 ? "text-green-700" : "text-red-700")}>
                          {realFinancials.profit > 0 
                            ? `Lợi nhuận: ${formatVND(realFinancials.profit)}`
                            : `Lỗ: ${formatVND(Math.abs(realFinancials.profit))}`
                          }
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 italic">
                      * Dựa trên chi phí cố định {formatVND(realFinancials.fixedCost)}/tháng.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* CỘT TRÁI - Input Panel */}
                  <div className="space-y-6">
                {/* Nhóm A: Sàn Việc Làm */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-indigo-500">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                    <Briefcase className="text-indigo-500" size={20} />
                    Sàn Việc Làm
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>Số job mới/tháng</span>
                        <span className="text-indigo-600">{simData.jobsPerMonth}</span>
                      </div>
                      <input 
                        type="range" min="0" max="500" step="10" 
                        value={simData.jobsPerMonth}
                        onChange={(e) => setSimData({...simData, jobsPerMonth: Number(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>Tỷ lệ thành công (%)</span>
                        <span className="text-indigo-600">{simData.jobSuccessRate}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5" 
                        value={simData.jobSuccessRate}
                        onChange={(e) => setSimData({...simData, jobSuccessRate: Number(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lương trung bình (VND)</label>
                      <input 
                        type="number" step="100000"
                        value={simData.avgSalary}
                        onChange={(e) => setSimData({...simData, avgSalary: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>Hoa hồng TeenTask (%)</span>
                        <span className="text-indigo-600">{simData.jobCommission}%</span>
                      </div>
                      <input 
                        type="range" min="5" max="20" step="1" 
                        value={simData.jobCommission}
                        onChange={(e) => setSimData({...simData, jobCommission: Number(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Nhóm B: Job Shadowing */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-purple-500">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                    <Eye className="text-purple-500" size={20} />
                    Job Shadowing
                  </h3>

                  {/* Dữ liệu thực từ khảo sát */}
                  {surveyPricingData && (
                    <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                        <ClipboardList size={16} />
                        📋 Dữ liệu thực từ khảo sát người dùng
                      </h4>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-24 h-24 shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={surveyPricingData.distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={40}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {surveyPricingData.distribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 0 ? '#8B5CF6' : '#E5E7EB'} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => `${value}%`} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex-1">
                          {surveyPricingData.distribution.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs mb-1">
                              <span className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                                {item.name}
                              </span>
                              <span className="font-bold">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-purple-100 mb-3">
                        <p className="text-xs text-purple-800 font-medium leading-relaxed">
                          💡 Dựa trên khảo sát thực tế: <span className="font-bold">{surveyPricingData.popularPercentage}%</span> người dùng chọn <span className="font-bold">"{surveyPricingData.popularPrice}"</span>.
                        </p>
                      </div>

                      <button
                        onClick={() => setSimData(prev => ({ ...prev, avgTicketPrice: surveyPricingData.avgValue }))}
                        className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Áp dụng vào Simulator
                      </button>
                      <p className="text-[10px] text-center text-purple-400 mt-2">
                        Dựa trên {surveyPricingData.totalResponses} phản hồi khảo sát
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>Số suất/tháng</span>
                        <span className="text-purple-600">{simData.shadowingPerMonth}</span>
                      </div>
                      <input 
                        type="range" min="0" max="200" step="5" 
                        value={simData.shadowingPerMonth}
                        onChange={(e) => setSimData({...simData, shadowingPerMonth: Number(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giá vé trung bình (VND)</label>
                      <input 
                        type="number" step="50000"
                        value={simData.avgTicketPrice}
                        onChange={(e) => setSimData({...simData, avgTicketPrice: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>Hoa hồng (%)</span>
                        <span className="text-purple-600">{simData.shadowingCommission}%</span>
                      </div>
                      <input 
                        type="range" min="10" max="30" step="1" 
                        value={simData.shadowingCommission}
                        onChange={(e) => setSimData({...simData, shadowingCommission: Number(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Nhóm C: Quảng cáo & Tin đăng */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-pink-500">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                    <Megaphone className="text-pink-500" size={20} />
                    Quảng cáo & Tin đăng
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>Số banner/tháng</span>
                        <span className="text-pink-600">{simData.bannersPerMonth}</span>
                      </div>
                      <input 
                        type="range" min="0" max="20" step="1" 
                        value={simData.bannersPerMonth}
                        onChange={(e) => setSimData({...simData, bannersPerMonth: Number(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phí banner (VND)</label>
                      <input 
                        type="number" step="500000"
                        value={simData.bannerFee}
                        onChange={(e) => setSimData({...simData, bannerFee: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>Số tin Premium/tháng</span>
                        <span className="text-pink-600">{simData.premiumPosts}</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5" 
                        value={simData.premiumPosts}
                        onChange={(e) => setSimData({...simData, premiumPosts: Number(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phí tin Premium (VND)</label>
                      <input 
                        type="number" step="50000"
                        value={simData.premiumFee}
                        onChange={(e) => setSimData({...simData, premiumFee: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Nhóm D: Chi phí cố định */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-amber-500">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                    <ZapIcon className="text-amber-500" size={20} />
                    Chi phí cố định
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tổng chi phí cố định (VND/tháng)</label>
                      <input 
                        type="number" step="100000"
                        value={simData.fixedCost}
                        onChange={(e) => setSimData({...simData, fixedCost: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 italic">
                      Bao gồm: Hosting, Email API, Phí cổng thanh toán, Vận hành...
                    </p>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI - Output Panel */}
              <div className="space-y-6">
                {/* Card 1: Cơ cấu doanh thu */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                  <h3 className="font-black text-lg mb-4">📊 Cơ cấu doanh thu</h3>
                  <div className="h-[250px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={financials.revenueBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {financials.revenueBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatVND(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4 mt-4">
                    {financials.revenueBreakdown.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-gray-600">{item.name}</span>
                          <span className="text-indigo-600">{formatVND(item.value)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${financials.totalRevenue > 0 ? (item.value / financials.totalRevenue) * 100 : 0}%`,
                              backgroundColor: COLORS[idx % COLORS.length]
                            }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 2: Tổng doanh thu */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="font-bold text-indigo-100 mb-2">💰 Tổng doanh thu</h3>
                  <div className="text-3xl font-black">{formatVND(financials.totalRevenue)}</div>
                  <div className="text-sm text-indigo-200 mt-1">mỗi tháng (dự kiến)</div>
                </div>

                {/* Card 3: Chi phí cố định */}
                <div className="bg-amber-50 rounded-2xl shadow-sm p-5 border border-amber-100">
                  <h3 className="font-black text-lg mb-4 text-amber-900">🔧 Chi phí cố định</h3>
                  <div className="space-y-2 text-sm text-amber-800">
                    <div className="flex justify-between">
                      <span>Tổng chi phí vận hành:</span>
                      <span className="font-medium">{formatVND(financials.fixedCost)}</span>
                    </div>
                    <div className="pt-2 border-t border-amber-200 flex justify-between font-bold text-amber-900">
                      <span>Tổng:</span>
                      <span>{formatVND(financials.fixedCost)}/tháng</span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Điểm Hòa Vốn */}
                <div className={cn(
                  "rounded-2xl shadow-sm p-5 border",
                  financials.profit > 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                )}>
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                    ⚖️ Điểm Hòa Vốn (Break-even)
                  </h3>
                  <div className="flex items-start gap-3 mb-3">
                    {financials.profit > 0 ? (
                      <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
                    ) : (
                      <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                    )}
                    <div>
                      <div className={cn("font-bold text-lg", financials.profit > 0 ? "text-green-800" : "text-red-800")}>
                        {financials.profit > 0 ? "Đã vượt điểm hòa vốn!" : "Chưa đạt điểm hòa vốn"}
                      </div>
                      <div className={cn("text-sm font-medium", financials.profit > 0 ? "text-green-700" : "text-red-700")}>
                        {financials.profit > 0 
                          ? `Lợi nhuận dự kiến: ${formatVND(financials.profit)}/tháng`
                          : `Cần thêm: ${formatVND(Math.abs(financials.profit))}/tháng`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 italic">
                    * Cần tối thiểu {financials.breakEvenJobs} job thành công/tháng (với các thông số hiện tại) để hòa vốn.
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Dự báo 12 tháng */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-black text-lg mb-6">📈 Dự báo 12 tháng (Tăng trưởng 15%/tháng)</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financials.monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      tickFormatter={(v) => (v/1000000).toFixed(1) + 'M'}
                      dx={-10}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatVND(value), '']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" name="Doanh thu" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Chi phí cố định" dataKey="cost" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
          </div>
        )}

        {/* Tab Thị trường */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart2 size={32} className="text-indigo-600" />
                  <h2 className="text-2xl font-black text-gray-900">Thị trường & Dữ liệu</h2>
                </div>
                <p className="text-gray-500 font-medium">Dữ liệu thực tế từ cộng đồng TeenTask</p>
                <p className="text-xs text-gray-400 italic mt-1">
                  Cập nhật lúc: {aiLastUpdated ? aiLastUpdated.toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}
                </p>
              </div>
              <button
                onClick={fetchMarketDataFromAI}
                disabled={isAILoading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isAILoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Lấy dữ kiện thực tế (AI)
                  </>
                )}
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm">
                <div className="flex justify-end mb-4">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Users size={20} />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{marketStats.totalStudents.toLocaleString('vi-VN')}</div>
                <div className="text-sm font-bold text-gray-500">Học sinh đăng ký</div>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm">
                <div className="flex justify-end mb-4">
                  <div className="p-2 bg-pink-50 rounded-xl text-pink-600">
                    <Briefcase size={20} />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{marketStats.totalJobs.toLocaleString('vi-VN')}</div>
                <div className="text-sm font-bold text-gray-500">Job đã đăng</div>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm">
                <div className="flex justify-end mb-4">
                  <div className="p-2 bg-green-50 rounded-xl text-green-600">
                    <ShieldCheck size={20} />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{marketStats.approvalRate}%</div>
                <div className="text-sm font-bold text-gray-500">Tỷ lệ duyệt</div>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm">
                <div className="flex justify-end mb-4">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                    <Star size={20} />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{marketStats.shadowingSold.toLocaleString('vi-VN')}</div>
                <div className="text-sm font-bold text-gray-500">Shadowing đã bán</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6">Nhu cầu tìm việc theo kỹ năng</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value}%`, 'Nhu cầu']}
                      />
                      <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Heatmap */}
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6">Khu vực có nhu cầu cao nhất</h3>
                <div className="space-y-5">
                  {heatmapData.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-24 shrink-0 flex items-center gap-2">
                        <span className="text-xs font-black text-gray-400">#{index + 1}</span>
                        <span className="text-sm font-bold text-gray-700 truncate">{item.city}</span>
                      </div>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-indigo-600"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="w-12 shrink-0 text-right">
                        <span className="text-sm font-black text-gray-900">{item.jobs}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
            >
              <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
              <div className="flex items-start gap-6 mb-8">
                <img src={selectedUser.photoURL} alt="" className="w-20 h-20 rounded-3xl object-cover border-4 border-gray-50" referrerPolicy="no-referrer" />
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-gray-900">{selectedUser.displayName}</h2>
                  <p className="text-gray-500 font-medium">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 bg-indigo-50 text-[#4F46E5] rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Thông tin xác thực</h3>
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Họ tên:</span>
                      <span className="font-bold text-gray-900">{selectedUser.fullName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Số CMT/CCCD:</span>
                      <span className="font-bold text-gray-900">{selectedUser.idNumber || 'N/A'}</span>
                    </div>
                    {/* ... other fields ... */}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Ảnh giấy tờ</h3>
                  <div className="aspect-[3/2] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                    {selectedUser.idCardPhoto && <img src={selectedUser.idCardPhoto} alt="ID Card" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                  </div>
                </div>
              </div>
              {selectedUser.verificationStatus === 'pending' && (
                <div className="flex gap-4">
                  <button onClick={() => handleVerify(selectedUser.id, 'rejected')} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black">TỪ CHỐI</button>
                  <button onClick={() => handleVerify(selectedUser.id, 'verified')} className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black">PHÊ DUYỆT</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <h2 className="text-2xl font-black mb-4">{selectedJob.title}</h2>
              <p className="text-gray-500 mb-6">{selectedJob.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Lương</p>
                  <p className="font-bold">{selectedJob.salary.toLocaleString()}đ</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Địa điểm</p>
                  <p className="font-bold">{selectedJob.location}</p>
                </div>
              </div>
              {!selectedJob.isApproved && (
                <div className="flex gap-4">
                  <button onClick={() => handleApproveJob(selectedJob.id, false)} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black">TỪ CHỐI</button>
                  <button onClick={() => handleApproveJob(selectedJob.id, true)} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black">PHÊ DUYỆT CÔNG VIỆC</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ad Detail Modal */}
      <AnimatePresence>
        {selectedAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setSelectedAd(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <h2 className="text-2xl font-black mb-4">{selectedAd.title}</h2>
              <img src={selectedAd.imageUrl} className="w-full h-64 object-cover rounded-3xl mb-6" alt="" referrerPolicy="no-referrer" />
              <p className="text-gray-500 mb-8">{selectedAd.description}</p>
              {selectedAd.status === 'pending' && (
                <div className="flex gap-4">
                  <button onClick={() => handleApproveAd(selectedAd.id, 'rejected')} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black">TỪ CHỐI</button>
                  <button onClick={() => handleApproveAd(selectedAd.id, 'approved')} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black">PHÊ DUYỆT QUẢNG CÁO</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Message Reply Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setSelectedMessage(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <h2 className="text-2xl font-black mb-2">Tin nhắn từ {selectedMessage.userName}</h2>
              <p className="text-gray-400 text-xs mb-6">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
              <div className="bg-gray-50 p-6 rounded-3xl mb-6">
                <p className="text-gray-700">{selectedMessage.message}</p>
              </div>
              {selectedMessage.replied ? (
                <div className="bg-indigo-50 p-6 rounded-3xl">
                  <p className="text-[10px] font-black text-[#4F46E5] uppercase mb-2">Phản hồi của bạn</p>
                  <p className="text-gray-700">{selectedMessage.replyText}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    className="w-full h-32 p-4 bg-gray-50 border-2 border-transparent rounded-3xl focus:border-indigo-100 outline-none transition-all"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={actionLoading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2"
                  >
                    <Send size={20} /> GỬI PHẢN HỒI
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Name Change Detail Modal */}
      <AnimatePresence>
        {selectedNameChange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setSelectedNameChange(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <h2 className="text-2xl font-black mb-2">Yêu cầu đổi tên</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Tên hiện tại</p>
                  <p className="font-bold">{selectedNameChange.currentName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Tên mới</p>
                  <p className="font-bold text-indigo-600">{selectedNameChange.newName}</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Lí do đổi tên</p>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-gray-700">{selectedNameChange.reason}</p>
                </div>
              </div>
              <div className="mb-8">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Minh chứng xác thực</p>
                <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden border border-gray-200">
                  <img src={selectedNameChange.proofUrl} className="w-full h-full object-cover" alt="Proof" referrerPolicy="no-referrer" />
                </div>
              </div>
              {selectedNameChange.status === 'pending' && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleApproveNameChange(selectedNameChange.id, 'rejected', selectedNameChange.newName, selectedNameChange.userId)} 
                    className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black"
                  >
                    TỪ CHỐI
                  </button>
                  <button 
                    onClick={() => handleApproveNameChange(selectedNameChange.id, 'approved', selectedNameChange.newName, selectedNameChange.userId)} 
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black"
                  >
                    PHÊ DUYỆT ĐỔI TÊN
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
