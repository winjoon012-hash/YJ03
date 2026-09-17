import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Scale,
  FileCheck,
  Building,
  Calendar,
  Tag,
  ExternalLink,
  Edit2,
  Trash2,
  Copy,
  Check,
  Layers,
  Sparkles,
  Filter
} from 'lucide-react';
import { KnowledgeDocument, TemplateItem } from '../types';
import { TemplateEditorModal } from './TemplateEditorModal';

interface KnowledgeBaseViewProps {
  documents: KnowledgeDocument[];
  templates: TemplateItem[];
  onViewDoc: (doc: KnowledgeDocument) => void;
  onSaveTemplate: (template: TemplateItem) => void;
  onDeleteTemplate: (id: string) => void;
  currentDept?: string;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  documents,
  templates,
  onViewDoc,
  onSaveTemplate,
  onDeleteTemplate,
  currentDept = '도로과',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'docs' | 'templates'>('docs');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Template specific filter states
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [templateDeptFilter, setTemplateDeptFilter] = useState<string>('all');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');
  const [templateTypeFilter, setTemplateTypeFilter] = useState<string>('all');
  const [templateSectionFilter, setTemplateSectionFilter] = useState<string>('all');

  // Modal states for Template Management
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDocs = documents.filter((d) => {
    const matchSearch =
      d.문서명.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.관련조항.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.소관부서.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.원문.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = typeFilter === 'all' || d.문서유형 === typeFilter;
    return matchSearch && matchType;
  });

  const filteredTemplates = templates.filter((tpl) => {
    const searchLower = templateSearch.toLowerCase();
    const matchSearch =
      tpl.title.toLowerCase().includes(searchLower) ||
      tpl.content.toLowerCase().includes(searchLower) ||
      tpl.dept.toLowerCase().includes(searchLower) ||
      (tpl.tags || []).some((t) => t.toLowerCase().includes(searchLower));

    const matchDept = templateDeptFilter === 'all' || tpl.dept === templateDeptFilter;
    const matchCategory = templateCategoryFilter === 'all' || tpl.category === templateCategoryFilter;
    const matchType =
      templateTypeFilter === 'all' ||
      tpl.complaintType === templateTypeFilter ||
      tpl.complaintType === '전체';
    const matchSection =
      templateSectionFilter === 'all' ||
      tpl.targetSection === templateSectionFilter ||
      tpl.targetSection === '전체본문';

    return matchSearch && matchDept && matchCategory && matchType && matchSection;
  });

  const handleCopyTemplate = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setIsEditorModalOpen(true);
  };

  const handleOpenEdit = (tpl: TemplateItem) => {
    setEditingTemplate(tpl);
    setIsEditorModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`'${title}' 템플릿을 삭제하시겠습니까?`)) {
      onDeleteTemplate(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#005BAA]/10 border border-[#005BAA]/20 flex items-center justify-center text-[#005BAA]">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                아산시 행정지식 DB & 표준 문구 템플릿 관리
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-[#005BAA] border border-blue-200">
                자치법규 & 조례연계
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-10">
              아산시 자치법규(조례·규칙), 중앙부처 법령 해석례 및 부서별 표준 답변 템플릿을 통합 관리합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setActiveSubTab('docs')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeSubTab === 'docs'
                    ? 'bg-white text-[#005BAA] shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                행정 근거자료 ({documents.length})
              </button>
              <button
                onClick={() => setActiveSubTab('templates')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeSubTab === 'templates'
                    ? 'bg-white text-[#005BAA] shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                표준 문구 템플릿 ({templates.length})
              </button>
            </div>

            {activeSubTab === 'templates' && (
              <button
                onClick={handleOpenCreate}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>새 템플릿 등록</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter controls for Docs */}
        {activeSubTab === 'docs' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="문서명, 관련조항, 법률/조례/고시 내용 검색"
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
              >
                <option value="all">전체 문서유형</option>
                <option value="법률">법률</option>
                <option value="아산시 조례">아산시 조례</option>
                <option value="도시관리계획">도시관리계획</option>
                <option value="기존 승인 답변">기존 승인 답변(우수답변)</option>
                <option value="내부 업무지침">내부 업무지침</option>
                <option value="사업계획·공문">사업계획·공문</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter controls for Templates (Multi-dimensional Categorization) */}
        {activeSubTab === 'templates' && (
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="템플릿 제목, 표준 문구 내용, 태그 키워드 검색..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  소관 부서 필터
                </label>
                <select
                  value={templateDeptFilter}
                  onChange={(e) => setTemplateDeptFilter(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                >
                  <option value="all">전체 부서</option>
                  <option value="도로과">도로과</option>
                  <option value="교통행정과">교통행정과</option>
                  <option value="도시개발과">도시개발과</option>
                  <option value="공원녹지과">공원녹지과</option>
                  <option value="환경보전과">환경보전과</option>
                  <option value="시민소통과">시민소통과</option>
                  <option value="공통">공통 표준</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  민원 분야 필터
                </label>
                <select
                  value={templateCategoryFilter}
                  onChange={(e) => setTemplateCategoryFilter(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                >
                  <option value="all">전체 분야</option>
                  <option value="도로">도로</option>
                  <option value="교통">교통</option>
                  <option value="도시개발">도시개발</option>
                  <option value="공원">공원</option>
                  <option value="환경">환경</option>
                  <option value="일반">일반</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  민원 유형 필터
                </label>
                <select
                  value={templateTypeFilter}
                  onChange={(e) => setTemplateTypeFilter(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                >
                  <option value="all">전체 민원유형</option>
                  <option value="질의민원">질의민원</option>
                  <option value="건의민원">건의민원</option>
                  <option value="불편민원">불편민원</option>
                  <option value="신고민원">신고민원</option>
                  <option value="반복민원">반복민원</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  답변 섹션 필터
                </label>
                <select
                  value={templateSectionFilter}
                  onChange={(e) => setTemplateSectionFilter(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                >
                  <option value="all">전체 섹션</option>
                  <option value="인사말">1. 인사말</option>
                  <option value="민원요지">2. 민원요지</option>
                  <option value="검토결과">3. 검토결과</option>
                  <option value="관련근거">4. 관련근거</option>
                  <option value="처리결과">5. 처리결과</option>
                  <option value="향후계획">6. 향후계획</option>
                  <option value="추가문의">7. 추가문의</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Docs Grid */}
      {activeSubTab === 'docs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.document_id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {doc.문서유형}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    {doc.문서상태}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {doc.문서명}
                </h3>

                <div className="text-xs font-semibold text-blue-700">
                  {doc.관련조항}
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg font-mono text-[11px] leading-relaxed line-clamp-4">
                  {doc.원문}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {doc.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.2 bg-slate-100 text-slate-600 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400">
                <span>소관: {doc.소관부서} ({doc.시행일})</span>
                <button
                  onClick={() => onViewDoc(doc)}
                  className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>전문 보기</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Enhanced Templates Management List */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              검색된 표준 템플릿 <strong className="text-slate-800">{filteredTemplates.length}</strong>건
            </span>
            <span className="text-blue-600 font-medium">
              작업 화면의 AI 초안 편집기에서 원클릭으로 삽입할 수 있습니다.
            </span>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
              조건에 맞는 표준 문구 템플릿이 없습니다. 새로운 템플릿을 등록해보세요.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    {/* Badges bar */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {tpl.dept}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                          {tpl.category}
                        </span>
                        {tpl.complaintType && tpl.complaintType !== '전체' && (
                          <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {tpl.complaintType}
                          </span>
                        )}
                        {tpl.targetSection && (
                          <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            [{tpl.targetSection}] 삽입용
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(tpl)}
                          title="템플릿 수정"
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tpl.id, tpl.title)}
                          title="템플릿 삭제"
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {tpl.title}
                    </h4>

                    <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 font-sans leading-relaxed border border-slate-200">
                      "{tpl.content}"
                    </div>

                    {/* Tags */}
                    {tpl.tags && tpl.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tpl.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                    <div>
                      <span>작성: {tpl.author || '담당 주무관'}</span>
                      {tpl.updatedAt && <span className="ml-2">({tpl.updatedAt})</span>}
                    </div>

                    <button
                      onClick={() => handleCopyTemplate(tpl.id, tpl.content)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === tpl.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">복사됨!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>문구 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Template Editor Modal */}
      <TemplateEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        onSave={onSaveTemplate}
        initialTemplate={editingTemplate}
        defaultDept={currentDept}
      />
    </div>
  );
};
