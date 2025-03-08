import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to request and manage popup permission
 * @returns Object containing popup permission state and functions
 */
export function usePopupPermission() {
  const [popupPermissionDialogOpen, setPopupPermissionDialogOpen] = useState(false);
  const [popupPermissionStatus, setPopupPermissionStatus] = useState<'default' | 'granted' | 'denied'>('default');
  
  // Request popup permission
  const requestPopupPermission = useCallback(async () => {
    try {
      // Try to open a popup window
      const testPopup = window.open('about:blank', '_blank', 'width=1,height=1');
      
      // Check if the popup was blocked
      if (!testPopup || testPopup.closed || typeof testPopup.closed === 'undefined') {
        // Popup was blocked, show dialog to request permission
        setPopupPermissionStatus('denied');
        setPopupPermissionDialogOpen(true);
      } else {
        // Popup was allowed, close it immediately
        testPopup.close();
        setPopupPermissionStatus('granted');
      }
    } catch (error) {
      console.error('Error checking popup permission:', error);
      setPopupPermissionStatus('denied');
      setPopupPermissionDialogOpen(true);
    }
  }, []);

  // Check popup permission when component mounts
  useEffect(() => {
    requestPopupPermission();
  }, [requestPopupPermission]);

  return {
    popupPermissionDialogOpen,
    setPopupPermissionDialogOpen,
    popupPermissionStatus,
    requestPopupPermission
  };
}
