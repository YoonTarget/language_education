import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import SoundMatchingScreen from './src/screens/SoundMatchingScreen';
import MemoryCardScreen from './src/screens/MemoryCardScreen';

export type RootStackParamList = {
  Home: undefined;
  Learn: { stage: 1 | 2 | 3 };
  Practice: { stage: 1 | 2 | 3 };
  SoundMatching: { stage: 1 | 2 | 3 };
  MemoryCard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFF9F0' } }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Learn" component={LearnScreen} />
        <Stack.Screen name="Practice" component={PracticeScreen} />
        <Stack.Screen name="SoundMatching" component={SoundMatchingScreen} />
        <Stack.Screen name="MemoryCard" component={MemoryCardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
