
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { toast } from '@/hooks/use-toast';

const PWAInstallButton = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installApp();
      toast({
        title: "App Installed!",
        description: "CampusFlow has been added to your home screen."
      });
    } catch (error) {
      toast({
        title: "Installation Failed",
        description: "Failed to install the app. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsInstalling(false);
    }
  };

  if (isInstalled) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Smartphone className="h-4 w-4" />
        App Installed
      </Button>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button 
      onClick={handleInstall} 
      disabled={isInstalling}
      className="gap-2"
      variant="outline"
    >
      <Download className="h-4 w-4" />
      {isInstalling ? 'Installing...' : 'Install App'}
    </Button>
  );
};

export default PWAInstallButton;
