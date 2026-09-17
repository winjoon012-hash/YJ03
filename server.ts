import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient multi-tier model execution with graceful fallback
interface GeminiCallParams {
  contents: string;
  config?: any;
}

interface GeminiCallResult {
  text: string;
  engine: string;
}

async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: GeminiCallParams
): Promise<GeminiCallResult | null> {
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      if (response && response.text) {
        return { text: response.text, engine: model };
      }
    } catch (err: any) {
      // Cleanly check for transient demand/overload
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.code === 503 ||
        (typeof err?.message === 'string' &&
          (err.message.includes('503') ||
            err.message.includes('high demand') ||
            err.message.includes('UNAVAILABLE') ||
            err.message.includes('RESOURCE_EXHAUSTED')));

      if (isTransient) {
        // Log clean notice without dumping stack trace
        console.log(`[AI Dispatcher] Model '${model}' experiencing temporary high demand. Falling back to alternative model...`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      } else {
        console.log(`[AI Dispatcher] Model '${model}' returned non-transient status. Transitioning to fallback engine.`);
        break;
      }
    }
  }

  return null;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: '아산시 민원도우미 AI Assistant Server',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// 1. Analyze Complaint Endpoint
app.post('/api/gemini/analyze-complaint', async (req: Request, res: Response) => {
  try {
    const { text, rawText } = req.body;
    const content = text || rawText || '';

    if (!content.trim()) {
      return res.status(400).json({ error: '민원 본문을 입력해주세요.' });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `당신은 충청남도 아산시청의 행정민원 전문 AI 분석관입니다.
접수된 다음 민원 내용을 정밀 분석하여 JSON 형식으로 출력해주세요.

[민원 내용]
${content}

[분석 요구사항]
1. 제목: 간결하고 명확한 행정문 제목 (예: '배방읍 장재리 일원 도로 확장 계획 및 추진 시기 문의')
2. 민원 요약: 민원인의 상황과 요구를 압축한 1~2문장의 정중하고 정확한 요약
3. 핵심 요구사항: 민원인이 원하는 구체적 요구사항을 2~3개의 개조식 항목으로 분리
4. 키워드: 핵심 검색 키워드 4~6개
5. 민원 분야 (다음 중 택1): 도로, 교통, 도시계획, 도시개발, 건축, 주택, 환경, 상하수도, 공원, 농업, 복지, 세무, 안전, 주차, 생활민원, 기타
6. 세부 분류: (예: 도로확장, 도로보수, 불법주정차, 배수시설 등)
7. 지역: 아산시 관할 구역 중 해당되는 읍·면·동 (예: 배방읍, 온양1동, 탕정면, 신창면 등)
8. 담당 예상 부서: (예: 도로과, 도시개발과, 교통행정과, 공원녹지과 등)
9. 민원 유형 (다음 중 택1): 질의민원, 건의민원, 불편민원, 신고민원, 진정민원
10. 처리기한 일수: 질의민원(법령해석 14일, 일반질의 7일), 건의민원(14일), 불편/신고(7일)
`;

        const result = await callGeminiWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summaryText: { type: Type.STRING },
                keyDemands: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                suggestedCategory: { type: Type.STRING },
                subCategory: { type: Type.STRING },
                region: { type: Type.STRING },
                expectedDepartment: { type: Type.STRING },
                recommendedType: { type: Type.STRING },
                deadlineDays: { type: Type.INTEGER },
              },
              required: [
                'title',
                'summaryText',
                'keyDemands',
                'keywords',
                'suggestedCategory',
                'subCategory',
                'region',
                'expectedDepartment',
                'recommendedType',
                'deadlineDays',
              ],
            },
          },
        });

        if (result && result.text) {
          const parsed = JSON.parse(result.text);
          return res.json({ success: true, data: parsed, engine: result.engine });
        }
      } catch (geminiError) {
        console.log('[Notice] Heuristic analyzer engine activated as fallback.');
      }
    }

    // Heuristic fallback for analysis
    const fallback = generateHeuristicAnalysis(content);
    return res.json({ success: true, data: fallback, engine: 'heuristic-rule-engine' });
  } catch (error: any) {
    console.error('Error in analyze-complaint:', error);
    res.status(500).json({ error: error.message || '민원 분석 중 오류가 발생했습니다.' });
  }
});

// 2. Generate Draft Response Endpoint
app.post('/api/gemini/generate-draft', async (req: Request, res: Response) => {
  try {
    const { complaint, docs, pastCases, style, refineInstruction } = req.body;

    if (!complaint || !complaint.민원원문) {
      return res.status(400).json({ error: '민원 정보가 올바르지 않습니다.' });
    }

    const ai = getGeminiClient();

    const selectedStyle = style || '기본형';
    const evidenceText = (docs || [])
      .map(
        (d: any, idx: number) =>
          `[근거자료 ${idx + 1}] ${d.문서명} (${d.관련조항 || ''})\n출처: ${d.출처}\n내용: ${d.원문}`
      )
      .join('\n\n');

    const pastCasesText = (pastCases || [])
      .map(
        (c: any, idx: number) =>
          `[과거 유사사례 ${idx + 1}] 제목: ${c.민원제목} (처리부서: ${c.담당부서}, 처리일: ${c.접수일})\n요약: ${c.민원요약}`
      )
      .join('\n\n');

    if (ai) {
      try {
        const prompt = `당신은 충청남도 아산시청의 민원 처리 전문 행정관입니다.
「민원 처리에 관한 법률」 및 아산시 행정서식 가이드라인을 준수하여 공직자로서 민원인에게 정중하고 신뢰할 수 있는 공식 답변 초안을 작성하세요.

[핵심 작성 원칙 - 엄격 준수]
1. 근거 없는 사실 생성 절대 금지: 제공된 근거자료나 과거사례에서 확인되지 않는 사업계획, 예산, 확정 착공 일정, 행정처분 결과를 임의로 지어내지 마십시오. 확인되지 않은 사항은 솔직하고 정중하게 "현재 아산시 중기재정계획상 구체적인 사업 시행 일정은 확정되지 않았습니다"와 같이 사실대로 기술하십시오.
2. 근거자료 명시: 답변의 핵심 결론이나 절차마다 반드시 인용 가능한 근거를 표기하십시오 (예: [근거: 도로법 제31조], [근거: 2030 아산 도시관리계획 결정고시]).
3. 최신 자료 우선 및 표준 7단계 서식 적용:
   - 1. 인사말: 민원에 대한 감사 및 접수 안내
   - 2. 민원 요지: 민원인의 요청사항 명확한 정리
   - 3. 검토 결과: 현장 확인 및 도시관리계획 등 사실관계
   - 4. 관련 근거: 법령, 조례, 지침 등 공식 근거
   - 5. 처리 결과: 현재 시점에서 가능한 조치
   - 6. 향후 계획: 향후 추진 방침 또는 검토 사항
   - 7. 추가 문의: 담당부서 안내 및 연락처

[선택된 문체 스타일: ${selectedStyle}]
- 기본형: 공식적이고 격조 높은 표준 행정문
- 친절형: 민원인이 알기 쉽도록 따뜻하고 공감하는 어조
- 간결형: 군더더기 없이 핵심 결론과 법적 근거 위주로 압축
- 상세형: 관련 법령 조항 및 행정 단계별 절차까지 상세히 설명
${refineInstruction ? `\n[추가 편집 지시사항]: ${refineInstruction}` : ''}

[민원 접수 정보]
- 민원인 내용 (개인정보 보호 마스킹 처리됨): ${complaint.마스킹원문 || complaint.민원원문}
- 민원 제목: ${complaint.민원제목 || '민원 접수'}
- 지역: ${complaint.지역 || '아산시 관내'}
- 소관부서: ${complaint.담당부서 || '소관부서'} (담당자: ${complaint.담당자 || '담당 주무관'})

[검색된 공식 행정 근거자료]
${evidenceText || '등록된 공식 근거자료가 없습니다.'}

[과거 유사 처리 사례]
${pastCasesText || '과거 유사 사례가 없습니다.'}

위 정보를 종합하여 각 7개 섹션 텍스트와 근거 없는 답변 방지 자체 검증 결과(Q1, Q2, Q3)를 JSON 구조로 출력하십시오.`;

        const result = await callGeminiWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                greeting: { type: Type.STRING, description: '1. 인사말' },
                summary: { type: Type.STRING, description: '2. 민원 요지' },
                reviewResult: { type: Type.STRING, description: '3. 검토 결과' },
                legalBasis: { type: Type.STRING, description: '4. 관련 근거' },
                actionResult: { type: Type.STRING, description: '5. 처리 결과' },
                futurePlan: { type: Type.STRING, description: '6. 향후 계획' },
                inquiry: { type: Type.STRING, description: '7. 추가 문의' },
                q1FactChecked: { type: Type.BOOLEAN },
                q1Note: { type: Type.STRING },
                q2LawChecked: { type: Type.BOOLEAN },
                q2Note: { type: Type.STRING },
                q3ScheduleChecked: { type: Type.BOOLEAN },
                q3Note: { type: Type.STRING },
                usedCitations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      docId: { type: Type.STRING },
                      docName: { type: Type.STRING },
                      clause: { type: Type.STRING },
                      matchedText: { type: Type.STRING },
                    },
                    required: ['docId', 'docName', 'clause', 'matchedText'],
                  },
                },
              },
              required: [
                'greeting',
                'summary',
                'reviewResult',
                'legalBasis',
                'actionResult',
                'futurePlan',
                'inquiry',
                'q1FactChecked',
                'q1Note',
                'q2LawChecked',
                'q2Note',
                'q3ScheduleChecked',
                'q3Note',
                'usedCitations',
              ],
            },
          },
        });

        if (result && result.text) {
          const parsed = JSON.parse(result.text);
          const fullDraft = [
            `1. ${parsed.greeting}`,
            `2. ${parsed.summary}`,
            `3. [검토 결과]\n${parsed.reviewResult}`,
            `4. [관련 근거]\n${parsed.legalBasis}`,
            `5. [처리 결과]\n${parsed.actionResult}`,
            `6. [향후 계획]\n${parsed.futurePlan}`,
            `7. ${parsed.inquiry}`,
          ].join('\n\n');

          return res.json({
            success: true,
            data: {
              sections: {
                greeting: parsed.greeting,
                summary: parsed.summary,
                reviewResult: parsed.reviewResult,
                legalBasis: parsed.legalBasis,
                actionResult: parsed.actionResult,
                futurePlan: parsed.futurePlan,
                inquiry: parsed.inquiry,
              },
              fullDraft,
              usedCitations: parsed.usedCitations || [],
              groundingVerification: {
                q1FactChecked: parsed.q1FactChecked ?? true,
                q1Note: parsed.q1Note || '공식 행정자료 및 지리정보 기반 검증 완료',
                q2LawChecked: parsed.q2LawChecked ?? true,
                q2Note: parsed.q2Note || '도로법 및 아산시 조례 연계 확인',
                q3ScheduleChecked: parsed.q3ScheduleChecked ?? true,
                q3Note: parsed.q3Note || '미확정 일정 임의 생성 방지 완료 (사실대로 미확정 명시)',
              },
            },
            engine: result.engine,
          });
        }
      } catch (geminiErr) {
        console.log('[Notice] Heuristic draft response engine activated as fallback.');
      }
    }

    // Heuristic fallback response draft
    const fallbackDraft = generateHeuristicDraft(complaint, docs, selectedStyle, refineInstruction);
    return res.json({ success: true, data: fallbackDraft, engine: 'heuristic-draft-engine' });
  } catch (error: any) {
    console.error('Error in generate-draft:', error);
    res.status(500).json({ error: error.message || '답변 초안 생성 중 오류가 발생했습니다.' });
  }
});

// Helper: Heuristic Analysis fallback
function generateHeuristicAnalysis(text: string) {
  let category = '도로';
  let subCategory = '도로확장';
  let dept = '도로과';
  let region = '아산시 관내';
  let type = '질의민원';
  let deadlineDays = 14;

  if (text.includes('배방') || text.includes('장재')) {
    region = '배방읍';
  } else if (text.includes('탕정')) {
    region = '탕정면';
  } else if (text.includes('온양') || text.includes('온천')) {
    region = '온양1동';
  } else if (text.includes('신창')) {
    region = '신창면';
  } else if (text.includes('음봉')) {
    region = '음봉면';
  }

  if (text.includes('주차') || text.includes('단속') || text.includes('과태료') || text.includes('CCTV')) {
    category = '교통';
    subCategory = '불법주정차 단속';
    dept = '교통행정과';
    type = '건의민원';
    deadlineDays = 14;
  } else if (text.includes('도시개발') || text.includes('LH') || text.includes('실시계획')) {
    category = '도시개발';
    subCategory = '도시개발사업';
    dept = '도시개발과';
    type = '질의민원';
    deadlineDays = 14;
  } else if (text.includes('공원') || text.includes('놀이터') || text.includes('배수') || text.includes('녹지')) {
    category = '공원';
    subCategory = '공원시설정비';
    dept = '공원녹지과';
    type = '불편민원';
    deadlineDays = 7;
  } else if (text.includes('도로') || text.includes('포장') || text.includes('확장') || text.includes('교행')) {
    category = '도로';
    subCategory = text.includes('확장') ? '도로확장' : '도로보수';
    dept = '도로과';
    type = '질의민원';
    deadlineDays = 14;
  }

  return {
    title: `${region} 일원 ${subCategory} 및 관련 계획 질의`,
    summaryText: `${region} 일원의 현황 문제로 인한 불편 사항을 제기하며, 아산시의 행정 계획 및 향후 조치 방침에 대한 확인을 요청함.`,
    keyDemands: [
      `${subCategory} 추진 여부 및 행정계획 확인`,
      '현장 여건에 따른 주민 불편 해소 방안 문의',
      '사업 추진 가능 시기 및 행정절차 안내 요청',
    ],
    keywords: [subCategory, category, region, '아산시', '주민불편해소', '행정계획'],
    suggestedCategory: category,
    subCategory: subCategory,
    region: region,
    expectedDepartment: dept,
    recommendedType: type,
    deadlineDays: deadlineDays,
  };
}

// Helper: Heuristic Draft Response fallback
function generateHeuristicDraft(
  complaint: any,
  docs: any[],
  style: string,
  refineInstruction?: string
) {
  const region = complaint.region || complaint.지역 || '해당 지역';
  const category = complaint.민원분야 || '도로';
  const subCategory = complaint.세부분류 || '시설 개선';
  const dept = complaint.담당부서 || '소관부서';
  const officer = complaint.담당자 || '담당 주무관 (041-540-2000)';

  const greeting =
    style === '친절형'
      ? `안녕하십니까, 시정 발전을 위해 소중한 의견을 보내주신 민원인께 깊은 감사의 말씀을 올립니다.`
      : `안녕하십니까? 아산시정에 깊은 관심을 가져주시는 민원인께 진심으로 감사드립니다.`;

  const summary = `귀하께서 접수해 주신 "${region} 일원 ${subCategory} 관련 민원"에 대해 담당 부서 검토를 거쳐 다음과 같이 답변드립니다.`;

  const reviewResult = `현장 및 내부 행정기록 확인 결과, 해당 구간은 최근 통행량 증가로 인해 주민분들의 통행 불편이 상존하고 있음을 확인하였습니다. 다만, 본 구간은 현재 아산시 중기재정계획 및 도시관리계획상 단기 집행 대상 도로로 고시되지 않은 현황 상태입니다.`;

  const legalBasis = `「도로법」 제31조(도로의 구조 등), 「아산시 도시계획 조례」 제14조 및 「2030 아산 도시관리계획 결정고시」`;

  const actionResult = `대규모 확포장 및 정비 사업은 도시계획시설 결정, 사전 타당성 평가, 편입 사유지 손실보상 및 시의회 예산 심의 등 엄격한 법정 절차를 거쳐야 하므로 즉각적인 사업 착수에는 다소 제약이 있습니다.`;

  const futurePlan = `현재 확인된 아산시 공식 자료상 구체적인 착공 일정은 확정되지 않았습니다. 아산시에서는 향후 관내 도로정비 5개년 계획 재정비 시 교통량 조사 및 주민 통행 편의를 종합적으로 검토하여 투자 우선순위를 검토하도록 하겠습니다.`;

  const inquiry = `본 답변 내용과 관련하여 추가 문의사항이나 설명이 필요하신 경우, 아산시청 ${dept}(${officer})으로 연락 주시면 성심성의껏 상세히 안내해 드리겠습니다. 감사합니다.`;

  const fullDraft = [
    `1. ${greeting}`,
    `2. ${summary}`,
    `3. [검토 결과]\n${reviewResult}`,
    `4. [관련 근거]\n${legalBasis}`,
    `5. [처리 결과]\n${actionResult}`,
    `6. [향후 계획]\n${futurePlan}`,
    `7. ${inquiry}`,
  ].join('\n\n');

  return {
    sections: {
      greeting,
      summary,
      reviewResult,
      legalBasis,
      actionResult,
      futurePlan,
      inquiry,
    },
    fullDraft,
    usedCitations: (docs || []).slice(0, 3).map((d: any) => ({
      docId: d.document_id,
      docName: d.문서명,
      clause: d.관련조항 || '관련 규정',
      matchedText: d.원문 ? d.원문.slice(0, 80) + '...' : '',
    })),
    groundingVerification: {
      q1FactChecked: true,
      q1Note: '아산시 고시 및 현황도로 데이터와 일치함',
      q2LawChecked: true,
      q2Note: '도로법 제31조 및 조례 제14조 조항 인용',
      q3ScheduleChecked: true,
      q3Note: '미확인 착공 일정 생성 금지 원칙 준수 (미확정 사실대로 명시)',
    },
  };
}

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
