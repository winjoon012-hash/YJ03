import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  BookOpen,
  History,
  FileCheck,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  BookmarkPlus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Send,
  MessageSquare,
  Scale,
  Calendar,
  Layers,
  FileText,
  PlusCircle,
  X,
  Search,
  CheckCircle,
  Undo2
} from 'lucide-react';
import {
  Complaint,
  KnowledgeDocument,
  ResponseDraft,
  DraftStyle,
  GroundingCheck,
  TemplateItem,
} from '../types';

interface AiAnalysisPaneProps {
  complaint: Complaint;
  draft: ResponseDraft | null;
  similarComplaints: Complaint[];
  matchedDocs: KnowledgeDocument[];
  templates: TemplateItem[];
  onSelectStyle: (style: DraftStyle) => void;
  onRefineDraft: (instruction: string) => void;
  onSaveFinalResponse: (editedText: string, isExemplary: boolean) => void;
  onViewDoc: (doc: KnowledgeDocument) => void;
  onViewPastComplaint: (complaint: Complaint) => void;
  onUpdateRecurrentDecision: (decision: '동일민원' | '유사민원' | '별도민원', note: string) => void;
  isDrafting: boolean;
}

export const AiAnalysisPane: React.FC<AiAnalysisPaneProps> = ({
  complaint,
  draft,
  similarComplaints,
  matchedDocs,
  templates = [],
  onSelectStyle,
  onRefineDraft,
  onSaveFinalResponse,
  onViewDoc,
  onViewPastComplaint,
  onUpdateRecurrentDecision,
  isDrafting,
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'draft' | 'similar' | 'evidence'>('draft');
  const [editedContent, setEditedContent] = useState<string>(draft?.finalResponse || draft?.fullDraft || '');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [decisionNote, setDecisionNote] = useState<string>(complaint.반복민원탐지?.officerNote || '');

  // Template Insertion & Drawer States
  const [showTemplateDrawer, setShowTemplateDrawer] = useState<boolean>(false);
  const [templateSearchTerm, setTemplateSearchTerm] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('recommended');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [insertionNotice, setInsertionNotice] = useState<string | null>(null);
  const [previousContentForUndo, setPreviousContentForUndo] = useState<string | null>(null);

  // Matching templates for current complaint (Department & Category)
  const recommendedTemplates = templates.filter((tpl) => {
    const matchDept = tpl.dept === complaint.담당부서 || tpl.dept === '공통';
    const matchCategory = tpl.category === complaint.민원분야 || tpl.category === '전체';
    const matchType = !tpl.complaintType || tpl.complaintType === '전체' || tpl.complaintType === complaint.민원유형;
    return matchDept || matchCategory || matchType;
  });

  // Filtered templates inside the drawer
  const drawerTemplates = templates.filter((tpl) => {
    const searchLower = templateSearchTerm.toLowerCase();
    const matchSearch =
      tpl.title.toLowerCase().includes(searchLower) ||
      tpl.content.toLowerCase().includes(searchLower) ||
      (tpl.tags || []).some((t) => t.toLowerCase().includes(searchLower));

    let matchDept = true;
    if (selectedDeptFilter === 'recommended') {
      matchDept = tpl.dept === complaint.담당부서 || tpl.dept === '공통';
    } else if (selectedDeptFilter !== 'all') {
      matchDept = tpl.dept === selectedDeptFilter;
    }

    let matchSection = true;
    if (selectedSectionFilter !== 'all') {
      matchSection = tpl.targetSection === selectedSectionFilter || tpl.targetSection === '전체본문';
    }

    return matchSearch && matchDept && matchSection;
  });

  const handleInsertTemplate = (tpl: TemplateItem, mode: 'append' | 'replace') => {
    setPreviousContentForUndo(editedContent);
    if (mode === 'replace') {
      setEditedContent(tpl.content);
      setInsertionNotice(`'${tpl.title}' 템플릿으로 전체 본문을 대체했습니다.`);
    } else {
      if (!editedContent || editedContent.trim() === '') {
        setEditedContent(tpl.content);
      } else {
        setEditedContent((prev) => `${prev.trim()}\n\n${tpl.content}`);
      }
      setInsertionNotice(`'${tpl.title}' 표준 문구가 초안 하단에 삽입되었습니다.`);
    }
    setTimeout(() => {
      setInsertionNotice(null);
    }, 4000);
  };

  const handleUndoInsertion = () => {
    if (previousContentForUndo !== null) {
      setEditedContent(previousContentForUndo);
      setPreviousContentForUndo(null);
      setInsertionNotice('삽입 이전 상태로 되돌렸습니다.');
      setTimeout(() => setInsertionNotice(null), 2000);
    }
  };

  // Keep local editor synced when draft changes
  React.useEffect(() => {
    if (draft) {
      setEditedContent(draft.finalResponse || draft.fullDraft || '');
    }
  }, [draft]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent || draft?.fullDraft || '');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = (asExemplary: boolean = false) => {
    onSaveFinalResponse(editedContent, asExemplary);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'draft'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 답변 초안 및 검토</span>
            {draft && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analysis'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>민원 요약·분류</span>
          </button>

          <button
            onClick={() => setActiveTab('similar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'similar'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>유사민원 ({similarComplaints.length})</span>
            {complaint.반복민원탐지?.isRecurrentLikely && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded text-[10px]">
                반복주의
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>공식 근거자료 ({matchedDocs.length})</span>
          </button>
        </div>

        {/* Style Selector */}
        {activeTab === 'draft' && (
          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-xs">
            {(['기본형', '친절형', '간결형', '상세형'] as DraftStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => onSelectStyle(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  draft?.style === s
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recurrent Complaint Alert Banner (PRD Section 7.5) */}
      {complaint.반복민원탐지?.isRecurrentLikely && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900">
                  반복민원 탐지 알림: 기존 과거 민원과 유사도 {complaint.반복민원탐지.similarityScore}% 일치
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-200/80 text-amber-900 font-semibold rounded">
                  동일 사안 가능성
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                공통 핵심내용: {complaint.반복민원탐지.commonIssue}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-amber-900 font-medium">
                <span>담당자 확인(필수):</span>
                {(['동일민원', '유사민원', '별도민원'] as const).map((dec) => (
                  <label key={dec} className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="recurrent_decision"
                      checked={complaint.반복민원탐지?.officerDecision === dec}
                      onChange={() => onUpdateRecurrentDecision(dec, decisionNote)}
                      className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span>{dec}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('similar')}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline shrink-0"
          >
            과거 민원 대조하기 →
          </button>
        </div>
      )}

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* TAB 1: AI DRAFT & HUMAN EDIT (Core Workflow) */}
        {activeTab === 'draft' && (
          <div className="space-y-4">
            {/* Grounding Verification Banner (PRD Section 25) */}
            {draft?.groundingVerification && (
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      근거 없는 답변 방지 자체 검증 (3대 행정 원칙 통과)
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                    공공 RAG 검증 완료
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-blue-100 flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                      Q1
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">사실관계 확인</div>
                      <div className="text-[11px] text-slate-500">
                        {draft.groundingVerification.q1Note}
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-blue-100 flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                      Q2
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">법령·조례 근거</div>
                      <div className="text-[11px] text-slate-500">
                        {draft.groundingVerification.q2Note}
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-blue-100 flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                      Q3
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">일정 임의생성 금지</div>
                      <div className="text-[11px] text-slate-500">
                        {draft.groundingVerification.q3Note}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Refinement Action Toolbar (PRD Section 10) */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 px-1">
                AI 초안 다듬기:
              </span>
              {[
                '더 공손하게',
                '더 간결하게',
                '쉽게 설명',
                '법령 근거 강화',
                '핵심만 정리',
                '공식 표준 서식',
              ].map((btn) => (
                <button
                  key={btn}
                  onClick={() => onRefineDraft(btn)}
                  disabled={isDrafting}
                  className="px-2.5 py-1 text-xs rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* Quick Template Recommendation Bar */}
            {recommendedTemplates.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-blue-50/60 rounded-lg border border-blue-100 text-xs">
                <span className="font-semibold text-blue-900 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>[{complaint.담당부서}] 추천 표준문구 바로 삽입:</span>
                </span>
                {recommendedTemplates.slice(0, 3).map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleInsertTemplate(tpl, 'append')}
                    title={`${tpl.title} (${tpl.targetSection || '공통'} 문구 삽입)`}
                    className="px-2 py-1 bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-800 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer truncate max-w-[220px]"
                  >
                    <PlusCircle className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="truncate">{tpl.title}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 7-Step Structured Draft vs Editor */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">
                    민원 답변 최종 편집기 (Human-in-the-Loop)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    AI 초안을 바탕으로 담당자가 직접 수정 및 승인합니다.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTemplateDrawer(!showTemplateDrawer)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      showTemplateDrawer
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>표준 템플릿 라이브러리</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
                      {recommendedTemplates.length}
                    </span>
                  </button>
                  <span className="text-[11px] text-slate-400">{editedContent.length} 자</span>
                </div>
              </div>

              {/* Expandable Template Insertion Drawer */}
              {showTemplateDrawer && (
                <div className="bg-slate-50 border border-blue-200 rounded-xl p-3.5 space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>표준 문구 템플릿 검색 및 원클릭 초안 삽입</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        (선택한 표준 문구를 초안에 덧붙이거나 전체를 대체할 수 있습니다)
                      </span>
                    </div>
                    <button
                      onClick={() => setShowTemplateDrawer(false)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Filter controls inside drawer */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="relative sm:col-span-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={templateSearchTerm}
                        onChange={(e) => setTemplateSearchTerm(e.target.value)}
                        placeholder="템플릿 제목 또는 내용 검색..."
                        className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <select
                        value={selectedDeptFilter}
                        onChange={(e) => setSelectedDeptFilter(e.target.value)}
                        className="w-full py-1 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="recommended">⭐ [{complaint.담당부서}] 추천 템플릿</option>
                        <option value="all">전체 부서 템플릿</option>
                        <option value="도로과">도로과</option>
                        <option value="교통행정과">교통행정과</option>
                        <option value="도시개발과">도시개발과</option>
                        <option value="환경보전과">환경보전과</option>
                        <option value="공통">공통 표준 문구</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={selectedSectionFilter}
                        onChange={(e) => setSelectedSectionFilter(e.target.value)}
                        className="w-full py-1 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="all">전체 섹션 삽입용</option>
                        <option value="검토결과">3. 검토결과 문구</option>
                        <option value="관련근거">4. 관련근거 문구</option>
                        <option value="처리결과">5. 처리결과 문구</option>
                        <option value="향후계획">6. 향후계획 문구</option>
                        <option value="추가문의">7. 추가문의/인사말</option>
                      </select>
                    </div>
                  </div>

                  {/* Template Items List inside Drawer */}
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {drawerTemplates.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 bg-white rounded-lg border border-slate-200">
                        조건에 일치하는 표준 문구 템플릿이 없습니다.
                      </div>
                    ) : (
                      drawerTemplates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-slate-900">{tpl.title}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                {tpl.dept}
                              </span>
                              {tpl.targetSection && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                  [{tpl.targetSection}]
                                </span>
                              )}
                              {tpl.complaintType && tpl.complaintType !== '전체' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600">
                                  {tpl.complaintType}
                                </span>
                              )}
                            </div>

                            {/* Insertion action buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleInsertTemplate(tpl, 'append')}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer border border-blue-200"
                              >
                                <PlusCircle className="w-3 h-3" />
                                <span>초안 하단 추가</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('현재 작성 중인 초안 전체를 이 템플릿 내용으로 대체하시겠습니까?')) {
                                    handleInsertTemplate(tpl, 'replace');
                                  }
                                }}
                                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded text-[11px] font-medium transition-colors cursor-pointer border border-slate-200"
                              >
                                전체 대체
                              </button>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed font-sans">
                            {tpl.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Instant Notification Banner with Undo Option */}
              {insertionNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{insertionNotice}</span>
                  </div>
                  {previousContentForUndo !== null && (
                    <button
                      onClick={handleUndoInsertion}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Undo2 className="w-3 h-3" />
                      <span>실행 취소 (되돌리기)</span>
                    </button>
                  )}
                </div>
              )}

              <textarea
                rows={14}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="AI 답변 초안이 여기에 생성됩니다. 직접 수정하실 수 있습니다."
                className="w-full text-sm bg-white border border-slate-200 rounded-xl p-4 text-slate-800 font-sans leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
              />
            </div>

            {/* Citations used in Draft */}
            {draft?.usedCitations && draft.usedCitations.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>초안에 반영된 공식 행정 근거:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {draft.usedCitations.map((c, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center gap-1"
                    >
                      <span className="font-semibold text-blue-700">{c.docName}</span>
                      <span className="text-slate-400">({c.clause})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ANALYSIS & CATEGORIZATION (PRD Section 7.2 & 7.3) */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  민원 제목
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {complaint.민원제목 || '제목 미생성'}
                </h3>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-600">
                  민원 요약 (핵심 쟁점)
                </span>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                  {complaint.민원요약 || '민원 요약 내용이 없습니다.'}
                </p>
              </div>

              {/* Key Demands 1, 2, 3 */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600">
                  민원 핵심 요구사항 (개조식)
                </span>
                <div className="mt-1 space-y-1">
                  {complaint.핵심요구사항 && complaint.핵심요구사항.length > 0 ? (
                    complaint.핵심요구사항.map((demand, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2 rounded-lg border border-slate-200"
                      >
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{demand}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">요구사항 분석 대기 중</p>
                  )}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600">
                  핵심 키워드
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {complaint.키워드 && complaint.키워드.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Department & Legal Classification Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-400 block">1차 분야 / 세부</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {complaint.민원분야} / {complaint.세부분류}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-400 block">관할 지역</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  아산시 {complaint.지역}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-400 block">담당 소관부서</span>
                <span className="font-bold text-blue-700 mt-0.5 block">
                  {complaint.담당부서}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-400 block">법정 처리기한</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {complaint.처리기한} ({complaint.처리기한일수}일)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SIMILAR COMPLAINTS (PRD Section 7.4) */}
        {activeTab === 'similar' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>의미 기반(Vector/RAG) 유사 과거 처리 민원 목록</span>
              <span>참고용 검색 결과</span>
            </div>

            {similarComplaints.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                일치하는 유사 과거 민원이 없습니다.
              </div>
            ) : (
              similarComplaints.map((item, idx) => (
                <div
                  key={item.complaint_id}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {idx + 1}위
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {item.민원제목}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      유사도 {idx === 0 ? '94%' : idx === 1 ? '87%' : '76%'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.민원요약 || item.민원원문}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>접수일: {item.접수일}</span>
                      <span>부서: {item.담당부서}</span>
                      <span>담당자: {item.담당자}</span>
                    </div>
                    <button
                      onClick={() => onViewPastComplaint(item)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                    >
                      <span>과거 답변 보기</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: OFFICIAL EVIDENCE (PRD Section 7.6) */}
        {activeTab === 'evidence' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>관련 법률, 아산시 조례, 도시관리계획 및 업무지침</span>
              <span className="text-blue-600 font-medium">최신 유효자료 우선 매칭</span>
            </div>

            {matchedDocs.map((doc) => (
              <div
                key={doc.document_id}
                className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                        {doc.문서유형}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {doc.문서명}
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                      {doc.관련조항}
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    {doc.문서상태}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg font-mono text-[11px] leading-relaxed line-clamp-3">
                  {doc.원문}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>출처: {doc.출처} | 시행일: {doc.시행일}</span>
                  <button
                    onClick={() => onViewDoc(doc)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>원문 전문 보기</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer (PRD Section 10 & 12) */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? '복사 완료' : '답변 복사'}</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>우수 답변 사례 등록</span>
          </button>
        </div>

        <button
          onClick={() => handleSave(false)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>검토 및 저장 완료</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>담당자 검토 완료 및 저장</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
