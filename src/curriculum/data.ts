export type Jamo = {
  consonant?: string;  // 초성
  vowel: string;       // 중성
  final?: string;      // 받침 (stage 3)
};

export type SyllableItem = {
  char: string;
  label: string;
  stage: 1 | 2 | 3;
  jamo: Jamo;
  emoji?: string;      // stage 3 단어 그림
};

export type WordPair = {
  word: string;
  emoji: string;
  sound: string;
  category?: string;
};

// 1단계: 기본 모음 (ㅇ + 모음 = 음절, ㅇ은 묵음)
export const stage1: SyllableItem[] = [
  { char: '아', label: '아', stage: 1, jamo: { vowel: 'ㅏ' } },
  { char: '야', label: '야', stage: 1, jamo: { vowel: 'ㅑ' } },
  { char: '어', label: '어', stage: 1, jamo: { vowel: 'ㅓ' } },
  { char: '여', label: '여', stage: 1, jamo: { vowel: 'ㅕ' } },
  { char: '오', label: '오', stage: 1, jamo: { vowel: 'ㅗ' } },
  { char: '요', label: '요', stage: 1, jamo: { vowel: 'ㅛ' } },
  { char: '우', label: '우', stage: 1, jamo: { vowel: 'ㅜ' } },
  { char: '유', label: '유', stage: 1, jamo: { vowel: 'ㅠ' } },
  { char: '으', label: '으', stage: 1, jamo: { vowel: 'ㅡ' } },
  { char: '이', label: '이', stage: 1, jamo: { vowel: 'ㅣ' } },
];

// 2단계: 기본 자음 14개 + ㅏ
export const stage2: SyllableItem[] = [
  { char: '가', label: '가', stage: 2, jamo: { consonant: 'ㄱ', vowel: 'ㅏ' } },
  { char: '나', label: '나', stage: 2, jamo: { consonant: 'ㄴ', vowel: 'ㅏ' } },
  { char: '다', label: '다', stage: 2, jamo: { consonant: 'ㄷ', vowel: 'ㅏ' } },
  { char: '라', label: '라', stage: 2, jamo: { consonant: 'ㄹ', vowel: 'ㅏ' } },
  { char: '마', label: '마', stage: 2, jamo: { consonant: 'ㅁ', vowel: 'ㅏ' } },
  { char: '바', label: '바', stage: 2, jamo: { consonant: 'ㅂ', vowel: 'ㅏ' } },
  { char: '사', label: '사', stage: 2, jamo: { consonant: 'ㅅ', vowel: 'ㅏ' } },
  { char: '자', label: '자', stage: 2, jamo: { consonant: 'ㅈ', vowel: 'ㅏ' } },
  { char: '차', label: '차', stage: 2, jamo: { consonant: 'ㅊ', vowel: 'ㅏ' } },
  { char: '카', label: '카', stage: 2, jamo: { consonant: 'ㅋ', vowel: 'ㅏ' } },
  { char: '타', label: '타', stage: 2, jamo: { consonant: 'ㅌ', vowel: 'ㅏ' } },
  { char: '파', label: '파', stage: 2, jamo: { consonant: 'ㅍ', vowel: 'ㅏ' } },
  { char: '하', label: '하', stage: 2, jamo: { consonant: 'ㅎ', vowel: 'ㅏ' } },
];

// 3단계: 받침 있는 단음절 기능어 10개
// 초성 + 중성 + 받침 구조 학습
export const stage3: SyllableItem[] = [
  { char: '밥', label: '밥', stage: 3, jamo: { consonant: 'ㅂ', vowel: 'ㅏ', final: 'ㅂ' }, emoji: '🍚' },
  { char: '물', label: '물', stage: 3, jamo: { consonant: 'ㅁ', vowel: 'ㅜ', final: 'ㄹ' }, emoji: '💧' },
  { char: '약', label: '약', stage: 3, jamo: { consonant: 'ㅇ', vowel: 'ㅏ', final: 'ㄱ' }, emoji: '💊' },
  { char: '집', label: '집', stage: 3, jamo: { consonant: 'ㅈ', vowel: 'ㅣ', final: 'ㅂ' }, emoji: '🏠' },
  { char: '문', label: '문', stage: 3, jamo: { consonant: 'ㅁ', vowel: 'ㅜ', final: 'ㄴ' }, emoji: '🚪' },
  { char: '방', label: '방', stage: 3, jamo: { consonant: 'ㅂ', vowel: 'ㅏ', final: 'ㅇ' }, emoji: '🛏️' },
  { char: '길', label: '길', stage: 3, jamo: { consonant: 'ㄱ', vowel: 'ㅣ', final: 'ㄹ' }, emoji: '🛣️' },
  { char: '손', label: '손', stage: 3, jamo: { consonant: 'ㅅ', vowel: 'ㅗ', final: 'ㄴ' }, emoji: '✋' },
  { char: '발', label: '발', stage: 3, jamo: { consonant: 'ㅂ', vowel: 'ㅏ', final: 'ㄹ' }, emoji: '🦶' },
  { char: '밤', label: '밤', stage: 3, jamo: { consonant: 'ㅂ', vowel: 'ㅏ', final: 'ㅁ' }, emoji: '🌙' },
];

export const allSyllables = [...stage1, ...stage2, ...stage3];

// 짝 맞추기 게임 — 기능적 문해 우선 단어
export const wordPairs: WordPair[] = [
  { word: '우유', emoji: '🥛', sound: '우유' },
  { word: '버스', emoji: '🚌', sound: '버스' },
  { word: '약', emoji: '💊', sound: '약' },
  { word: '물', emoji: '💧', sound: '물' },
  { word: '밥', emoji: '🍚', sound: '밥' },
  { word: '화장실', emoji: '🚻', sound: '화장실' },
  { word: '병원', emoji: '🏥', sound: '병원', category: '의료' },
  { word: '의사', emoji: '🧑‍⚕️', sound: '의사', category: '의료' },
  { word: '택시', emoji: '🚕', sound: '택시', category: '교통' },
  { word: '기차', emoji: '🚆', sound: '기차', category: '교통' },
  { word: '지하철', emoji: '🚇', sound: '지하철', category: '교통' },
  { word: '국', emoji: '🥣', sound: '국', category: '음식' },
  { word: '김치', emoji: '🥬', sound: '김치', category: '음식' },
  { word: '라면', emoji: '🍜', sound: '라면', category: '음식' },
  { word: '집', emoji: '🏠', sound: '집', category: '일상' },
  { word: '문', emoji: '🚪', sound: '문', category: '일상' },
  { word: '창문', emoji: '🪟', sound: '창문', category: '일상' },
  { word: '전화', emoji: '☎️', sound: '전화', category: '일상' },
  { word: '하나', emoji: '1️⃣', sound: '하나', category: '숫자/시간' },
  { word: '오늘', emoji: '📅', sound: '오늘', category: '숫자/시간' },
  { word: '내일', emoji: '➡️', sound: '내일', category: '숫자/시간' },
];

export function getDistractors(target: SyllableItem, pool: SyllableItem[], count = 3): SyllableItem[] {
  const others = pool.filter(s => s.char !== target.char);
  return [...others].sort(() => Math.random() - 0.5).slice(0, count);
}

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
