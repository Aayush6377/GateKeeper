import React, { useState } from 'react';
import WakeUpModal from './WakeUpModal';

interface AppWakeWrapperProps {
  children: React.ReactNode;
}

export default function AppWakeWrapper({ children }: AppWakeWrapperProps) {
  const [isWoken, setIsWoken] = useState<boolean>(() => {
    return sessionStorage.getItem('gatekeeper_woken') === 'true';
  });

  return (
    <>
      {!isWoken && <WakeUpModal onWokenUp={() => setIsWoken(true)} />}
      {children}
    </>
  );
}