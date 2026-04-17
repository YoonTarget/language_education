import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, fontSize, spacing } from '../theme';
import { stage1, stage2, allSyllables, SyllableItem, getDistractors, shuffle } from '../curriculum/data';
import { speak } from '../utils/speech';
import { loadProgress, saveProgress, calcNextReview } from '../utils/storage';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SoundMatching'>;
  route: RouteProp<RootStackParamList, 'SoundMatching'>;
};

const TOTAL_QUESTIONS = 10;

type AnswerState = 'idle' | 'correct' | 'wrong';

export default function SoundMatchingScreen({ navigation, route }: Props) {
  const { stage } = route.params;
  const pool = stage === 1 ? stage1 : stage === 2 ? stage2 : allSyllables;
  const [questions] = useState(() => shuffle(pool).slice(0, Math.min(TOTAL_QUESTIONS, pool.length)));
  const [current, setCurrent] = useState(0);
  const [options, setOptions] = useState<SyllableItem[]>([]);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const flashAnim = useState(new Animated.Value(1))[0];

  const buildOptions = useCallback((target: SyllableItem) => {
    const distractors = getDistractors(target, pool);
    return shuffle([target, ...distractors]);
  }, [pool]);

  useEffect(() => {
    if (current < questions.length) {
      const opts = buildOptions(questions[current]);
      setOptions(opts);
      setAnswerState('idle');
      setSelectedChar(null);
      setTimeout(() => speak(questions[current].char), 300);
    }
  }, [current, questions, buildOptions]);

  const flash = useCallback((correct: boolean) => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: correct ? 0.3 : 0.6, duration: 100, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [flashAnim]);

  const handleAnswer = useCallback((chosen: SyllableItem) => {
    if (answerState !== 'idle') return;

    const correct = chosen.char === questions[current].char;
    setSelectedChar(chosen.char);
    setAnswerState(correct ? 'correct' : 'wrong');
    flash(correct);

    if (correct) {
      speak('맞아요!');
      setScore(s => s + 1);
    } else {
      speak(questions[current].char);
    }

    setTimeout(() => {
      if (current + 1 >= TOTAL_QUESTIONS) {
        setFinished(true);
      } else {
        setCurrent(c => c + 1);
      }
    }, 1200);
  }, [answerState, current, questions, flash]);

  useEffect(() => {
    if (finished) {
      loadProgress().then(p => {
        const stageKey = String(stage) as '1' | '2';
        const review = calcNextReview(score, questions.length, p.stageReviews[stageKey]);
        saveProgress({
          soundMatchingBest: Math.max(score, p.soundMatchingBest),
          stage2Unlocked: p.stage2Unlocked || score >= 7,
          stageReviews: { ...p.stageReviews, [stageKey]: review },
        });
      });
    }
  }, [finished, score, stage, questions.length]);

  if (finished) {
    return <ResultScreen score={score} total={TOTAL_QUESTIONS} onHome={() => navigation.goBack()} onRetry={() => navigation.replace('SoundMatching', { stage: 1 })} />;
  }

  const target = questions[current];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 나가기</Text>
        </TouchableOpacity>
        <Text style={styles.scoreText}>{score} / {current} 맞음</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(current / TOTAL_QUESTIONS) * 100}%` }]} />
      </View>

      <View style={styles.questionArea}>
        <Text style={styles.instruction}>소리를 듣고 맞는 글자를 눌러요</Text>
        <View style={styles.speakerWrapper}>
          <TouchableOpacity onPress={() => speak(target.char)} style={styles.speakerBtn}>
            <Text style={styles.speakerEmoji}>🔊</Text>
          </TouchableOpacity>
          <Text style={styles.speakerLabel}>눌러서 소리 듣기</Text>
        </View>
        <Text style={styles.questionNum}>{current + 1} / {TOTAL_QUESTIONS}</Text>
      </View>

      <Animated.View style={[styles.optionsGrid, { opacity: flashAnim }]}>
        {options.map((opt) => {
          const isSelected = selectedChar === opt.char;
          const isCorrect = opt.char === target.char;
          let bg = colors.cardBg;
          if (isSelected && answerState === 'correct') bg = colors.success;
          if (isSelected && answerState === 'wrong') bg = colors.error;
          if (!isSelected && answerState === 'wrong' && isCorrect) bg = colors.success;

          return (
            <TouchableOpacity
              key={opt.char}
              style={[styles.optionBtn, { backgroundColor: bg }]}
              onPress={() => handleAnswer(opt)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionChar, { color: isSelected || (!isSelected && answerState === 'wrong' && isCorrect) ? '#fff' : colors.text }]}>
                {opt.char}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </SafeAreaView>
  );
}

function ResultScreen({ score, total, onHome, onRetry }: { score: number; total: number; onHome: () => void; onRetry: () => void }) {
  const pct = Math.round((score / total) * 100);
  const msg = pct >= 80 ? '아주 잘 하셨어요! 🎉' : pct >= 50 ? '잘 하셨어요! 👍' : '조금 더 연습해 봐요 💪';

  useEffect(() => { speak(msg.replace(/[🎉👍💪]/g, '')); }, []);

  return (
    <SafeAreaView style={styles.resultContainer}>
      <Text style={styles.resultEmoji}>{pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '🌱'}</Text>
      <Text style={styles.resultScore}>{score}점 / {total}점</Text>
      <Text style={styles.resultMsg}>{msg}</Text>
      <TouchableOpacity style={[styles.resultBtn, { backgroundColor: colors.primary }]} onPress={onRetry}>
        <Text style={styles.resultBtnText}>다시 하기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.resultBtn, { backgroundColor: colors.cardBg, borderWidth: 2, borderColor: colors.primary }]} onPress={onHome}>
        <Text style={[styles.resultBtnText, { color: colors.primary }]}>처음으로</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    padding: spacing.sm,
  },
  backText: {
    fontSize: fontSize.body,
    color: colors.textSoft,
  },
  scoreText: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.cardBorder,
    marginHorizontal: spacing.lg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  questionArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  instruction: {
    fontSize: fontSize.body,
    color: colors.textSoft,
  },
  speakerWrapper: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  speakerBtn: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  speakerLabel: {
    fontSize: fontSize.body,
    fontWeight: 'bold',
    color: colors.textSoft,
  },
  speakerEmoji: {
    fontSize: 56,
  },
  questionNum: {
    fontSize: fontSize.body,
    color: colors.disabled,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  optionBtn: {
    width: '44%',
    aspectRatio: 1.4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionChar: {
    fontSize: fontSize.syllableLarge,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  resultEmoji: {
    fontSize: 80,
  },
  resultScore: {
    fontSize: fontSize.syllableMedium,
    fontWeight: 'bold',
    color: colors.text,
  },
  resultMsg: {
    fontSize: fontSize.button,
    color: colors.textSoft,
    textAlign: 'center',
  },
  resultBtn: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  resultBtnText: {
    fontSize: fontSize.button,
    fontWeight: 'bold',
    color: '#fff',
  },
});
