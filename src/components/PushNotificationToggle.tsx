import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// Add a sound file to your public folder, e.g., /public/notification.mp3
const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play();
};

const showBrowserNotification = () => {
  if (window.Notification && Notification.permission === 'granted') {
    new Notification('CampusFlow', {
      body: 'Notifications enabled!',
      icon: '/icon.png', // Optional: add your icon
    });
    playNotificationSound();
  }
};

const PushNotificationToggle = () => {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  const handleSubscribe = async () => {
    await subscribe();
    if (window.Notification) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          showBrowserNotification();
        }
      } else if (Notification.permission === 'granted') {
        showBrowserNotification();
      }
    }
  };

  if (!isSupported) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <BellOff className="h-4 w-4" />
        Not Supported
      </Button>
    );
  }

  return (
    <Button
      onClick={isSubscribed ? unsubscribe : handleSubscribe}
      variant={isSubscribed ? "default" : "outline"}
      className="gap-2"
    >
      {isSubscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      {isSubscribed ? 'Notifications On' : 'Enable Notifications'}
    </Button>
  );
};

export default PushNotificationToggle;
