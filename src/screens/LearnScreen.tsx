import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, fontSize, spacing } from '../theme';
import { stage1, stage2, SyllableItem } from '../curriculum/data';
import { speak } from '../utils/speech';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Learn'>;
  route: RouteProp<RootStackParamList, 'Learn'>;
};

const stageData: Record<1 | 2, SyllableItem[]> = { 1: stage1, 2: stage2 };

const stageDesc: Record<1 | 2, string> = {
  1: '기본 모음 — 아 야 어 여 오 요 우 유 으 이',
  2: '기본 자음 — 가 나 다 라 마 바 사 자 차 카 타 파 하',
};

export default function LearnScreen({ navigation, route }: Props) {
  const { stage } = route.params;
  const items = stageData[stage];
  const [index, setIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const jamoOpacity = useRef(new Animated.Value(0)).current;

  const current = items[index];
  const isLast = index === items.length - 1;
  const isFirst = index === 0;

  const playSound = useCallback(() => speak(current.char), [current.char]);

  useEffect(() => {
    // 글자 등장 → 소리 재생 → 자모 분해 시각 등장
    jamoOpacity.setValue(0);
    const t1 = setTimeout(playSound, 300);
    const t2 = setTimeout(() => {
      Animated.timing(jamoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [playSound, jamoOpacity]);

  const animateAndGo = useCallback((nextIndex: number) => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.7, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setIndex(nextIndex);
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  }, [opacityAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 나가기</Text>
        </TouchableOpacity>
        <Text style={styles.stageLabel}>{stage}단계</Text>
      </View>

      <Text style={styles.stageDesc}>{stageDesc[stage]}</Text>

      <View style={styles.progressDots}>
        {items.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive, i < index && styles.dotDone]} />
        ))}
      </View>

      <View style={styles.cardArea}>
        <Animated.View style={[styles.card, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.syllable}>{current.char}</Text>

          {/* 자모 분해 시각화 */}
          <Animated.View style={[styles.jamoBox, { opacity: jamoOpacity }]}>
            {stage === 1 ? (
              <Stage1JamoView vowel={current.jamo.vowel} char={current.char} />
            ) : (
              <Stage2JamoView
                consonant={current.jamo.consonant!}
                vowel={current.jamo.vowel}
                char={current.char}
              />
            )}
          </Animated.View>

          <TouchableOpacity onPress={playSound} style={styles.speakerBtn}>
            <Text style={styles.speakerEmoji}>🔊</Text>
            <Text style={styles.speakerLabel}>다시 듣기</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Text style={styles.counter}>{index + 1} / {items.length}</Text>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
          onPress={() => !isFirst && animateAndGo(index - 1)}
          disabled={isFirst}
        >
          <Text style={[styles.navBtnText, isFirst && styles.navBtnTextDisabled]}>← 이전</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            style={[styles.navBtn, styles.nextBtn]}
            onPress={() => navigation.replace('Practice', { stage })}
          >
            <Text style={styles.nextBtnText}>연습하기 →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navBtn} onPress={() => animateAndGo(index + 1)}>
            <Text style={styles.navBtnText}>다음 →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function Stage1JamoView({ vowel, char }: { vowel: string; char: string }) {
  return (
    <View style={styles.jamoRow}>
      <View style={styles.jamoBlock}>
        <Text style={styles.jamoChar}>ㅇ</Text>
        <Text style={styles.jamoLabel}>자음{'\n'}(소리 없음)</Text>
      </View>
      <Text style={styles.jamoPlus}>+</Text>
      <View style={styles.jamoBlock}>
        <Text style={styles.jamoChar}>{vowel}</Text>
        <Text style={styles.jamoLabel}>모음</Text>
      </View>
      <Text style={styles.jamoEquals}>=</Text>
      <View style={[styles.jamoBlock, styles.jamoResult]}>
        <Text style={[styles.jamoChar, styles.jamoResultChar]}>{char}</Text>
        <Text style={styles.jamoLabel}>음절</Text>
      </View>
    </View>
  );
}

function Stage2JamoView({ consonant, vowel, char }: { consonant: string; vowel: string; char: string }) {
  return (
    <View style={styles.jamoRow}>
      <View style={styles.jamoBlock}>
        <Text style={styles.jamoChar}>{consonant}</Text>
        <Text style={styles.jamoLabel}>자음</Text>
      </View>
      <Text style={styles.jamoPlus}>+</Text>
      <View style={styles.jamoBlock}>
        <Text style={styles.jamoChar}>{vowel}</Text>
        <Text style={styles.jamoLabel}>모음</Text>
      </View>
      <Text style={styles.jamoEquals}>=</Text>
      <View style={[styles.jamoBlock, styles.jamoResult]}>
        <Text style={[styles.jamoChar, styles.jamoResultChar]}>{char}</Text>
        <Text style={styles.jamoLabel}>음절</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md,
  },
  backBtn: { padding: spacing.sm },
  backText: { fontSize: fontSize.body, color: colors.textSoft },
  stageLabel: { fontSize: fontSize.body, fontWeight: 'bold', color: colors.text },
  stageDesc: {
    fontSize: fontSize.caption, color: colors.textSoft, textAlign: 'center',
    marginTop: spacing.sm, marginHorizontal: spacing.lg,
  },
  progressDots: {
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    marginTop: spacing.md, flexWrap: 'wrap', paddingHorizontal: spacing.lg,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cardBorder },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  dotDone: { backgroundColor: colors.success },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.cardBg, borderRadius: 24,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg,
    alignItems: 'center', gap: spacing.md, width: '90%',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  syllable: { fontSize: fontSize.syllableHero, fontWeight: 'bold', color: colors.text },
  jamoBox: {
    width: '100%', backgroundColor: '#FFF3E0', borderRadius: 16,
    paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
  },
  jamoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
  },
  jamoBlock: { alignItems: 'center', minWidth: 56 },
  jamoResult: {
    backgroundColor: '#FFE0CC', borderRadius: 12,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  jamoChar: { fontSize: fontSize.syllableMedium, fontWeight: 'bold', color: colors.text },
  jamoResultChar: { color: colors.primary },
  jamoLabel: { fontSize: 13, color: colors.textSoft, textAlign: 'center', marginTop: 2 },
  jamoPlus: { fontSize: fontSize.button, color: colors.textSoft, fontWeight: 'bold' },
  jamoEquals: { fontSize: fontSize.button, color: colors.textSoft, fontWeight: 'bold' },
  speakerBtn: { alignItems: 'center', gap: spacing.xs },
  speakerEmoji: { fontSize: 40 },
  speakerLabel: { fontSize: fontSize.caption, color: colors.textSoft },
  counter: { textAlign: 'center', fontSize: fontSize.body, color: colors.disabled, marginBottom: spacing.sm },
  navRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md,
  },
  navBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: 16,
    backgroundColor: colors.cardBg, alignItems: 'center',
    borderWidth: 2, borderColor: colors.cardBorder,
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { fontSize: fontSize.button, fontWeight: 'bold', color: colors.text },
  navBtnTextDisabled: { color: colors.disabled },
  nextBtn: { backgroundColor: colors.primary, borderColor: colors.primary },
  nextBtnText: { fontSize: fontSize.button, fontWeight: 'bold', color: '#fff' },
});
