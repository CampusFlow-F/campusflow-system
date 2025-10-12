
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PushNotificationToggle = () => {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

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
      onClick={isSubscribed ? unsubscribe : subscribe}
      variant={isSubscribed ? "default" : "outline"}
      className="gap-2"
    >
      {isSubscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      {isSubscribed ? 'Notifications On' : 'Enable Notifications'}
    </Button>
  );
};

export default PushNotificationToggle;
