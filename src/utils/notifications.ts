import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const REMINDER_CHANNEL_ID = 'daily-learning-reminders';
const REMINDER_IDS = ['daily-learning-morning', 'daily-learning-afternoon'];

const reminderTimes = [
  {
    id: REMINDER_IDS[0],
    hour: 9,
    minute: 0,
    body: '오늘도 한글 소리 한번 들어볼까요?',
  },
  {
    id: REMINDER_IDS[1],
    hour: 14,
    minute: 0,
    body: '잠깐만 한글 짝 맞추기 해볼까요?',
  },
];

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: '매일 한글 알림',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF7043',
  });
}

async function hasNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function areDailyRemindersScheduled(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledIds = scheduled.map(item => item.identifier);
  return REMINDER_IDS.every(id => scheduledIds.includes(id));
}

export async function requestAndScheduleDailyReminders(): Promise<boolean> {
  await ensureNotificationChannel();

  const alreadyGranted = await hasNotificationPermission();
  const permission = alreadyGranted
    ? await Notifications.getPermissionsAsync()
    : await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });

  const allowed =
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

  if (!allowed) {
    return false;
  }

  await cancelDailyReminders();

  await Promise.all(reminderTimes.map(reminder => (
    Notifications.scheduleNotificationAsync({
      identifier: reminder.id,
      content: {
        title: '할머니 한글',
        body: reminder.body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: REMINDER_CHANNEL_ID,
        hour: reminder.hour,
        minute: reminder.minute,
      },
    })
  )));

  return true;
}

export async function cancelDailyReminders(): Promise<void> {
  await Promise.all(
    REMINDER_IDS.map(id => Notifications.cancelScheduledNotificationAsync(id))
  );
}
