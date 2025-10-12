
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setSubscription(subscription);
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error('Service worker not registered');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa40HI8qMnuWGLMH0Gvqa-6vrArN1Lol8YzK5R23k3tB4h6nxSF8fNzTXWs1k0'
        )
      });

      if (user) {
        // Save subscription to database
        await supabase
          .from('push_subscriptions')
          .insert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!)
          });
      }

      setSubscription(subscription);
      setIsSubscribed(true);
      
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive push notifications for important updates."
      });
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Notification Error",
        description: "Failed to enable push notifications. Please try again.",
        variant: "destructive"
      });
    }
  };

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        
        if (user) {
          // Remove subscription from database
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint);
        }
      }

      setSubscription(null);
      setIsSubscribed(false);
      
      toast({
        title: "Notifications Disabled",
        description: "You'll no longer receive push notifications."
      });
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: "Error",
        description: "Failed to disable notifications. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe
  };
};

// Helper functions
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
