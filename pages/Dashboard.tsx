import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Clock, Search, FileText, LogOut, User, Plane, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'Agent001';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-primary-700 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-lg">
                 <Plane size={24} />
              </div>
              <span className="text-xl font-bold tracking-wide">新旅平險系統</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex items-center gap-2 text-sm bg-primary-800 px-4 py-1.5 rounded-full border border-primary-600">
                  <User size={16} />
                  <span>{user}</span>
               </div>
               <button 
                onClick={() => navigate('/')}
                className="p-2 text-primary-100 hover:text-white hover:bg-primary-600 rounded-full transition-colors"
                title="登出"
               >
                 <LogOut size={20} />
               </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
         <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">歡迎回來，{user}</h1>
            <p className="text-gray-500">請選擇下方功能開始作業</p>
         </div>

         {/* Action Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div 
              onClick={() => navigate('/wizard')}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10">
                  <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                    <PlusCircle size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">新契約受理</h3>
                  <p className="text-gray-500 leading-relaxed">開始建立新的旅遊平安險保單，支援機場投保與快速試算。</p>
               </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                       <Clock size={28} />
                     </div>
                     <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">3 筆待辦</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">暫存案件</h3>
                  <p className="text-gray-500 leading-relaxed">繼續編輯尚未送出的投保案件。</p>
               </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                    <Search size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">保單查詢</h3>
                  <p className="text-gray-500 leading-relaxed">查詢歷史保單狀態、內容及列印要保書。</p>
               </div>
            </div>
         </div>

         {/* Recent List */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-gray-400"/> 最近受理案件
              </h3>
              <span className="text-xs bg-white border border-gray-200 text-gray-500 px-3 py-1 rounded-full shadow-sm">
                系統時間: {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="px-8 py-4">受理編號</th>
                    <th className="px-8 py-4">要保人</th>
                    <th className="px-8 py-4">旅遊地點</th>
                    <th className="px-8 py-4">投保日期</th>
                    <th className="px-8 py-4">狀態</th>
                    <th className="px-8 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-4 font-bold text-primary-700 font-mono">NTA1130500012</td>
                    <td className="px-8 py-4 font-medium text-gray-900">陳小明</td>
                    <td className="px-8 py-4">日本 (JP)</td>
                    <td className="px-8 py-4 text-gray-500">2025/05/20</td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 已承保
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="text-gray-400 hover:text-primary-600 font-medium transition-colors">檢視</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-4 font-bold text-primary-700 font-mono">NTA1130500011</td>
                    <td className="px-8 py-4 font-medium text-gray-900">林美華</td>
                    <td className="px-8 py-4">美國 (US)</td>
                    <td className="px-8 py-4 text-gray-500">2025/05/19</td>
                    <td className="px-8 py-4">
                       <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> 審核中
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="text-gray-400 hover:text-primary-600 font-medium transition-colors">檢視</button>
                    </td>
                  </tr>
                   <tr className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-4 font-bold text-primary-700 font-mono">NTA1130500010</td>
                    <td className="px-8 py-4 font-medium text-gray-900">王大同</td>
                    <td className="px-8 py-4">泰國 (TH)</td>
                    <td className="px-8 py-4 text-gray-500">2025/05/18</td>
                    <td className="px-8 py-4">
                       <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <AlertCircle size={10}/> 照會中
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="text-gray-400 hover:text-primary-600 font-medium transition-colors">補件</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
         </div>
      </div>
    </div>
  );
};