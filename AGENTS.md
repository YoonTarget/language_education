# AGENTS.md — 할머니 한글 앱

## 프로젝트 개요
한국어를 말할 수 있지만 한글을 읽지 못하는 어르신을 위한 **게임형 한글 문해 교육 앱**.  
React Native + Expo 기반, iOS/Android 동시 지원, 오프라인 우선.

## 기술 스택
- **프레임워크**: React Native + Expo (SDK 52+)
- **언어**: TypeScript (strict)
- **네비게이션**: `@react-navigation/native` + `@react-navigation/native-stack`
- **TTS**: `expo-speech` (언어: `ko-KR`, rate: 0.7)
- **저장**: `@react-native-async-storage/async-storage`

## 실행 명령어
```bash
npm start          # Expo 개발 서버 시작
npm run android    # Android 에뮬레이터 실행
npm run ios        # iOS 시뮬레이터 실행 (macOS만 가능)
npx tsc --noEmit   # 타입 체크
```

## 폴더 구조
```
src/
  curriculum/data.ts    # 학습 데이터 (음절, 단어 쌍)
  screens/              # HomeScreen, SoundMatchingScreen, MemoryCardScreen
  theme/index.ts        # 색상, 폰트 크기, 간격
  utils/speech.ts       # expo-speech TTS 래퍼
  utils/storage.ts      # AsyncStorage 진행도 저장
```

## 핵심 설계 원칙
1. **소리 우선**: 모든 글자/단어는 탭하면 즉시 TTS 재생 (`ko-KR`, 느린 속도)
2. **어르신 친화 UI**: 최소 버튼 크기 확보, 고대비 색상, 글자 크기 32pt 이상
3. **따뜻한 피드백**: 오답도 긍정적 메시지, 정답을 바로 보여줌
4. **오프라인 우선**: 네트워크 불필요, AsyncStorage로 진행도 로컬 저장

## 커리큘럼 (현재 MVP: 1~2단계)
| 단계 | 내용 | 데이터 위치 |
|------|------|------------|
| 1단계 | 기본 모음 10개 (아야어여오요우유으이) | `stage1` |
| 2단계 | 기본 자음+ㅏ 13개 (가나다라..하) | `stage2` |

## 게임 모드 (MVP)
- **소리 찾기** (`SoundMatchingScreen`): TTS 소리 → 4보기 중 글자 선택, 10문항 라운드
- **짝 맞추기** (`MemoryCardScreen`): 이모지↔단어 카드 뒤집기 매칭, 6쌍 12장

## 네비게이션 타입
```typescript
// App.tsx
export type RootStackParamList = {
  Home: undefined;
  SoundMatching: { stage: 1 | 2 };
  MemoryCard: undefined;
};
```

## 코딩 컨벤션
- 컴포넌트: PascalCase 함수형, `StyleSheet.create` 사용
- 스타일: `theme/index.ts`의 `colors`, `fontSize`, `spacing` 값 사용 (하드코딩 금지)
- TTS: 직접 `Speech.speak` 호출 금지 → 반드시 `utils/speech.ts`의 `speak()` 사용
- 저장: `AsyncStorage` 직접 접근 금지 → `utils/storage.ts` 경유
