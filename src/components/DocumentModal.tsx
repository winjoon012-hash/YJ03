import React from 'react';
import { X, ExternalLink, BookOpen, Calendar, Building, Scale, Copy, Check } from 'lucide-react';
import { KnowledgeDocument, Complaint } from '../types';

interface DocumentModalProps {
  doc: KnowledgeDocument | null;
  pastComplaint: Complaint | null;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  doc,
  pastComplaint,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!doc && !pastComplaint) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-blue-700">
                {doc ? `행정 근거자료 [${doc.문서유형}]` : '과거 유사 승인 민원 사례'}
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {doc ? doc.문서명 : pastComplaint?.민원제목}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
          {doc && (
            <>
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">관련 조항</span>
                  <span className="font-bold text-slate-800">{doc.관련조항}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">문서 상태</span>
                  <span className="font-bold text-emerald-700">{doc.문서상태}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">출처 및 발행처</span>
                  <span className="text-slate-700">{doc.출처}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">시행일 / 고시일</span>
                  <span className="text-slate-700">{doc.시행일}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  법령 및 고시 원문 본문
                </span>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap">
                  {doc.원문}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {doc.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </>
          )}

          {pastComplaint && (
            <>
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">접수일자</span>
                  <span className="font-bold text-slate-800">{pastComplaint.접수일}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">소관 부서</span>
                  <span className="font-bold text-blue-700">{pastComplaint.담당부서}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">담당 주무관</span>
                  <span className="text-slate-700">{pastComplaint.담당자}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  접수 당시 민원 원문
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                  {pastComplaint.민원원문}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  당시 승인 및 공식 발송된 답변 전문
                </span>
                <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap">
                  {pastComplaint.답변내용 || '답변 내용이 등록되지 않았습니다.'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              const textToCopy = doc ? doc.원문 : pastComplaint?.답변내용 || '';
              handleCopy(textToCopy);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사 완료' : '내용 복사'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
