import { PiiDetection } from '../types';

export function detectAndMaskPii(text: string): {
  maskedText: string;
  detectedPii: PiiDetection[];
} {
  if (!text) {
    return { maskedText: '', detectedPii: [] };
  }

  const detected: PiiDetection[] = [];

  // 1. Resident Registration Numbers (주민등록번호)
  const rrnRegex = /\b\d{6}-[1-4]\d{6}\b/g;
  let match: RegExpExecArray | null;

  while ((match = rrnRegex.exec(text)) !== null) {
    detected.push({
      type: 'rrn',
      raw: match[0],
      masked: '[주민등록번호]',
      index: match.index,
    });
  }

  // 2. Phone numbers (휴대전화, 유선전화: 010, 041, 02 등)
  const phoneRegex = /\b(01[016789]-?\d{3,4}-?\d{4}|041-?\d{3,4}-?\d{4}|02-?\d{3,4}-?\d{4})\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    detected.push({
      type: 'phone',
      raw: match[0],
      masked: '[전화번호]',
      index: match.index,
    });
  }

  // 3. Vehicle License Plates (차량번호: 12가 3456, 123하 5678, 충남12가3456)
  const plateRegex = /\b([0-9]{2,3}[가-힣]\s*[0-9]{4}|충남[0-9]{2}[가-힣][0-9]{4})\b/g;
  while ((match = plateRegex.exec(text)) !== null) {
    detected.push({
      type: 'plate',
      raw: match[0],
      masked: '[차량번호]',
      index: match.index,
    });
  }

  // 4. Detailed Addresses (상세 주소: 아산시 배방읍 ... / 온양동 ...)
  const addressRegex = /(아산시\s+(?:배방읍|염치읍|송악면|탕정면|음봉면|둔포면|영인면|인주면|선장면|도고면|신창면|온양[1-6]동)[가-힣0-9\s\-]+(?:리|로|길|아파트|빌라|마을|번지|호|통|반))/g;
  while ((match = addressRegex.exec(text)) !== null) {
    detected.push({
      type: 'address',
      raw: match[0],
      masked: '[주소]',
      index: match.index,
    });
  }

  // 5. Named Person prefixes (홍길동 씨, 민원인 OOO, 성명: OOO)
  const namePrefixes = /(?:민원인|성명|신청인|주민|신고자)\s*[:：]?\s*([가-힣]{2,4})/g;
  while ((match = namePrefixes.exec(text)) !== null) {
    detected.push({
      type: 'name',
      raw: match[1],
      masked: '[민원인]',
      index: match.index,
    });
  }

  // Also standalone typical sample names if found
  const sampleNames = ['홍길동', '김민수', '이순신', '박영희', '최정우', '정다은', '강태호', '윤서진'];
  for (const name of sampleNames) {
    let nameIdx = text.indexOf(name);
    while (nameIdx !== -1) {
      if (!detected.some(d => d.type === 'name' && d.raw === name && d.index === nameIdx)) {
        detected.push({
          type: 'name',
          raw: name,
          masked: '[민원인]',
          index: nameIdx,
        });
      }
      nameIdx = text.indexOf(name, nameIdx + 1);
    }
  }

  // Sort by start index descending to safely replace without invalidating earlier offsets
  const sorted = [...detected].sort((a, b) => b.index - a.index);
  let maskedText = text;

  // Deduplicate overlapping regions
  for (const item of sorted) {
    maskedText = maskedText.split(item.raw).join(item.masked);
  }

  return {
    maskedText,
    detectedPii: detected,
  };
}
