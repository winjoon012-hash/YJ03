import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';

interface ComplaintListViewProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
}

export const ComplaintListView: React.FC<ComplaintListViewProps> = ({
  complaints,
  onSelectComplaint,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.민원제목.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.민원원문.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.지역.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.담당부서.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaint_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || c.처리상태 === statusFilter;
    const matchCat = categoryFilter === 'all' || c.민원분야 === categoryFilter;

    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Title & Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#005BAA]/10 border border-[#005BAA]/20 flex items-center justify-center text-[#005BAA]">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                아산시 민원 접수함 및 처리 현황
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-[#005BAA] border border-blue-200">
                아산시 종합민원실
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-10">
              충청남도 아산시 접수 전화(1422-42), 콜센터 및 온라인 민원의 처리 기한과 반복민원 여부를 실시간 관리합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200">
              총 {filtered.length}건
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="민원명, 지역(배방, 탕정...), 소관부서 검색"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
            >
              <option value="all">전체 처리상태</option>
              <option value="접수대기">접수대기</option>
              <option value="초안작성중">초안작성중</option>
              <option value="검토중">검토중</option>
              <option value="처리완료">처리완료</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
            >
              <option value="all">전체 민원분야</option>
              <option value="도로">도로</option>
              <option value="교통">교통</option>
              <option value="도시개발">도시개발</option>
              <option value="공원">공원</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">민원번호</th>
                <th className="py-3 px-3">접수일</th>
                <th className="py-3 px-3">경로</th>
                <th className="py-3 px-4">민원 제목</th>
                <th className="py-3 px-3">분야 / 지역</th>
                <th className="py-3 px-3">담당부서</th>
                <th className="py-3 px-3">처리기한 (D-day)</th>
                <th className="py-3 px-3">반복 여부</th>
                <th className="py-3 px-3">상태</th>
                <th className="py-3 px-3 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr
                  key={item.complaint_id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                    {item.complaint_id}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-500">
                    {item.접수일}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium">
                      {item.접수경로}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                    <div className="font-semibold text-slate-900 truncate">
                      {item.민원제목}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {item.민원요약}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{item.민원분야}</span>
                    <span className="text-slate-400 text-[11px]"> ({item.지역})</span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap font-medium text-blue-700">
                    {item.담당부서}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.처리기한}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        D-14
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {item.반복민원여부 || item.반복민원탐지?.isRecurrentLikely ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>반복주의</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">일반</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.처리상태 === '처리완료'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.처리상태 === '초안작성중'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.처리상태}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => onSelectComplaint(item)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>답변 작성</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
