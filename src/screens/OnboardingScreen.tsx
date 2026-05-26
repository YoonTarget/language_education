import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, fontSize, spacing } from '../theme';
import { saveOnboardingDone } from '../utils/storage';
import { speak } from '../utils/speech';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

type OnboardingPage = {
  title: string;
  message: string;
  spokenText: string;
  icon: string;
  buttonText: string;
};

const pages: OnboardingPage[] = [
  {
    title: '한글을 배워봐요',
    message: '소리를 듣고 글자를 하나씩 익혀요.',
    spokenText: '한글을 배워봐요. 소리를 듣고 글자를 하나씩 익혀요.',
    icon: '🌸',
    buttonText: '다음',
  },
  {
    title: '1단계 배우기',
    message: '먼저 1단계 배우기 버튼을 눌러 보세요.',
    spokenText: '먼저 1단계 배우기 버튼을 눌러 보세요.',
    icon: '📖',
    buttonText: '다음',
  },
  {
    title: '틀려도 괜찮아요',
    message: '글자를 누르면 소리를 다시 들을 수 있어요.',
    spokenText: '틀려도 괜찮아요. 글자를 누르면 소리를 다시 들을 수 있어요.',
    icon: '🔊',
    buttonText: '시작하기',
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = pages[pageIndex];
  const isLastPage = pageIndex === pages.length - 1;

  const dots = useMemo(
    () => pages.map((_, index) => (
      <View
        key={index}
        style={[
          styles.dot,
          index === pageIndex ? styles.dotActive : styles.dotInactive,
        ]}
      />
    )),
    [pageIndex]
  );

  const handlePrimaryPress = async () => {
    speak(page.spokenText);

    if (!isLastPage) {
      setPageIndex(index => index + 1);
      return;
    }

    await saveOnboardingDone();
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{page.icon}</Text>
        </View>

        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.message}>{page.message}</Text>

        <TouchableOpacity
          style={styles.listenButton}
          onPress={() => speak(page.spokenText)}
          activeOpacity={0.8}
        >
          <Text style={styles.listenText}>소리 듣기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>{dots}</View>
        <TouchableOpacity style={styles.primaryButton} onPress={handlePrimaryPress} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>{page.buttonText}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 144,
    height: 144,
    borderRadius: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  icon: {
    fontSize: 72,
  },
  title: {
    fontSize: fontSize.syllableMedium,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.button,
    lineHeight: 42,
    color: colors.textSoft,
    textAlign: 'center',
  },
  listenButton: {
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  listenText: {
    fontSize: fontSize.body,
    fontWeight: 'bold',
    color: colors.primary,
  },
  footer: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotInactive: {
    backgroundColor: colors.cardBorder,
  },
  primaryButton: {
    minHeight: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: fontSize.button,
    fontWeight: 'bold',
    color: colors.cardBg,
  },
});
