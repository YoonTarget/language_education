import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, fontSize, spacing } from '../theme';
import { stage1, stage2, stage3 } from '../curriculum/data';
import { speak } from '../utils/speech';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Practice'>;
  route: RouteProp<RootStackParamList, 'Practice'>;
};

const stageData = { 1: stage1, 2: stage2, 3: stage3 };

export default function PracticeScreen({ navigation, route }: Props) {
  const { stage } = route.params;
  const items = stageData[stage];

  const [tapCount, setTapCount] = useState<Record<string, number>>({});
  const practisedAll = items.every(item => (tapCount[item.char] ?? 0) > 0);

  const handleTap = useCallback((char: string) => {
    speak(char);
    setTapCount(prev => ({ ...prev, [char]: (prev[char] ?? 0) + 1 }));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 이전</Text>
        </TouchableOpacity>
        <Text style={styles.stageLabel}>{stage}단계 · 연습</Text>
      </View>

      <Text style={styles.instruction}>
        {stage === 3 ? '그림을 눌러서 소리를 들어보세요' : '글자를 눌러서 소리를 들어보세요'}
      </Text>
      <Text style={styles.subInstruction}>모든 글자를 한 번씩 눌러보면 퀴즈가 열려요</Text>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {items.map(item => (
          <PracticeCard
            key={item.char}
            char={item.char}
            emoji={item.emoji}
            count={tapCount[item.char] ?? 0}
            onPress={handleTap}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {practisedAll ? (
          <Text style={styles.readyMsg}>🎉 모두 연습했어요! 퀴즈 준비됐어요</Text>
        ) : (
          <Text style={styles.progressMsg}>
            {items.filter(i => (tapCount[i.char] ?? 0) > 0).length} / {items.length}개 연습함
          </Text>
        )}
        <TouchableOpacity
          style={[styles.quizBtn, !practisedAll && styles.quizBtnLocked]}
          onPress={() => navigation.replace('SoundMatching', { stage })}
          disabled={!practisedAll}
        >
          <Text style={styles.quizBtnText}>
            {practisedAll ? '소리 퀴즈 시작 →' : '글자를 모두 눌러보세요'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

type PracticeCardProps = {
  char: string;
  emoji?: string;
  count: number;
  onPress: (char: string) => void;
};

function PracticeCard({ char, emoji, count, onPress }: PracticeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const tapped = count > 0;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onPress(char);
  }, [char, onPress, scaleAnim]);

  if (emoji) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.cardLarge, tapped && styles.cardTapped]}
          onPress={handlePress}
          activeOpacity={0.85}
        >
          <Text style={styles.cardEmoji}>{emoji}</Text>
          <Text style={[styles.cardChar, tapped && styles.cardCharTapped]}>{char}</Text>
          {tapped && <Text style={styles.checkMark}>✓</Text>}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.card, tapped && styles.cardTapped]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Text style={[styles.cardChar, tapped && styles.cardCharTapped]}>{char}</Text>
        {tapped && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>
    </Animated.View>
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
  },
  backBtn: { padding: spacing.sm },
  backText: { fontSize: fontSize.body, color: colors.textSoft },
  stageLabel: { fontSize: fontSize.body, fontWeight: 'bold', color: colors.text },
  instruction: {
    fontSize: fontSize.button,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  subInstruction: {
    fontSize: fontSize.body,
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  card: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.cardBg,
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
  cardLarge: {
    width: 110,
    height: 110,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 4,
  },
  cardEmoji: {
    fontSize: 36,
  },
  cardTapped: {
    backgroundColor: '#FFF3E0',
    borderColor: colors.primary,
  },
  cardChar: {
    fontSize: fontSize.syllableMedium,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardCharTapped: {
    color: colors.primary,
  },
  checkMark: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  progressMsg: {
    textAlign: 'center',
    fontSize: fontSize.body,
    color: colors.textSoft,
  },
  readyMsg: {
    textAlign: 'center',
    fontSize: fontSize.body,
    color: colors.success,
    fontWeight: 'bold',
  },
  quizBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  quizBtnLocked: {
    backgroundColor: colors.disabled,
  },
  quizBtnText: {
    fontSize: fontSize.button,
    fontWeight: 'bold',
    color: '#fff',
  },
});
