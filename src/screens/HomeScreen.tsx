import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, spacing } from '../theme';
import { loadProgress, Progress, isReviewDue, reviewDaysLeft } from '../utils/storage';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProgress().then(setProgress);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>할머니 한글</Text>
          <Text style={styles.subtitle}>영자 씨, 오늘도 함께 배워요 🌸</Text>
        </View>

        <Text style={styles.sectionLabel}>배우기</Text>

        <StageCard
          stage={1}
          title="1단계 · 기본 모음"
          chars="아 야 어 여 오 요 우 유 으 이"
          color="#FF7043"
          reviewStatus={progress?.stageReviews?.['1']}
          onLearn={() => navigation.navigate('Learn', { stage: 1 })}
          onPractice={() => navigation.navigate('Practice', { stage: 1 })}
          onQuiz={() => navigation.navigate('SoundMatching', { stage: 1 })}
        />

        <StageCard
          stage={2}
          title="2단계 · 기본 자음"
          chars="가 나 다 라 마 바 사 자 차 카 타 파 하"
          color="#5C6BC0"
          reviewStatus={progress?.stageReviews?.['2']}
          onLearn={() => navigation.navigate('Learn', { stage: 2 })}
          onPractice={() => navigation.navigate('Practice', { stage: 2 })}
          onQuiz={() => navigation.navigate('SoundMatching', { stage: 2 })}
        />

        <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>게임</Text>

        <TouchableOpacity
          style={styles.gameCard}
          onPress={() => navigation.navigate('MemoryCard')}
          activeOpacity={0.8}
        >
          <Text style={styles.gameEmoji}>🃏</Text>
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>짝 맞추기</Text>
            <Text style={styles.gameDesc}>그림과 글자를 짝지어 보아요</Text>
          </View>
          <Text style={styles.gameArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

type StageCardProps = {
  stage: number;
  title: string;
  chars: string;
  color: string;
  reviewStatus?: { nextReviewDate: string; interval: number };
  onLearn: () => void;
  onPractice: () => void;
  onQuiz: () => void;
};

function StageCard({ title, chars, color, reviewStatus, onLearn, onPractice, onQuiz }: StageCardProps) {
  const due = reviewStatus ? isReviewDue(reviewStatus) : false;
  const daysLeft = reviewStatus && !due ? reviewDaysLeft(reviewStatus) : null;

  return (
    <View style={[styles.stageCard, { borderLeftColor: color, borderLeftWidth: 6 }]}>
      <View style={styles.stageTitleRow}>
        <Text style={styles.stageTitle}>{title}</Text>
        {due && (
          <View style={styles.reviewBadge}>
            <Text style={styles.reviewBadgeText}>🔔 복습할 시간이에요!</Text>
          </View>
        )}
        {daysLeft !== null && daysLeft > 0 && (
          <Text style={styles.nextReviewText}>{daysLeft}일 후 복습</Text>
        )}
      </View>
      <Text style={styles.stageChars}>{chars}</Text>
      <View style={styles.stageButtons}>
        <TouchableOpacity style={[styles.stageBtn, { backgroundColor: color }]} onPress={onLearn} activeOpacity={0.8}>
          <Text style={styles.stageBtnEmoji}>📖</Text>
          <Text style={styles.stageBtnText}>배우기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.stageBtn, { backgroundColor: color, opacity: 0.75 }]} onPress={onPractice} activeOpacity={0.8}>
          <Text style={styles.stageBtnEmoji}>✏️</Text>
          <Text style={styles.stageBtnText}>연습</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.stageBtn, { backgroundColor: due ? colors.success : colors.cardBg, borderWidth: 2, borderColor: due ? colors.success : color }]} onPress={onQuiz} activeOpacity={0.8}>
          <Text style={styles.stageBtnEmoji}>🔊</Text>
          <Text style={{ fontSize: fontSize.caption, fontWeight: 'bold', color: due ? '#fff' : color }}>퀴즈</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.title + 8,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSoft,
  },
  sectionLabel: {
    fontSize: fontSize.body,
    fontWeight: 'bold',
    color: colors.textSoft,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  stageCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  stageTitle: {
    fontSize: fontSize.button,
    fontWeight: 'bold',
    color: colors.text,
  },
  reviewBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  reviewBadgeText: {
    fontSize: fontSize.caption,
    color: colors.success,
    fontWeight: 'bold',
  },
  nextReviewText: {
    fontSize: fontSize.caption,
    color: colors.disabled,
  },
  stageChars: {
    fontSize: fontSize.body,
    color: colors.textSoft,
    marginBottom: spacing.md,
    lineHeight: 30,
  },
  stageButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stageBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    gap: 2,
  },
  stageBtnEmoji: {
    fontSize: 22,
  },
  stageBtnText: {
    fontSize: fontSize.caption,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 6,
    borderLeftColor: '#26A69A',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  gameEmoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: fontSize.button,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  gameDesc: {
    fontSize: fontSize.body,
    color: colors.textSoft,
  },
  gameArrow: {
    fontSize: fontSize.button,
    color: colors.disabled,
  },
});
