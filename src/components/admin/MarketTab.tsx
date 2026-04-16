import React from 'react';
import { BarChart2, Loader2, Sparkles, Users, Briefcase, ShieldCheck, Star } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface MarketTabProps {
  isAILoading: boolean;
  fetchMarketDataFromAI: () => void;
  marketStats: any;
  chartData: any[];
  heatmapData: any[];
  aiLastUpdated: Date | null;
}

export default function MarketTab({
  isAILoading,
  fetchMarketDataFromAI,
  marketStats,
  chartData,
  heatmapData,
  aiLastUpdated
}: MarketTabProps) {
  return (
    <div className="space-y-6">
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
