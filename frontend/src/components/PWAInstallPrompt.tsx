import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isInStandaloneMode = () => {
      return (window.matchMedia('(display-mode: standalone)').matches) || 
             (window.navigator as any).standalone || 
             document.referrer.includes('android-app://');
    };

    if (isInStandaloneMode()) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (sessionStorage.getItem('pwa-install-dismissed') === 'true') {
    return null;
  }

  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="pwa-install-prompt">
      <Alert variant="primary" className="mb-0">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1 me-3">
            <Alert.Heading className="h6 mb-2">
              <i className="fas fa-mobile-alt me-2"></i>
              Install RentaCloud
            </Alert.Heading>
            <p className="mb-2" style={{ fontSize: '0.875rem' }}>
              Install our app on your home screen for quick and easy access!
            </p>
            <div className="d-flex gap-2">
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleInstallClick}
              >
                <i className="fas fa-download me-1"></i>
                Install
              </Button>
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={handleDismiss}
              >
                Later
              </Button>
            </div>
          </div>
          <Button 
            variant="link" 
            className="btn-close btn-close-white p-0" 
            onClick={handleDismiss}
            aria-label="Close"
          />
        </div>
      </Alert>
    </div>
  );
};

export default PWAInstallPrompt;