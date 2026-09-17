import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  MapPin,
  FileText,
  Building2,
  Sparkles,
  ArrowDownRight,
  Info
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#005BAA]/10 border border-[#005BAA]/20 flex items-center justify-center text-[#005BAA]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              아산시 민원 행정 대시보드 & 반복민원 심층 분석
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-[#005BAA] border border-blue-200">
              시정 통계
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-10">
            반복·중복 민원 발생 원인을 심층 진단하고, AI 초안 도입에 따른 17개 읍면동 및 부서별 업무 효율화 지표를 분석합니다.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
          {(['day', 'week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-white text-[#005BAA] shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              {range === 'day' && '오늘'}
              {range === 'week' && '금주'}
              {range === 'month' && '금월 (9월)'}
              {range === 'year' && '2026 연간'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards (PRD Section 13 & 30) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>금월 접수 민원</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">512</span>
            <span className="text-xs text-emerald-600 font-bold">+12% vs 전월</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            오늘 18건 / 금주 124건 접수
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>반복민원 탐지</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600">38</span>
            <span className="text-xs text-slate-500 font-medium">전체의 7.4%</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            동일 사안 재접수 선제 파악
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>AI 초안 활용률</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-600">92.4%</span>
            <span className="text-xs text-indigo-700 font-bold">473건 생성</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            공식 근거 자동 연계율 98.1%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>답변 작성시간 단축</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">6.5분</span>
            <span className="text-xs text-emerald-700 font-bold flex items-center">
              <ArrowDownRight className="w-3 h-3" />
              -67.5%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            기존 평균 20분 → 6.5분 소요
          </div>
        </div>
      </div>

      {/* Recurrent Issue Deep Dive (PRD Section 15: 2026년 아산시 반복 민원 TOP 및 원인 분석) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>2026년 아산시 반복 민원 TOP 5 및 발생 원인 심층 분석</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              단순 건수 집계뿐 아니라, 반복적으로 발생하는 행정적·지리적 근본 원인을 도출하여 현장점검에 활용합니다.
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 bg-amber-50 text-amber-800 font-semibold rounded-lg border border-amber-200">
            시정 개선 과제 연계
          </span>
        </div>

        <div className="space-y-3">
          {[
            {
              rank: 1,
              title: '도로 보수 및 노면 파손 (포트홀/교행불편)',
              count: 84,
              ratio: '22.1%',
              regions: '배방읍(장재리·월천지구), 음봉면 산동리 일원',
              cause:
                '구 농로 구간의 대형 공사차량 통행 증가 및 사유지 편입 미완료로 인한 일괄 도로 확장 지연이 주원인임.',
              action: '현장 임시 대피소(Passing Bay) 긴급 설치 및 연차별 중기재정투자심사 상정',
            },
            {
              rank: 2,
              title: '불법주정차 단속 및 유예시간 연장 요청',
              count: 67,
              ratio: '17.6%',
              regions: '온양1동(온천동 전통시장), 온양온천역 상가 골목',
              cause:
                '상가 납품 조업차량 전용 하역 구역 부재로 고정식 단속 CCTV 10분 유예시간 초과 과태료 부과 빈발.',
              action: '전통시장 상인회 협의를 통한 조업차량 조식 시간대 탄력 유예 시범 운영 검토',
            },
            {
              rank: 3,
              title: '탕정2 도시개발 관련 간선도로 변경 및 착공 일정 질의',
              count: 52,
              ratio: '13.7%',
              regions: '탕정면 갈산리·매곡리 일원',
              cause:
                'LH 도시개발사업 실시계획인가 후 실제 공사 착수 및 우회도로 개설 일정의 대시민 홍보 부족.',
              action: '탕정2 공사 단계별 교통안내도 카드뉴스 제작 및 시 누리집 전담 코너 신설',
            },
            {
              rank: 4,
              title: '어린이공원 및 소하천 배수시설 정비',
              count: 41,
              ratio: '10.8%',
              regions: '신창면 남성리, 염치읍 곡교천변',
              cause:
                '여름철 집중호우 후 토사 퇴적에 따른 우수관로 통수단면 부족 및 악취 발생.',
              action: '분기별 관로 준설 정례화 및 배수펌프 용량 증설 예산 반영',
            },
            {
              rank: 5,
              title: '대학가·원룸촌 쓰레기 불법투기 단속',
              count: 36,
              ratio: '9.5%',
              regions: '신창면 읍내리, 배방읍 북수리',
              cause:
                '1인 가구 및 외국인 근로자 거주 밀집 지역의 분리배출 요령 다국어 안내 미비.',
              action: '다국어 분리배출 안내판 설치 및 스마트 이동식 감시카메라 순환 배치',
            },
          ].map((item) => (
            <div
              key={item.rank}
              className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                    {item.rank}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-blue-700">{item.count}건</span>
                  <span className="text-slate-400">({item.ratio})</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700">주요 집중 지역:</span>
                <span>{item.regions}</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="text-slate-700">
                  <span className="font-bold text-amber-800">반복 발생 원인: </span>
                  {item.cause}
                </div>
                <div className="text-blue-700">
                  <span className="font-bold">행정 조치 권고: </span>
                  {item.action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional and Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Regional Breakdown (PRD Section 14) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>읍·면·동 지역별 민원 발생 분포</span>
          </h3>

          <div className="space-y-2 pt-1 text-xs">
            {[
              { name: '배방읍', count: 168, pct: 32.8, color: 'bg-blue-600' },
              { name: '온양1~6동', count: 122, pct: 23.8, color: 'bg-indigo-600' },
              { name: '탕정면', count: 94, pct: 18.4, color: 'bg-cyan-600' },
              { name: '신창면', count: 54, pct: 10.5, color: 'bg-amber-600' },
              { name: '음봉면', count: 42, pct: 8.2, color: 'bg-slate-600' },
              { name: '기타 읍면', count: 32, pct: 6.3, color: 'bg-slate-400' },
            ].map((r) => (
              <div key={r.name} className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>{r.name}</span>
                  <span>{r.count}건 ({r.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${r.color}`}
                    style={{ width: `${r.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Response Performance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>주요 부서별 민원 처리 및 AI 활용 현황</span>
          </h3>

          <div className="space-y-2 pt-1 text-xs">
            {[
              { dept: '도로과', total: 182, solved: 174, aiRate: '95%' },
              { dept: '교통행정과', total: 135, solved: 128, aiRate: '93%' },
              { dept: '도시개발과', total: 78, solved: 71, aiRate: '88%' },
              { dept: '공원녹지과', total: 64, solved: 62, aiRate: '91%' },
              { dept: '환경보전과', total: 53, solved: 49, aiRate: '90%' },
            ].map((d) => (
              <div
                key={d.dept}
                className="p-3 bg-slate-50 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-800">{d.dept}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    접수 {d.total}건 중 {d.solved}건 완료 (처리율 {Math.round((d.solved/d.total)*100)}%)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-blue-600">
                    AI 활용 {d.aiRate}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    지연 0건
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
