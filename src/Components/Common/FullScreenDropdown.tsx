import { getUser, setUser } from 'pages/Authentication/utilis';
import { settingsService } from 'pages/TableauBord/Services/SettingsService';
import React, { useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 500;

const FullScreenDropdown = () => {
  // true = pas en plein écran (icône "entrer"), false = en plein écran (icône "sortir")
  const [isFullScreenMode, setIsFullScreenMode] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const screenMode = getUser()?.setting?.zoom;
    setIsFullScreenMode(screenMode ?? true);
  }, []);

  // Enregistré une seule fois au montage, pas à chaque clic
  useEffect(() => {
    const exitHandler = () => {
      const doc = document as any;
      if (!doc.webkitIsFullScreen && !doc.mozFullScreen && !doc.msFullscreenElement) {
        document.body.classList.remove('fullscreen-enable');
      }
    };
    document.addEventListener('fullscreenchange', exitHandler);
    document.addEventListener('webkitfullscreenchange', exitHandler);
    document.addEventListener('mozfullscreenchange', exitHandler);
    return () => {
      document.removeEventListener('fullscreenchange', exitHandler);
      document.removeEventListener('webkitfullscreenchange', exitHandler);
      document.removeEventListener('mozfullscreenchange', exitHandler);
    };
  }, []);

  // Persiste la préférence en base, débounce réel (annule le précédent timeout)
  const persistZoom = (nextValue: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      settingsService
        .patchSettings({ zoom: nextValue }, { silentLoading: true, silentSuccess: true } as any)
        .then(() => {
          const user = getUser();
          if (user) setUser({ ...user, settings: { ...user.settings, zoom: nextValue } });
        })
        .catch(() => {
          // le toast d'erreur global s'affiche automatiquement ; on resynchronise l'UI
          setIsFullScreenMode(!nextValue);
        });
    }, DEBOUNCE_MS);
  };

  const toggleFullscreen = () => {
    const doc = document as any;
    doc.body.classList.add('fullscreen-enable');

    const currentlyInFullscreen =
      doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement;

    if (!currentlyInFullscreen) {
      const request =
        doc.documentElement.requestFullscreen ??
        doc.documentElement.mozRequestFullScreen ??
        doc.documentElement.webkitRequestFullscreen;
      request?.call(doc.documentElement)?.catch?.(() => {
        // API refusée par le navigateur : on annule le changement d'état visuel
        setIsFullScreenMode(true);
      });
      setIsFullScreenMode(false);
      persistZoom(false);
    } else {
      const cancel = doc.cancelFullScreen ?? doc.mozCancelFullScreen ?? doc.webkitCancelFullScreen;
      cancel?.call(doc);
      setIsFullScreenMode(true);
      persistZoom(true);
    }
  };

  return (
    <div className="ms-1 header-item d-none d-sm-flex">
      <button
        onClick={toggleFullscreen}
        type="button"
        className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
      >
        <i className={isFullScreenMode ? 'bx bx-fullscreen fs-22' : 'bx bx-exit-fullscreen fs-22'} />
      </button>
    </div>
  );
};

export default FullScreenDropdown;