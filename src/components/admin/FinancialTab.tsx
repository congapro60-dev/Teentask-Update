import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Eye, Megaphone, Download, CheckCircle2, AlertCircle, Briefcase as BriefcaseIcon, Zap as ZapIcon, ClipboardList } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '../../lib/utils';

interface FinancialTabProps {
  financialTabMode: 'realtime' | 'simulator';
  setFinancialTabMode: (mode: 'realtime' | 'simulator') => void;
  simData: any;
  setSimData: (data: any) => void;
  financials: any;
  realFinancials: any;
  surveyPricingData: any;
  handleExportBCTC: () => void;
  handleExportSlides: () => void;
  handleExportPitchSummary: () => void;
  formatVND: (amount: number) => string;
}

const COLORS = ['#4F46E5', '#8B5CF6', '#EC4899', '#10B981']; // Thêm màu Emerald cho Tài trợ

export default function FinancialTab({
  financialTabMode,
  setFinancialTabMode,
  simData,
  setSimData,
  financials,
  realFinancials,
  surveyPricingData,
  handleExportBCTC,
  handleExportSlides,
  handleExportPitchSummary,
  formatVND
}: FinancialTabProps) {
  return (
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
              onClick={handleExportPitchSummary} 
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
            >
              📊 Xuất Tóm tắt Pitch
            </button>
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
                      {realFinancials.revenueBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatVND(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 mt-4">
                {realFinancials.revenueBreakdown.map((item: any, idx: number) => (
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
            <div className="space-y-6">
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

              <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-purple-500">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                  <Eye className="text-purple-500" size={20} />
                  Job Shadowing
                </h3>

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
                              {surveyPricingData.distribution.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#8B5CF6' : '#E5E7EB'} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1">
                        {surveyPricingData.distribution.map((item: any, idx: number) => (
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
                      onClick={() => setSimData((prev: any) => ({ ...prev, avgTicketPrice: surveyPricingData.avgValue }))}
                      className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Áp dụng vào Simulator
                    </button>

                    <div className="mt-6 space-y-4 pt-4 border-t border-purple-100">
                      <h4 className="text-xs font-black text-purple-900 uppercase tracking-widest">Chi tiết ngân sách chi trả</h4>
                      
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Học sinh (Khóa học kỹ năng)</p>
                        {surveyPricingData.studentCourseBudget.map((item: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-gray-600">{item.name}</span>
                              <span className="font-bold text-indigo-600">{item.value}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full" style={{ width: `${item.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Phụ huynh (Ngân sách tháng)</p>
                        {surveyPricingData.parentMonthlyBudget.map((item: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-gray-600">{item.name}</span>
                              <span className="font-bold text-emerald-600">{item.value}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${item.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Doanh nghiệp (Phí tuyển dụng)</p>
                        {surveyPricingData.businessRecruitmentBudget.map((item: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-gray-600">{item.name}</span>
                              <span className="font-bold text-pink-600">{item.value}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                              <div className="bg-pink-500 h-full" style={{ width: `${item.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] text-center text-purple-400 mt-4">
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

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                <h3 className="font-black text-sm text-slate-800 mb-1">📋 Cấu trúc chi phí thực tế</h3>
                <p className="text-[10px] text-gray-500 mb-3">Tham khảo khi điều chỉnh slider</p>
                
                <div className="bg-white rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Fixed costs (hosting, tools, email...)</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pl-4">
                    <span>→ Tham khảo:</span>
                    <span>~1,300,000đ/tháng</span>
                  </div>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <div className="flex justify-between">
                    <span>Variable costs (ads, sự kiện, incentive)</span>
                  </div>
                         <div className="flex justify-between font-bold text-slate-800 pt-1">
                    <span>💡 Tổng thực tế giai đoạn đầu:</span>
                    <span>~5,000,000đ/tháng</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 italic mt-3">
                  Giá trị trên chỉ để tham khảo. Dùng slider 'Chi phí cố định' bên dưới để điều chỉnh.
                </p>
              </div>

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

              {/* THÊM slider mới: Tài trợ/tháng (VND) */}
              <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-emerald-500">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                  <span className="text-emerald-500 text-xl">🤝</span>
                  Tài trợ/tháng (VND)
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                      <span>Mức tài trợ</span>
                      <span className="text-emerald-600 font-bold">{formatVND(simData.sponsorshipPerMonth)}</span>
                    </div>
                    <input 
                      type="range"
                      min={0}
                      max={30000000}
                      step={1000000}
                      value={simData.sponsorshipPerMonth}
                      onChange={(e) => setSimData({
                        ...simData, 
                        sponsorshipPerMonth: Number(e.target.value)
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 italic">
                    BDH trường, doanh nghiệp đối tác (0 = chưa có tài trợ)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
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
                        {financials.revenueBreakdown.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatVND(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-4">
                  {financials.revenueBreakdown.map((item: any, idx: number) => (
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

              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="font-bold text-indigo-100 mb-2">💰 Tổng doanh thu</h3>
                <div className="text-3xl font-black">{formatVND(financials.totalRevenue)}</div>
                <div className="text-sm text-indigo-200 mt-1">mỗi tháng (dự kiến)</div>
              </div>

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

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mt-6">
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

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 mt-6">
            <h3 className="font-black text-lg mb-1">📈 Dự báo thực tế theo giai đoạn</h3>
            <p className="text-xs text-gray-500 mb-4">Dựa trên hệ thống 3 gói Job Shadowing mới</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Giai đoạn</th>
                    <th className="pb-2 font-medium">Doanh thu</th>
                    <th className="pb-2 font-medium">Chi phí</th>
                    <th className="pb-2 font-medium">Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-red-50/50 border-b border-white">
                    <td className="py-3 px-2 font-bold text-gray-700">Tháng 1–3</td>
                    <td className="py-3 px-2">~3,245,000đ</td>
                    <td className="py-3 px-2">5,000,000đ</td>
                    <td className="py-3 px-2 font-bold text-red-600">🔴 Lỗ 1,755,000đ</td>
                  </tr>
                  <tr className="bg-emerald-50/50 border-b border-white">
                    <td className="py-3 px-2 font-bold text-gray-700">Tháng 4–6</td>
                    <td className="py-3 px-2">~8,700,000đ</td>
                    <td className="py-3 px-2">5,000,000đ</td>
                    <td className="py-3 px-2 font-bold text-emerald-600">🟢 Lãi 3,700,000đ</td>
                  </tr>
                  <tr className="bg-emerald-100/50">
                    <td className="py-3 px-2 font-bold text-gray-700">Tháng 7–12</td>
                    <td className="py-3 px-2">~19,525,000đ</td>
                    <td className="py-3 px-2">5,500,000đ</td>
                    <td className="py-3 px-2 font-bold text-emerald-700">🚀 Lãi 14,025,000đ</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col items-center">
              <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-2">
                ✅ Break-even dự kiến: Tháng 4–5
              </div>
              <p className="text-[10px] text-gray-400 text-center italic">
                Số liệu tham khảo. Dùng simulator bên trên để tính toán theo số liệu thực tế của bạn.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
