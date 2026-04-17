export type Jamo = {
  consonant?: string;  // 자음 (stage 2만 해당)
  vowel: string;       // 모음
};

export type SyllableItem = {
  char: string;
  label: string;
  stage: 1 | 2;
  jamo: Jamo;
};

export type WordPair = {
  word: string;
  emoji: string;
  sound: string;
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

export const allSyllables = [...stage1, ...stage2];

// 짝 맞추기 게임 — 기능적 문해 우선 단어
export const wordPairs: WordPair[] = [
  { word: '우유', emoji: '🥛', sound: '우유' },
  { word: '버스', emoji: '🚌', sound: '버스' },
  { word: '약', emoji: '💊', sound: '약' },
  { word: '물', emoji: '💧', sound: '물' },
  { word: '밥', emoji: '🍚', sound: '밥' },
  { word: '화장실', emoji: '🚻', sound: '화장실' },
];

export function getDistractors(target: SyllableItem, pool: SyllableItem[], count = 3): SyllableItem[] {
  const others = pool.filter(s => s.char !== target.char);
  return [...others].sort(() => Math.random() - 0.5).slice(0, count);
}

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
