import React from 'react';
import { BarChart2, Loader2, Sparkles, Users, Briefcase, ShieldCheck, Star, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from '../../lib/utils';

interface MarketTabProps {
  isAILoading: boolean;
  fetchMarketDataFromAI: () => void;
  marketStats: any;
  chartData: any[];
  heatmapData: any[];
  aiLastUpdated: Date | null;
  landingPageStats?: any;
}

export default function MarketTab({
  isAILoading,
  fetchMarketDataFromAI,
  marketStats,
  chartData,
  heatmapData,
  aiLastUpdated,
  landingPageStats
}: MarketTabProps) {
  return (
    <div className="space-y-6 pb-20">
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

      {landingPageStats && (
        <section className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-indigo-50/50 mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -mr-20 -mt-20" />
          
          <div className="flex items-center gap-4 mb-8 relative">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Real-time Landing Page Insights</h3>
              <p className="text-sm text-gray-500 font-medium">Phân tích từ {landingPageStats.totalResponses} khảo sát khách vãng lai</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Key Presentation Metrics */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-100 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-black opacity-80 uppercase tracking-tighter mb-1">Ease-of-use</div>
                <div className="text-4xl font-black">{landingPageStats.avgEaseOfUse}</div>
                <div className="text-[10px] font-bold mt-1 opacity-70">Thang điểm 5.0</div>
              </div>
              <div className="bg-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-purple-100 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-black opacity-80 uppercase tracking-tighter mb-1">NPS (Recommend)</div>
                <div className="text-4xl font-black">{landingPageStats.npsScore}</div>
                <div className="text-[10px] font-bold mt-1 opacity-70">Thang điểm 10</div>
              </div>
              <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-lg shadow-emerald-100 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-black opacity-80 uppercase tracking-tighter mb-1">Service Match</div>
                <div className="text-4xl font-black">{landingPageStats.meetsNeedRate}%</div>
                <div className="text-[10px] font-bold mt-1 opacity-70">Đáp ứng nhu cầu</div>
              </div>
              <div className="bg-amber-500 rounded-3xl p-6 text-white shadow-lg shadow-amber-100 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-black opacity-80 uppercase tracking-tighter mb-1">Parent Choice</div>
                <div className="text-4xl font-black">{landingPageStats.parentPayingRate}%</div>
                <div className="text-[10px] font-bold mt-1 opacity-70">Sẵn sàng chi trả</div>
              </div>
            </div>

            {/* Roles Distribution */}
            <div className="bg-white/60 rounded-3xl p-6 border border-white/80 shadow-sm">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Cơ cấu đối tượng vãng lai</h4>
              <div className="space-y-4">
                {landingPageStats.roles.map((role: any) => (
                  <div key={role.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        role.name === 'student' ? 'bg-blue-500' : role.name === 'parent' ? 'bg-purple-500' : 'bg-amber-500'
                      )} />
                      <span className="text-sm font-bold text-gray-700 capitalize">
                        {role.name === 'student' ? 'Học sinh' : role.name === 'parent' ? 'Phụ huynh' : 'Doanh nghiệp'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-gray-900">
                      {Math.round((role.value / landingPageStats.totalResponses) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                {landingPageStats.roles.map((role: any) => (
                  <div 
                    key={role.name}
                    className={cn(
                      "h-full",
                      role.name === 'student' ? 'bg-blue-500' : role.name === 'parent' ? 'bg-purple-500' : 'bg-amber-500'
                    )}
                    style={{ width: `${(role.value / landingPageStats.totalResponses) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Top Student Interests */}
            <div className="bg-white/60 rounded-3xl p-6 border border-white/80 shadow-sm">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 underline decoration-blue-200 decoration-2 underline-offset-4">Top khao khát (Học sinh)</h4>
              <div className="space-y-4">
                {landingPageStats.studentNeeds.map(([name, value]: any, idx: number) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xs font-black text-blue-400 w-4 italic">0{idx + 1}</span>
                    <span className="text-sm font-bold text-gray-700 flex-1">{name}</span>
                    <span className="text-xs font-black text-gray-400">{value} lượt</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Business Needs */}
            <div className="bg-white/60 rounded-3xl p-6 border border-white/80 shadow-sm">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 underline decoration-amber-200 decoration-2 underline-offset-4">Nhu cầu Doanh nghiệp</h4>
              <div className="space-y-4">
                {landingPageStats.businessNeeds.map(([name, value]: any, idx: number) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xs font-black text-amber-400 w-4 italic">0{idx + 1}</span>
                    <span className="text-sm font-bold text-gray-700 flex-1">{name}</span>
                    <span className="text-xs font-black text-gray-400">{value} lượt</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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
  );
}
