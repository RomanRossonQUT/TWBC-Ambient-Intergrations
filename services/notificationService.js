// Notification service for push notifications
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  // Request permissions and get push token
  async initialize() {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      this.expoPushToken = await Notifications.getExpoPushTokenAsync();
      console.log('Push token:', this.expoPushToken.data);
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      this.isInitialized = true;
      return this.expoPushToken.data;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  // Send a local notification
  async sendLocalNotification(title, body, data = {}) {
    try {
      if (!this.isInitialized) {
        console.log('Notification service not initialized, skipping local notification');
        return;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Send push notification to another user
  async sendPushNotification(expoPushToken, title, body, data = {}) {
    try {
      if (!this.isInitialized) {
        console.log('Notification service not initialized, skipping push notification');
        return;
      }

      const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data,
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    try {
      if (!this.isInitialized) {
        console.log('Notification service not initialized, skipping listeners');
        return;
      }

      // Listener for notifications received while app is running
      this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

      // Listener for notification responses (when user taps notification)
      this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        const data = response.notification.request.content.data;
        
        // Handle navigation based on notification data
        if (data.type === 'message') {
          // Navigate to conversation
          // This would need to be integrated with your navigation system
          console.log('Navigate to conversation:', data.conversationId);
        }
      });
    } catch (error) {
      console.error('Error setting up notification listeners:', error);
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Get the current push token
  getPushToken() {
    return this.expoPushToken?.data;
  }
}

export default new NotificationService();
