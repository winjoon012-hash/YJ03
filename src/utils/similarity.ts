import { Complaint, KnowledgeDocument } from '../types';

// Compute text similarity based on Korean morphological & token overlap
export function calculateComplaintSimilarity(
  query: string,
  target: Complaint
): { score: number; reason: string } {
  const qClean = normalizeKorean(query);
  const targetText = `${target.민원제목} ${target.민원요약} ${target.민원원문} ${target.키워드.join(' ')}`;
  const tClean = normalizeKorean(targetText);

  if (!qClean || !tClean) return { score: 0, reason: '내용 부족' };

  const qTokens = extractMeaningfulTokens(qClean);
  const tTokens = extractMeaningfulTokens(tClean);

  if (qTokens.length === 0 || tTokens.length === 0) return { score: 0, reason: '키워드 부족' };

  // Calculate Jaccard + Overlap coefficient with region bonus
  const tSet = new Set(tTokens);
  let matchedCount = 0;
  const matchedWords: string[] = [];

  for (const token of qTokens) {
    if (tSet.has(token)) {
      matchedCount++;
      matchedWords.push(token);
    }
  }

  let baseScore = Math.round((matchedCount / Math.min(qTokens.length, 12)) * 100);

  // Region and category match bonus
  if (target.지역 && query.includes(target.지역)) {
    baseScore += 15;
  }
  if (target.민원분야 && query.includes(target.민원분야)) {
    baseScore += 10;
  }
  if (target.세부분류 && query.includes(target.세부분류)) {
    baseScore += 15;
  }

  // Cap score at 98%
  const finalScore = Math.min(Math.max(baseScore, 10), 98);

  const reason = matchedWords.length > 0
    ? `주요 공통 키워드: ${matchedWords.slice(0, 4).join(', ')}`
    : '의미적 연관성 탐색';

  return { score: finalScore, reason };
}

// Search and rank Knowledge Documents for RAG
export function searchKnowledgeDocuments(
  query: string,
  category: string,
  docs: KnowledgeDocument[]
): KnowledgeDocument[] {
  const qTokens = extractMeaningfulTokens(normalizeKorean(query));

  return docs
    .map(doc => {
      let score = 0;
      const fullDoc = `${doc.문서명} ${doc.관련조항} ${doc.원문} ${doc.tags.join(' ')}`;
      const docClean = normalizeKorean(fullDoc);

      for (const token of qTokens) {
        if (docClean.includes(token)) {
          score += 20;
        }
      }

      if (category && doc.tags.includes(category)) {
        score += 30;
      }
      if (doc.문서상태 === '유효(최신)') {
        score += 10;
      }

      return { ...doc, relevanceScore: Math.min(score, 100) };
    })
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}

function normalizeKorean(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\sㄱ-힣]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeaningfulTokens(str: string): string[] {
  const stopWords = new Set([
    '입니다', '있습니다', '하는', '위해', '대한', '관련', '문의', '요청',
    '알려주세요', '해주세요', '드립니다', '너무', '많이', '조속히', '부탁드립니다',
    '아산시', '민원', '내용', '구간', '일원'
  ]);

  return str
    .split(/\s+/)
    .filter(token => token.length >= 2 && !stopWords.has(token));
}
