import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useState } from 'react';

const PushNotificationToggle = () => {
  const { isSupported, isSubscribed, subscribe, unsubscribe, isLoading } = usePushNotifications();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Student-specific notification types
  const notificationTypes = [
    "Class updates",
    "Assignment deadlines", 
    "Schedule changes",
    "Study materials",
    "Campus announcements"
  ];

  if (!isSupported) {
    return (
      <div className="flex flex-col gap-2">
        <Button variant="outline" disabled className="gap-2 w-full">
          <BellOff className="h-4 w-4" />
          Notifications Not Supported
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Your browser doesn't support push notifications
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="gap-2 w-full">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking notifications...
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button 
        onClick={handleToggle}
        variant={isSubscribed ? "default" : "outline"}
        disabled={isProcessing}
        className="gap-2 w-full"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSubscribed ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
        {isProcessing ? 'Processing...' : isSubscribed ? 'Notifications Enabled' : 'Enable Notifications'}
      </Button>
      
      {isSubscribed && (
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">You'll receive alerts for:</p>
          <ul className="space-y-1">
            {notificationTypes.map((type, index) => (
              <li key={index} className="flex items-center gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                {type}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PushNotificationToggle;