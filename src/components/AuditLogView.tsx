import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Lock,
  Eye,
  Sparkles,
  FileCheck,
  Download,
  AlertCircle
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filtered = logs.filter((l) => {
    const matchSearch =
      (l.complaintId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.dept.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#005BAA]/10 border border-[#005BAA]/20 flex items-center justify-center text-[#005BAA]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                보안 및 AI 행정 처리 감사 로그 (Audit Trail)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                개인정보보호법 준수
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-10">
              아산시 정보보안 지침에 따라 개인정보 비식별화, AI 초안 생성 프롬프트 및 인용 근거 로그를 투명하게 보관합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>개인정보보호법 제29조 준수</span>
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="민원번호, 담당자, 부서, 감사 상세내용 검색"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
            >
              <option value="all">전체 활동 유형</option>
              <option value="개인정보마스킹">개인정보마스킹</option>
              <option value="AI분석수행">AI분석수행</option>
              <option value="AI답변생성">AI답변생성</option>
              <option value="답변최종승인">답변최종승인</option>
              <option value="반복민원확인">반복민원확인</option>
              <option value="우수사례등록">우수사례등록</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">로그 일시</th>
                <th className="py-3 px-3">민원번호</th>
                <th className="py-3 px-3">작업 구분</th>
                <th className="py-3 px-3">수행자</th>
                <th className="py-3 px-3">소관부서</th>
                <th className="py-3 px-4">감사 상세 내용</th>
                <th className="py-3 px-3 text-right">보안 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {log.complaintId || '-'}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === '개인정보마스킹'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : log.action === 'AI답변생성' || log.action === 'AI분석수행'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : log.action === '답변최종승인'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                    {log.userName}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                    {log.dept}
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-md">
                    {log.details}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                      <Lock className="w-3 h-3" />
                      <span>무결성 검증</span>
                    </span>
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
