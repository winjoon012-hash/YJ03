import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ComplaintInputPane } from './components/ComplaintInputPane';
import { AiAnalysisPane } from './components/AiAnalysisPane';
import { ComplaintListView } from './components/ComplaintListView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { DashboardView } from './components/DashboardView';
import { AuditLogView } from './components/AuditLogView';
import { DocumentModal } from './components/DocumentModal';
import { Footer } from './components/Footer';
import {
  Complaint,
  KnowledgeDocument,
  ResponseDraft,
  AuditLog,
  TemplateItem,
  UserRole,
  DraftStyle,
} from './types';
import {
  INITIAL_COMPLAINTS,
  KNOWLEDGE_DOCUMENTS,
  RESPONSE_TEMPLATES,
  INITIAL_AUDIT_LOGS,
} from './data/seedData';
import { calculateComplaintSimilarity, searchKnowledgeDocuments } from './utils/similarity';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'list' | 'knowledge' | 'dashboard' | 'audit'>('workspace');
  const [userRole, setUserRole] = useState<UserRole>('officer');
  const [userName, setUserName] = useState<string>('김주무관');
  const [userDept, setUserDept] = useState<string>('도로과');

  // Core Data Collections
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(KNOWLEDGE_DOCUMENTS);
  const [templates, setTemplates] = useState<TemplateItem[]>(RESPONSE_TEMPLATES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Active Workspace Complaint & State
  const [currentComplaint, setCurrentComplaint] = useState<Complaint>(INITIAL_COMPLAINTS[0]);
  const [draft, setDraft] = useState<ResponseDraft | null>(null);
  const [similarComplaints, setSimilarComplaints] = useState<Complaint[]>([]);
  const [matchedDocs, setMatchedDocs] = useState<KnowledgeDocument[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [geminiActive, setGeminiActive] = useState<boolean>(true);

  // Modals
  const [selectedDocModal, setSelectedDocModal] = useState<KnowledgeDocument | null>(null);
  const [selectedPastComplaintModal, setSelectedPastComplaintModal] = useState<Complaint | null>(null);

  // Health check on startup
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setGeminiActive(data.geminiConfigured);
        }
      })
      .catch(() => {
        setGeminiActive(false);
      });
  }, []);

  // Update role and name
  useEffect(() => {
    if (userRole === 'officer') {
      setUserName('김주무관');
      setUserDept('도로과');
    } else if (userRole === 'team_leader') {
      setUserName('이팀장');
      setUserDept('도로과');
    } else {
      setUserName('박주무관');
      setUserDept('시민소통과 (관리자)');
    }
  }, [userRole]);

  // Initial analysis for the starting preset
  useEffect(() => {
    runSearchAndMatching(INITIAL_COMPLAINTS[0]);
  }, []);

  // Matching algorithm (RAG)
  const runSearchAndMatching = (complaint: Complaint) => {
    const query = complaint.마스킹원문 || complaint.민원원문;

    // 1. Find similar past complaints
    const rankedComplaints = complaints
      .filter((c) => c.complaint_id !== complaint.complaint_id)
      .map((c) => {
        const { score, reason } = calculateComplaintSimilarity(query, c);
        return { complaint: c, score, reason };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.complaint);

    setSimilarComplaints(rankedComplaints);

    // 2. Find matching administrative documents
    const rankedDocs = searchKnowledgeDocuments(query, complaint.민원분야, documents);
    setMatchedDocs(rankedDocs);

    return { rankedComplaints, rankedDocs };
  };

  // Run full AI Analysis & Draft generation
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const content = currentComplaint.마스킹원문 || currentComplaint.민원원문;

    try {
      // 1. Log PII detection event
      if (currentComplaint.detectedPii && currentComplaint.detectedPii.length > 0) {
        addAuditLog(
          '개인정보마스킹',
          `개인정보 ${currentComplaint.detectedPii.length}건 마스킹 완료 후 AI 안전 전송`
        );
      }

      // 2. Client-side semantic similarity search
      const { rankedComplaints, rankedDocs } = runSearchAndMatching(currentComplaint);

      // 3. Call Server analyze endpoint
      const analyzeRes = await fetch('/api/gemini/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });
      const analyzeData = await analyzeRes.json();

      let updatedComplaint = { ...currentComplaint };

      if (analyzeData.success && analyzeData.data) {
        const d = analyzeData.data;
        const isRecurrent = rankedComplaints.length > 0;
        updatedComplaint = {
          ...updatedComplaint,
          민원제목: d.title || updatedComplaint.민원제목,
          민원요약: d.summaryText || updatedComplaint.민원요약,
          핵심요구사항: d.keyDemands || updatedComplaint.핵심요구사항,
          키워드: d.keywords || updatedComplaint.키워드,
          민원분야: d.suggestedCategory || updatedComplaint.민원분야,
          세부분류: d.subCategory || updatedComplaint.세부분류,
          지역: d.region || updatedComplaint.지역,
          담당부서: d.expectedDepartment || updatedComplaint.담당부서,
          민원유형: (d.recommendedType as any) || updatedComplaint.민원유형,
          처리기한일수: d.deadlineDays || updatedComplaint.처리기한일수,
          처리상태: '초안작성중',
          반복민원탐지: isRecurrent
            ? {
                isRecurrentLikely: true,
                similarityScore: 94,
                matchedComplaintIds: [rankedComplaints[0].complaint_id],
                commonIssue: `${d.region} 일원 ${d.subCategory} 관련 기존 처리 이력 존재`,
                officerDecision: undefined,
              }
            : undefined,
        };
        setCurrentComplaint(updatedComplaint);
      }

      // 4. Call Server draft generation endpoint
      const draftRes = await fetch('/api/gemini/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint: updatedComplaint,
          docs: rankedDocs.slice(0, 3),
          pastCases: rankedComplaints.slice(0, 2),
          style: '기본형',
        }),
      });

      const draftData = await draftRes.json();

      if (draftData.success && draftData.data) {
        const generatedDraft: ResponseDraft = {
          response_id: `DFT-${Date.now().toString().slice(-6)}`,
          complaint_id: updatedComplaint.complaint_id,
          style: '기본형',
          sections: draftData.data.sections,
          fullDraft: draftData.data.fullDraft,
          officerEdited: draftData.data.fullDraft,
          finalResponse: draftData.data.fullDraft,
          usedCitations: draftData.data.usedCitations,
          groundingVerification: draftData.data.groundingVerification,
          isExemplary: false,
          author: userName,
          createdAt: new Date().toLocaleDateString('ko-KR'),
          updatedAt: new Date().toLocaleTimeString('ko-KR'),
        };

        setDraft(generatedDraft);
        addAuditLog(
          'AI답변생성',
          `Gemini AI 답변 초안 생성 완료 (근거자료 ${generatedDraft.usedCitations.length}건 인용)`
        );
      }
    } catch (err) {
      console.error('Analysis or draft generation error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Refine draft with specific instruction or style
  const handleRefineDraft = async (instruction: string) => {
    if (!currentComplaint) return;
    setIsDrafting(true);

    try {
      const draftRes = await fetch('/api/gemini/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint: currentComplaint,
          docs: matchedDocs.slice(0, 3),
          pastCases: similarComplaints.slice(0, 2),
          style: draft?.style || '기본형',
          refineInstruction: instruction,
        }),
      });

      const draftData = await draftRes.json();
      if (draftData.success && draftData.data) {
        const newDraft: ResponseDraft = {
          response_id: draft?.response_id || `DFT-${Date.now()}`,
          complaint_id: currentComplaint.complaint_id,
          style: draft?.style || '기본형',
          sections: draftData.data.sections,
          fullDraft: draftData.data.fullDraft,
          officerEdited: draftData.data.fullDraft,
          finalResponse: draftData.data.fullDraft,
          usedCitations: draftData.data.usedCitations,
          groundingVerification: draftData.data.groundingVerification,
          isExemplary: false,
          author: userName,
          createdAt: draft?.createdAt || new Date().toLocaleDateString('ko-KR'),
          updatedAt: new Date().toLocaleTimeString('ko-KR'),
        };
        setDraft(newDraft);
        addAuditLog('AI답변생성', `AI 초안 수정 반영 ('${instruction}')`);
      }
    } catch (err) {
      console.error('Refinement failed:', err);
    } finally {
      setIsDrafting(false);
    }
  };

  // Change Style
  const handleSelectStyle = async (newStyle: DraftStyle) => {
    if (!draft) return;
    setDraft((prev) => (prev ? { ...prev, style: newStyle } : null));
    await handleRefineDraft(`문체 스타일을 [${newStyle}]로 변경하여 다시 작성`);
  };

  // Select Preset Complaint
  const handleSelectPreset = (index: number) => {
    const selected = INITIAL_COMPLAINTS[index];
    if (selected) {
      setCurrentComplaint(selected);
      runSearchAndMatching(selected);
      if (selected.답변내용) {
        setDraft({
          response_id: `DFT-${selected.complaint_id}`,
          complaint_id: selected.complaint_id,
          style: '기본형',
          sections: {
            greeting: '안녕하십니까? 아산시정에 관심을 가져주셔서 감사합니다.',
            summary: selected.민원요약,
            reviewResult: '관련 규정 및 현장 확인 완료',
            legalBasis: '도로법 제31조 및 아산시 조례',
            actionResult: '검토 진행 중',
            futurePlan: '중기재정계획에 따라 검토 예정',
            inquiry: '도로과(041-540-2000)',
          },
          fullDraft: selected.답변내용,
          officerEdited: selected.답변내용,
          finalResponse: selected.답변내용,
          usedCitations: [
            {
              docId: 'DOC-ASAN-001',
              docName: '2030 아산 도시관리계획 결정고시',
              clause: '제3장 도로시설',
              matchedText: '배방읍 장재리 현황 도로 정비 기준',
            },
          ],
          groundingVerification: {
            q1FactChecked: true,
            q1Note: '아산시 고시 및 지리정보 확인 완료',
            q2LawChecked: true,
            q2Note: '도로법 제31조 준용',
            q3ScheduleChecked: true,
            q3Note: '미확정 착공 일정 생성 금지 원칙 준수',
          },
          isExemplary: false,
          author: selected.담당자 || '김주무관',
          createdAt: selected.접수일,
          updatedAt: '10:00:00',
        });
      } else {
        setDraft(null);
      }
    }
  };

  // Save Final Response (Human-in-the-loop Final Approval)
  const handleSaveFinalResponse = (editedText: string, isExemplary: boolean = false) => {
    const updated: Complaint = {
      ...currentComplaint,
      답변내용: editedText,
      처리상태: '처리완료',
      담당자: userName,
      담당부서: userDept,
      우수답변사례: isExemplary,
    };

    setCurrentComplaint(updated);
    setComplaints((prev) =>
      prev.map((c) => (c.complaint_id === updated.complaint_id ? updated : c))
    );

    if (draft) {
      setDraft({ ...draft, finalResponse: editedText, officerEdited: editedText });
    }

    addAuditLog(
      '답변최종승인',
      `담당자(${userName}) 최종 검토 완료 및 답변 저장 (${isExemplary ? '우수사례 등록 신청 포함' : ''})`
    );

    // If marked as exemplary, add to knowledge base
    if (isExemplary) {
      const newKnowledgeDoc: KnowledgeDocument = {
        document_id: `DOC-EX-${Date.now().toString().slice(-4)}`,
        문서명: `[우수답변] ${updated.민원제목}`,
        문서유형: '기존 승인 답변',
        관련조항: `${updated.민원분야} 표준 답변 사례`,
        소관부서: updated.담당부서,
        원문: editedText,
        출처: `아산시 ${updated.담당부서} 우수 답변 축적`,
        시행일: new Date().toLocaleDateString('ko-KR'),
        등록일: new Date().toLocaleDateString('ko-KR'),
        문서상태: '유효(최신)',
        접근권한: '행정내부',
        tags: [updated.민원분야, updated.세부분류, updated.지역, '우수답변'],
      };
      setDocuments((prev) => [newKnowledgeDoc, ...prev]);
      addAuditLog('우수사례등록', `우수답변 사례 신규 등록: ${updated.민원제목}`);
    }
  };

  // Handle Recurrent Decision by Officer
  const handleUpdateRecurrentDecision = (
    decision: '동일민원' | '유사민원' | '별도민원',
    note: string
  ) => {
    if (!currentComplaint.반복민원탐지) return;

    const updated: Complaint = {
      ...currentComplaint,
      반복민원여부: decision === '동일민원',
      반복민원탐지: {
        ...currentComplaint.반복민원탐지,
        officerDecision: decision,
        officerNote: note,
      },
    };

    setCurrentComplaint(updated);
    setComplaints((prev) =>
      prev.map((c) => (c.complaint_id === updated.complaint_id ? updated : c))
    );

    addAuditLog(
      '반복민원확인',
      `반복민원 담당자 판정: [${decision}] 결정 완료 (${note || '검토 의견 기재'})`
    );
  };

  // Template Management Handlers
  const handleSaveTemplate = (savedTemplate: TemplateItem) => {
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === savedTemplate.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTemplate.id ? savedTemplate : t));
      }
      return [savedTemplate, ...prev];
    });
    addAuditLog(
      '답변수정',
      `표준 문구 템플릿 등록·수정: '${savedTemplate.title}' (${savedTemplate.dept})`
    );
  };

  const handleDeleteTemplate = (id: string) => {
    const target = templates.find((t) => t.id === id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (target) {
      addAuditLog('답변수정', `표준 문구 템플릿 삭제: '${target.title}'`);
    }
  };

  // Audit Log Helper
  const addAuditLog = (action: AuditLog['action'], details: string) => {
    const newLog: AuditLog = {
      log_id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action,
      userId: userRole === 'officer' ? 'officer01' : userRole === 'team_leader' ? 'leader01' : 'admin01',
      userName,
      dept: userDept,
      complaintId: currentComplaint.complaint_id,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Select a complaint from list
  const handleSelectFromList = (item: Complaint) => {
    setCurrentComplaint(item);
    runSearchAndMatching(item);
    setActiveTab('workspace');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        userName={userName}
        userDept={userDept}
        geminiActive={geminiActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'workspace' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 min-h-[calc(100vh-14rem)]">
            {/* PRD Section 32: 2-Column Split Workspace ("Search + Work" layout, NOT a chatbot) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[750px]">
              {/* Left Column: Input & PII Privacy Shield (5 cols) */}
              <div className="lg:col-span-5 h-full">
                <ComplaintInputPane
                  currentComplaint={currentComplaint}
                  onUpdateComplaint={(updated) =>
                    setCurrentComplaint((prev) => ({ ...prev, ...updated }))
                  }
                  onRunAnalysis={handleRunAnalysis}
                  isAnalyzing={isAnalyzing}
                  onSelectPreset={handleSelectPreset}
                />
              </div>

              {/* Right Column: AI Analysis, RAG Evidence & 7-Step Draft (7 cols) */}
              <div className="lg:col-span-7 h-full">
                <AiAnalysisPane
                  complaint={currentComplaint}
                  draft={draft}
                  similarComplaints={similarComplaints}
                  matchedDocs={matchedDocs}
                  templates={templates}
                  onSelectStyle={handleSelectStyle}
                  onRefineDraft={handleRefineDraft}
                  onSaveFinalResponse={handleSaveFinalResponse}
                  onViewDoc={(doc) => setSelectedDocModal(doc)}
                  onViewPastComplaint={(c) => setSelectedPastComplaintModal(c)}
                  onUpdateRecurrentDecision={handleUpdateRecurrentDecision}
                  isDrafting={isDrafting}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <ComplaintListView
            complaints={complaints}
            onSelectComplaint={handleSelectFromList}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseView
            documents={documents}
            templates={templates}
            onViewDoc={(doc) => setSelectedDocModal(doc)}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            currentDept={userDept}
          />
        )}

        {activeTab === 'dashboard' && <DashboardView />}

        {activeTab === 'audit' && <AuditLogView logs={auditLogs} />}

        {/* Asan City Official Administrative Footer */}
        <Footer />
      </main>

      {/* Full Document & Past Case Detail Modal */}
      <DocumentModal
        doc={selectedDocModal}
        pastComplaint={selectedPastComplaintModal}
        onClose={() => {
          setSelectedDocModal(null);
          setSelectedPastComplaintModal(null);
        }}
      />
    </div>
  );
}
