import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Tag, Building, Layers, Check } from 'lucide-react';
import { TemplateItem, ComplaintCategory, ComplaintType } from '../types';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: TemplateItem) => void;
  initialTemplate?: TemplateItem | null;
  defaultDept?: string;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTemplate,
  defaultDept = '도로과',
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dept, setDept] = useState('도로과');
  const [category, setCategory] = useState<ComplaintCategory | '전체'>('도로');
  const [complaintType, setComplaintType] = useState<ComplaintType | '전체'>('전체');
  const [type, setType] = useState<'공통' | '부서별' | '분야별' | '민원유형별'>('부서별');
  const [targetSection, setTargetSection] = useState<
    '인사말' | '민원요지' | '검토결과' | '관련근거' | '처리결과' | '향후계획' | '추가문의' | '전체본문'
  >('검토결과');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (initialTemplate) {
      setTitle(initialTemplate.title);
      setContent(initialTemplate.content);
      setDept(initialTemplate.dept);
      setCategory(initialTemplate.category);
      setComplaintType(initialTemplate.complaintType || '전체');
      setType(initialTemplate.type);
      setTargetSection(initialTemplate.targetSection || '검토결과');
      setTagsInput((initialTemplate.tags || []).join(', '));
    } else {
      setTitle('');
      setContent('');
      setDept(defaultDept);
      setCategory('도로');
      setComplaintType('전체');
      setType('부서별');
      setTargetSection('검토결과');
      setTagsInput('');
    }
  }, [initialTemplate, isOpen, defaultDept]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('템플릿 제목과 표준 문구 본문을 입력해주세요.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const savedItem: TemplateItem = {
      id: initialTemplate?.id || `TPL-${Date.now().toString().slice(-6)}`,
      title: title.trim(),
      content: content.trim(),
      dept,
      category,
      complaintType,
      type,
      targetSection,
      tags: tags.length > 0 ? tags : [category, dept],
      author: initialTemplate?.author || '담당 주무관',
      updatedAt: new Date().toLocaleDateString('ko-KR'),
    };

    onSave(savedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {initialTemplate ? '표준 문구 템플릿 수정' : '신규 표준 답변 템플릿 등록'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                부서 및 민원 유형별로 공통 인용할 수 있는 표준 행정 문구를 관리합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              템플릿 명칭 (제목) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 도로관리계획 미결정 구간 현장확인 및 예산검토 표준안내"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
            />
          </div>

          {/* Categorization Controls Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">소관 부서</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="도로과">도로과</option>
                <option value="교통행정과">교통행정과</option>
                <option value="도시개발과">도시개발과</option>
                <option value="공원녹지과">공원녹지과</option>
                <option value="환경보전과">환경보전과</option>
                <option value="시민소통과">시민소통과</option>
                <option value="공통">전체 공통</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">민원 분야</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="도로">도로</option>
                <option value="교통">교통</option>
                <option value="도시개발">도시개발</option>
                <option value="공원">공원</option>
                <option value="환경">환경</option>
                <option value="일반">일반</option>
                <option value="전체">전체</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">민원 유형</label>
              <select
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="전체">전체</option>
                <option value="질의민원">질의민원</option>
                <option value="건의민원">건의민원</option>
                <option value="불편민원">불편민원</option>
                <option value="신고민원">신고민원</option>
                <option value="반복민원">반복민원</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">적용 대상 섹션</label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="인사말">1. 인사말</option>
                <option value="민원요지">2. 민원 요지</option>
                <option value="검토결과">3. 검토 결과</option>
                <option value="관련근거">4. 관련 근거</option>
                <option value="처리결과">5. 처리 결과</option>
                <option value="향후계획">6. 향후 계획</option>
                <option value="추가문의">7. 추가 문의</option>
                <option value="전체본문">전체 본문</option>
              </select>
            </div>
          </div>

          {/* Template Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                표준 문구 본문 내용 <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{content.length} 자</span>
            </div>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공식 답변 초안에 삽입될 법적·행정적 표준 안내 문구를 입력하세요. (변수: [접수번호], [담당자], [지역] 등 포함 가능)"
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs leading-relaxed font-sans"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              검색 키워드 태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="예: 도로확장, 도시관리계획, 현황도로, 예산편성"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Footer inside form */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors font-semibold text-xs"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialTemplate ? '수정사항 저장' : '새 템플릿 등록'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
