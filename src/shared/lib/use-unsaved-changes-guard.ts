'use client';

import { useEffect } from 'react';

export function useUnsavedChangesGuard(enabled: boolean, message = 'You have unsaved changes. Leave page?') {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = message;
    }

    function onDocumentClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) {
        return;
      }

      const shouldLeave = window.confirm(message);
      if (!shouldLeave) {
        event.preventDefault();
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onDocumentClick, true);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onDocumentClick, true);
    };
  }, [enabled, message]);
}
