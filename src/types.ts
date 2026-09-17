export type ComplaintChannel = '전화·콜센터' | '국민신문고' | '방문민원' | '아산시청 누리집' | '기타';

export type ComplaintCategory =
  | '도로'
  | '교통'
  | '도시계획'
  | '도시개발'
  | '건축'
  | '주택'
  | '환경'
  | '상하수도'
  | '공원'
  | '농업'
  | '복지'
  | '세무'
  | '안전'
  | '주차'
  | '생활민원'
  | '기타';

export type ComplaintStatus = '접수대기' | '초안작성중' | '검토중' | '처리완료' | '반복민원종결';

export type ComplaintType = '질의민원' | '건의민원' | '불편민원' | '신고민원' | '진정민원' | '반복민원';

export type UserRole = 'officer' | 'team_leader' | 'admin';

export interface PiiDetection {
  type: 'name' | 'phone' | 'address' | 'plate' | 'rrn';
  raw: string;
  masked: string;
  index: number;
}

export interface ComplaintSummary {
  title: string;
  summaryText: string;
  keyDemands: string[];
  keywords: string[];
  suggestedCategory: ComplaintCategory;
  subCategory: string;
  region: string;
  expectedDepartment: string;
  recommendedType: ComplaintType;
  deadlineDays: number;
}

export interface RecurrentAnalysis {
  isRecurrentLikely: boolean;
  similarityScore: number;
  matchedComplaintIds: string[];
  commonIssue: string;
  officerDecision?: '동일민원' | '유사민원' | '별도민원';
  officerNote?: string;
  reviewedBy?: string;
}

export interface Complaint {
  complaint_id: string;
  접수일: string;
  접수경로: ComplaintChannel;
  민원원문: string;
  마스킹원문: string;
  piiMasked: boolean;
  detectedPii: PiiDetection[];
  민원제목: string;
  민원요약: string;
  핵심요구사항: string[];
  키워드: string[];
  민원분야: ComplaintCategory;
  세부분류: string;
  지역: string;
  담당부서: string;
  담당자: string;
  처리상태: ComplaintStatus;
  민원유형: ComplaintType;
  처리기한: string;
  처리기한일수: number;
  기한상태: '정상' | '임박' | '초과';
  반복민원여부: boolean;
  반복민원탐지?: RecurrentAnalysis;
  답변내용?: string;
  우수답변사례?: boolean;
}

export type DocumentType =
  | '법률'
  | '대통령령·시행규칙'
  | '아산시 조례'
  | '아산시 규칙'
  | '내부 업무지침'
  | '민원처리 매뉴얼'
  | '도시관리계획'
  | '사업계획·공문'
  | '기존 승인 답변'
  | 'FAQ';

export interface KnowledgeDocument {
  document_id: string;
  문서명: string;
  문서유형: DocumentType;
  소관부서: string;
  시행일: string;
  등록일: string;
  관련조항: string;
  출처: string;
  원문: string;
  문서상태: '유효(최신)' | '개정검토' | '참고자료';
  접근권한: '공개' | '행정내부' | '부서한정';
  tags: string[];
  relevanceScore?: number;
}

export type DraftStyle = '기본형' | '친절형' | '간결형' | '상세형';

export interface ResponseSections {
  greeting: string;     // 1. 인사말
  summary: string;      // 2. 민원 요지
  reviewResult: string; // 3. 검토 결과 (현재 확인된 사실)
  legalBasis: string;   // 4. 관련 근거 (법령, 조례, 고시)
  actionResult: string; // 5. 처리 결과 (현재 가능한 조치)
  futurePlan: string;   // 6. 향후 계획 (추진 계획 또는 검토 사항)
  inquiry: string;      // 7. 추가 문의 (부서 및 연락처)
}

export interface GroundingCheck {
  q1FactChecked: boolean;
  q1Note: string;
  q2LawChecked: boolean;
  q2Note: string;
  q3ScheduleChecked: boolean;
  q3Note: string;
}

export interface CitationItem {
  docId: string;
  docName: string;
  clause: string;
  matchedText: string;
}

export interface ResponseDraft {
  response_id: string;
  complaint_id: string;
  style: DraftStyle;
  sections: ResponseSections;
  fullDraft: string;
  officerEdited: string;
  finalResponse: string;
  usedCitations: CitationItem[];
  groundingVerification: GroundingCheck;
  isExemplary: boolean; // 우수사례 지식DB 등록 여부
  exemplaryTitle?: string;
  author: string;
  reviewer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  log_id: string;
  timestamp: string;
  action:
    | '로그인'
    | '민원조회'
    | '개인정보마스킹'
    | 'AI분석수행'
    | 'AI답변생성'
    | '답변수정'
    | '우수사례등록'
    | '답변최종승인'
    | '반복민원확인';
  userId: string;
  userName: string;
  dept: string;
  complaintId?: string;
  details: string;
}

export interface TemplateItem {
  id: string;
  category: ComplaintCategory | '전체';
  dept: string;
  complaintType?: ComplaintType | '전체';
  title: string;
  content: string;
  type: '공통' | '부서별' | '분야별' | '민원유형별';
  targetSection?: '인사말' | '민원요지' | '검토결과' | '관련근거' | '처리결과' | '향후계획' | '추가문의' | '전체본문';
  tags?: string[];
  author?: string;
  updatedAt?: string;
}
