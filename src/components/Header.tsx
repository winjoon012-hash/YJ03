import React, { useState } from 'react';
import {
  FileText,
  Layers,
  BarChart3,
  ShieldCheck,
  BookOpen,
  User,
  Clock,
  Sparkles,
  ChevronDown,
  Sun,
  ExternalLink,
  Shield,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { UserRole } from '../types';
import { AsanLogo } from './AsanLogo';

interface HeaderProps {
  activeTab: 'workspace' | 'list' | 'knowledge' | 'dashboard' | 'audit';
  setActiveTab: (tab: 'workspace' | 'list' | 'knowledge' | 'dashboard' | 'audit') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userName: string;
  userDept: string;
  geminiActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  userName,
  userDept,
  geminiActive,
}) => {
  const [zoomLevel, setZoomLevel] = useState<'normal' | 'large'>('normal');

  const handleZoomToggle = () => {
    const next = zoomLevel === 'normal' ? 'large' : 'normal';
    setZoomLevel(next);
    if (next === 'large') {
      document.documentElement.style.fontSize = '17px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Level 1: Official National & Municipal Identity Top Bar (asan.go.kr portal standard) */}
      <div className="bg-[#0B3B7B] text-slate-100 text-[11px] px-4 py-1.5 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Official Taegeuk & Slogan */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-medium">
              {/* Taegeuk Mini Icon */}
              <span className="inline-block w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 border border-white/40">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path fill="#CD2E3A" d="M0 0h36v18H0z" />
                  <path fill="#0047A0" d="M0 18h36v18H0z" />
                </svg>
              </span>
              <span className="text-white font-bold">대한민국 충청남도 아산시</span>
              <span className="text-blue-200 hidden sm:inline">공식 행정업무 지원포털</span>
            </div>

            <span className="text-blue-400 hidden md:inline">|</span>

            {/* Asan 8th Term Official Slogan */}
            <div className="hidden md:flex items-center gap-1.5 text-amber-300 font-semibold">
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-400/20 text-amber-200 rounded border border-amber-300/30">
                시정 슬로건
              </span>
              <span>다시 뛰는 아산, 더 행복한 시민</span>
            </div>
          </div>

          {/* Real-time Asan weather & Accessibility & Portal Links */}
          <div className="flex items-center gap-3.5">
            {/* Weather Widget */}
            <div className="hidden lg:flex items-center gap-1.5 text-blue-100 text-[10px] bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/60">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>온천동 19℃ 맑음</span>
              <span className="text-emerald-300 font-medium">· 미세먼지 좋음(12㎍/㎥)</span>
            </div>

            {/* Accessibility: Font Resizer */}
            <button
              onClick={handleZoomToggle}
              title="글자 크기 조절"
              className="hidden sm:flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-100 cursor-pointer transition-colors"
            >
              {zoomLevel === 'normal' ? <ZoomIn className="w-2.5 h-2.5" /> : <ZoomOut className="w-2.5 h-2.5" />}
              <span>글자크기 {zoomLevel === 'normal' ? '확대' : '기본'}</span>
            </button>

            {/* Official Asan Portal Link */}
            <a
              href="https://www.asan.go.kr/main/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded transition-colors shadow-xs"
            >
              <span>아산시 대표포털</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Level 2: Human-in-the-Loop Administrative Notice Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#005BAA] text-white">
              행정 책임제 (Human-in-the-Loop)
            </span>
            <span className="text-slate-300 font-medium text-[11px]">
              AI 생성 초안은 행정 지원 참고용이며, 최종 발송 전 담당 공무원의 사실관계 및 법적 근거 확인이 필수입니다.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">
                {geminiActive ? 'Gemini 3.8 Flash 연동' : '행정 규칙 및 RAG 엔진 활성'}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>2026. 09. 17. (목)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level 3: Main Navigation Header with Asan CI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Asan Brand Identity */}
          <div className="flex items-center gap-3.5">
            <AsanLogo size="md" showText={true} showSlogan={true} />
            <div className="hidden xl:block h-8 w-px bg-slate-200 mx-1" />
            <div className="hidden xl:block">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold text-[#005BAA] tracking-tight">
                  아산 민원도우미
                </h1>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded">
                  스마트 행정 v0.1
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                반복·다양 민원 AI 분석 및 행정근거 지원시스템
              </p>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'workspace'
                  ? 'bg-[#005BAA] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>민원 처리 & 초안 작성</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-[#005BAA] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>민원 접수함</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'bg-[#005BAA] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>행정지식DB & 템플릿</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#005BAA] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>반복민원 통계</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[#005BAA] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>보안·감사로그</span>
            </button>
          </nav>

          {/* User Profile & Role Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#005BAA] font-bold text-xs shadow-2xs">
                아산
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{userName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 rounded">
                    {userDept}
                  </span>
                </div>
                <div className="relative inline-block text-[11px]">
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="bg-transparent text-[#005BAA] font-semibold cursor-pointer outline-hidden hover:underline pr-2"
                  >
                    <option value="officer">일반 담당자 (작성·수정)</option>
                    <option value="team_leader">부서 팀장 (검토·승인)</option>
                    <option value="admin">시스템 관리자 (전체·통계)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

