import * as Speech from 'expo-speech';

export function speak(text: string) {
  Speech.stop();
  Speech.speak(text, {
    language: 'ko-KR',
    rate: 0.7,
    pitch: 1.0,
  });
}

export function stopSpeech() {
  Speech.stop();
}
