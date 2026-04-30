import AsyncStorage from '@react-native-async-storage/async-storage';

export type StageReview = {
  nextReviewDate: string;  // YYYY-MM-DD
  interval: number;        // days: 1 → 3 → 7 → 14
};

export type Progress = {
  stage1Unlocked: boolean;
  stage2Unlocked: boolean;
  stage3Unlocked: boolean;
  soundMatchingBest: number;
  memoryCardBestMoves: number;
  stageReviews: Partial<Record<'1' | '2' | '3', StageReview>>;
};

const KEY = 'haelmoni_progress';

const defaultProgress: Progress = {
  stage1Unlocked: true,
  stage2Unlocked: false,
  stage3Unlocked: false,
  soundMatchingBest: 0,
  memoryCardBestMoves: 999,
  stageReviews: {},
};

export async function loadProgress(): Promise<Progress> {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? { ...defaultProgress, ...JSON.parse(json) } : defaultProgress;
  } catch {
    return defaultProgress;
  }
}

export async function saveProgress(progress: Partial<Progress>): Promise<void> {
  try {
    const current = await loadProgress();
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...progress }));
  } catch {
    // storage failure is non-critical
  }
}

// 퀴즈 완료 후 다음 복습일 계산 (간소화된 SM-2)
// 점수 70% 이상: 간격 3배 증가 (max 14일)
// 점수 70% 미만: 1일 후 재복습
export function calcNextReview(score: number, total: number, current?: StageReview): StageReview {
  const passed = score / total >= 0.7;
  const prevInterval = current?.interval ?? 0;
  const nextInterval = passed
    ? Math.min(prevInterval === 0 ? 1 : prevInterval * 3, 14)
    : 1;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextInterval);

  return {
    nextReviewDate: nextDate.toISOString().split('T')[0],
    interval: nextInterval,
  };
}

export function isReviewDue(review: StageReview): boolean {
  const today = new Date().toISOString().split('T')[0];
  return review.nextReviewDate <= today;
}

export function reviewDaysLeft(review: StageReview): number {
  const today = new Date();
  const due = new Date(review.nextReviewDate);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
