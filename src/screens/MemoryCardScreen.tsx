import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, spacing } from '../theme';
import { wordPairs, shuffle } from '../curriculum/data';
import { speak } from '../utils/speech';
import { loadProgress, saveProgress } from '../utils/storage';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MemoryCard'>;
};

type CardState = 'idle' | 'selected' | 'matched' | 'wrong';

type Card = {
  id: string;
  type: 'emoji' | 'word';
  word: string;
  emoji: string;
  sound: string;
  state: CardState;
};

function buildColumns(): { emojis: Card[]; words: Card[] } {
  const pairs = shuffle(wordPairs);
  const emojis: Card[] = pairs.map((p, i) => ({
    id: `e-${i}`, type: 'emoji', word: p.word, emoji: p.emoji, sound: p.sound, state: 'idle',
  }));
  const words: Card[] = shuffle(
    pairs.map((p, i) => ({
      id: `w-${i}`, type: 'word', word: p.word, emoji: p.emoji, sound: p.sound, state: 'idle',
    }))
  );
  return { emojis, words };
}

export default function MemoryCardScreen({ navigation }: Props) {
  const [{ emojis, words }, setColumns] = useState(buildColumns);
  const [selectedEmoji, setSelectedEmoji] = useState<Card | null>(null);
  const [selectedWord, setSelectedWord] = useState<Card | null>(null);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);

  const allCards = [...emojis, ...words];
  const matchedCount = allCards.filter(c => c.state === 'matched').length / 2;

  const updateState = useCallback((ids: string[], state: CardState) => {
    setColumns(prev => ({
      emojis: prev.emojis.map(c => ids.includes(c.id) ? { ...c, state } : c),
      words: prev.words.map(c => ids.includes(c.id) ? { ...c, state } : c),
    }));
  }, []);

  const handleCardPress = useCallback((card: Card) => {
    if (card.state === 'matched') return;

    speak(card.sound);

    if (card.type === 'emoji') {
      if (selectedEmoji?.id === card.id) {
        updateState([card.id], 'idle');
        setSelectedEmoji(null);
        return;
      }
      if (selectedEmoji) updateState([selectedEmoji.id], 'idle');
      updateState([card.id], 'selected');
      setSelectedEmoji(card);

      if (selectedWord) {
        setMoves(m => m + 1);
        if (card.word === selectedWord.word) {
          updateState([card.id, selectedWord.id], 'matched');
          setSelectedEmoji(null);
          setSelectedWord(null);
        } else {
          updateState([card.id, selectedWord.id], 'wrong');
          setTimeout(() => {
            updateState([card.id, selectedWord.id], 'idle');
            setSelectedEmoji(null);
            setSelectedWord(null);
          }, 700);
        }
      }
    } else {
      if (selectedWord?.id === card.id) {
        updateState([card.id], 'idle');
        setSelectedWord(null);
        return;
      }
      if (selectedWord) updateState([selectedWord.id], 'idle');
      updateState([card.id], 'selected');
      setSelectedWord(card);

      if (selectedEmoji) {
        setMoves(m => m + 1);
        if (card.word === selectedEmoji.word) {
          updateState([card.id, selectedEmoji.id], 'matched');
          setSelectedEmoji(null);
          setSelectedWord(null);
        } else {
          updateState([card.id, selectedEmoji.id], 'wrong');
          setTimeout(() => {
            updateState([card.id, selectedEmoji.id], 'idle');
            setSelectedEmoji(null);
            setSelectedWord(null);
          }, 700);
        }
      }
    }
  }, [selectedEmoji, selectedWord, updateState]);

  useEffect(() => {
    const total = wordPairs.length;
    if (matchedCount === total && total > 0) {
      speak('다 맞추셨어요! 대단해요!');
      setFinished(true);
      loadProgress().then(p => {
        if (moves < p.memoryCardBestMoves) saveProgress({ memoryCardBestMoves: moves });
      });
    }
  }, [matchedCount, moves]);

  const handleRetry = () => {
    setColumns(buildColumns());
    setSelectedEmoji(null);
    setSelectedWord(null);
    setMoves(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <SafeAreaView style={styles.resultContainer}>
        <Text style={styles.resultEmoji}>🎊</Text>
        <Text style={styles.resultTitle}>모두 맞추셨어요!</Text>
        <Text style={styles.resultMoves}>{moves}번 만에 완성</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleRetry}>
          <Text style={styles.btnText}>다시 하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.cardBg, borderWidth: 2, borderColor: colors.primary }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.btnText, { color: colors.primary }]}>처음으로</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 나가기</Text>
        </TouchableOpacity>
        <Text style={styles.movesText}>{matchedCount} / {wordPairs.length} 완성</Text>
      </View>

      <Text style={styles.instruction}>그림과 글자를 짝지어 눌러보세요</Text>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <Text style={styles.columnLabel}>그림</Text>
          {emojis.map(card => (
            <CardButton key={card.id} card={card} onPress={handleCardPress} />
          ))}
        </View>
        <View style={styles.column}>
          <Text style={styles.columnLabel}>글자</Text>
          {words.map(card => (
            <CardButton key={card.id} card={card} onPress={handleCardPress} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CardButton({ card, onPress }: { card: Card; onPress: (c: Card) => void }) {
  const bg =
    card.state === 'matched' ? '#E8F5E9' :
    card.state === 'selected' ? '#FFF3E0' :
    card.state === 'wrong' ? '#FFEBEE' :
    colors.cardBg;

  const border =
    card.state === 'matched' ? colors.success :
    card.state === 'selected' ? colors.primary :
    card.state === 'wrong' ? colors.error :
    colors.cardBorder;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bg, borderColor: border }]}
      onPress={() => onPress(card)}
      activeOpacity={0.75}
      disabled={card.state === 'matched'}
    >
      {card.type === 'emoji'
        ? <Text style={styles.cardEmoji}>{card.emoji}</Text>
        : <Text style={styles.cardWord}>{card.word}</Text>
      }
      {card.state === 'matched' && <Text style={styles.checkMark}>✓</Text>}
    </TouchableOpacity>
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
  movesText: { fontSize: fontSize.body, fontWeight: 'bold', color: colors.text },
  instruction: {
    fontSize: fontSize.body, color: colors.textSoft,
    textAlign: 'center', marginVertical: spacing.sm,
  },
  grid: {
    flexDirection: 'row', paddingHorizontal: spacing.md,
    gap: spacing.md, paddingBottom: spacing.xl,
  },
  column: { flex: 1, gap: spacing.sm },
  columnLabel: {
    fontSize: fontSize.body, fontWeight: 'bold', color: colors.textSoft,
    textAlign: 'center', marginBottom: spacing.xs,
  },
  card: {
    borderRadius: 16, borderWidth: 2, padding: spacing.md,
    alignItems: 'center', justifyContent: 'center', minHeight: 80,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardEmoji: { fontSize: 40 },
  cardWord: { fontSize: fontSize.syllableMedium, fontWeight: 'bold', color: colors.text },
  checkMark: { position: 'absolute', top: 4, right: 8, fontSize: 14, color: colors.success, fontWeight: 'bold' },
  resultContainer: {
    flex: 1, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
    gap: spacing.lg, padding: spacing.xl,
  },
  resultEmoji: { fontSize: 80 },
  resultTitle: { fontSize: fontSize.button, fontWeight: 'bold', color: colors.text },
  resultMoves: { fontSize: fontSize.body, color: colors.textSoft },
  btn: { width: '100%', paddingVertical: spacing.md, borderRadius: 16, alignItems: 'center' },
  btnText: { fontSize: fontSize.button, fontWeight: 'bold', color: '#fff' },
});
