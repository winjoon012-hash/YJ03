import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Send,
  Sliders,
  AlertCircle,
  PhoneCall,
  Calendar,
  Building
} from 'lucide-react';
import { Complaint, ComplaintChannel, PiiDetection } from '../types';
import { detectAndMaskPii } from '../utils/pii';

interface ComplaintInputPaneProps {
  currentComplaint: Complaint;
  onUpdateComplaint: (updated: Partial<Complaint>) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  onSelectPreset: (presetIndex: number) => void;
}

export const ComplaintInputPane: React.FC<ComplaintInputPaneProps> = ({
  currentComplaint,
  onUpdateComplaint,
  onRunAnalysis,
  isAnalyzing,
  onSelectPreset,
}) => {
  const [useMasking, setUseMasking] = useState<boolean>(true);
  const [detectedPii, setDetectedPii] = useState<PiiDetection[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // Monitor text changes and recalculate PII
  useEffect(() => {
    const { maskedText, detectedPii: piiList } = detectAndMaskPii(currentComplaint.민원원문);
    setDetectedPii(piiList);
    onUpdateComplaint({
      마스킹원문: maskedText,
      detectedPii: piiList,
      piiMasked: useMasking,
    });
  }, [currentComplaint.민원원문, useMasking]);

  const handleCopyMasked = () => {
    navigator.clipboard.writeText(currentComplaint.마스킹원문);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#005BAA]/10 border border-[#005BAA]/20 flex items-center justify-center text-[#005BAA] font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900">민원 접수 및 내용 입력</h2>
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 font-semibold rounded">
                아산 1422
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              전화 녹취, 콜센터 메모 또는 온라인 민원 텍스트를 입력하세요.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-[#005BAA] border border-blue-200">
          {currentComplaint.complaint_id}
        </span>
      </div>

      {/* Preset Scenario Selector */}
      <div className="px-5 pt-3 pb-2 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>실제 시정 업무 시나리오 선택 (PRD 예시)</span>
          </span>
          <span className="text-[11px] text-slate-400">원클릭 불러오기</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSelectPreset(0)}
            className="px-2.5 py-1 text-xs rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium"
          >
            1. 배방읍 도로확장 (반복)
          </button>
          <button
            onClick={() => onSelectPreset(3)}
            className="px-2.5 py-1 text-xs rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium"
          >
            2. 탕정 도시개발 도로
          </button>
          <button
            onClick={() => onSelectPreset(4)}
            className="px-2.5 py-1 text-xs rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium"
          >
            3. 온천동 불법주정차
          </button>
          <button
            onClick={() => onSelectPreset(5)}
            className="px-2.5 py-1 text-xs rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium"
          >
            4. 신창면 공원 배수로
          </button>
        </div>
      </div>

      {/* Input Metadata Bar */}
      <div className="p-5 space-y-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              접수 경로
            </label>
            <select
              value={currentComplaint.접수경로}
              onChange={(e) =>
                onUpdateComplaint({ 접수경로: e.target.value as ComplaintChannel })
              }
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="전화·콜센터">전화·콜센터 (120)</option>
              <option value="국민신문고">국민신문고 전자민원</option>
              <option value="아산시청 누리집">아산시 누리집 (시민소통)</option>
              <option value="방문민원">종합민원실 방문민원</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              접수 일자
            </label>
            <div className="relative">
              <input
                type="date"
                value={currentComplaint.접수일}
                onChange={(e) => onUpdateComplaint({ 접수일: e.target.value })}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              민원 유형 분류
            </label>
            <select
              value={currentComplaint.민원유형}
              onChange={(e) => onUpdateComplaint({ 민원유형: e.target.value as any })}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="질의민원">질의민원 (법령 14일 / 일반 7일)</option>
              <option value="건의민원">건의민원 (14일)</option>
              <option value="불편민원">불편민원 (7일)</option>
              <option value="신고민원">신고민원 (7일)</option>
              <option value="반복민원">반복민원 (종결검토)</option>
            </select>
          </div>
        </div>

        {/* Text Area for Raw Complaint */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>민원 원문 내용</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (비정형 문장, 녹취록 포함 가능)
              </span>
            </label>
            <span className="text-[11px] text-slate-400">
              {currentComplaint.민원원문.length} 자
            </span>
          </div>

          <textarea
            rows={7}
            value={currentComplaint.민원원문}
            onChange={(e) => onUpdateComplaint({ 민원원문: e.target.value })}
            placeholder="예: 배방읍 장재리 도로가 너무 좁아서 차량 통행이 어렵습니다. 확장 계획이 있는지 알려주세요."
            className="w-full text-sm bg-white border border-slate-200 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed font-sans"
          />
        </div>

        {/* PII Privacy Shield Section (PRD Section 17 & 18) */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {detectedPii.length > 0 ? (
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              ) : (
                <Shield className="w-4 h-4 text-emerald-600" />
              )}
              <span className="text-xs font-bold text-slate-800">
                개인정보 자동 탐지 & 실시간 마스킹 (PII Shield)
              </span>
              <span className="text-[11px] px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
                탐지: {detectedPii.length}건
              </span>
            </div>

            {/* Toggle Switch */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[11px] text-slate-600 font-medium">AI 전송 시 마스킹</span>
              <input
                type="checkbox"
                checked={useMasking}
                onChange={(e) => setUseMasking(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
              />
            </label>
          </div>

          {detectedPii.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {detectedPii.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    <span className="font-semibold">
                      {item.type === 'name' && '민원인'}
                      {item.type === 'phone' && '전화번호'}
                      {item.type === 'address' && '주소'}
                      {item.type === 'plate' && '차량번호'}
                      {item.type === 'rrn' && '주민번호'}:
                    </span>
                    <span className="line-through text-slate-400">{item.raw}</span>
                    <span>→</span>
                    <span className="font-bold text-blue-600">{item.masked}</span>
                  </span>
                ))}
              </div>

              {/* Masked Preview */}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>AI 전송 안전 텍스트 미리보기:</span>
                  <button
                    onClick={handleCopyMasked}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? '복사됨' : '마스킹 복사'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 font-mono line-clamp-2">
                  {currentComplaint.마스킹원문}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              민원 본문에서 식별된 개인정보(이름, 연락처, 상세주소, 차량번호)가 없습니다.
            </p>
          )}
        </div>
      </div>

      {/* Action Button Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            onUpdateComplaint({
              민원원문: '',
              마스킹원문: '',
              detectedPii: [],
            });
          }}
          className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>초기화</span>
        </button>

        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing || !currentComplaint.민원원문.trim()}
          className="flex-1 px-4 py-2.5 bg-[#005BAA] hover:bg-[#004B87] disabled:bg-slate-300 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed hover:shadow"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>AI 민원 분석 및 답변 초안 작성 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>답변 초안 생성 (AI 정밀 분석 & 7단계 서식)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
