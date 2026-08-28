import { useEffect, useRef, useState } from "react";
import { LAYOUT_MODE_TYPES, ApiThemeMode, apiModeToLayout } from "../constants/layout";
import { getUser, setUser } from "pages/Authentication/utilis";
import { settingsService } from "pages/TableauBord/Services/SettingsService";

interface LightDarkProps {
  layoutMode: string;
  onChangeLayoutMode: (mode: string) => void;
}

const DEBOUNCE_MS = 500;

const LightDark = ({ layoutMode, onChangeLayoutMode }: LightDarkProps) => {
  const [mode, setMode] = useState<ApiThemeMode>(getUser()?.setting?.mode??'CLAIR');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    console.log('je viens LECOMPOSNANT CLAR SOMBRE')

  onChangeLayoutMode(apiModeToLayout(mode))

  useEffect(() => {
    setMode(getUser()?.setting?.mode);
  }, [getUser]);

  // Nettoie le timeout en attente si le composant se démonte pendant le debounce
  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const toggleMode = () => {
    const nextMode: ApiThemeMode = mode === 'CLAIR' ? 'SOMBRE' : 'CLAIR';

    // Optimistic UI : le layout change tout de suite, sans attendre le backend
    setMode(nextMode);
    onChangeLayoutMode(apiModeToLayout(nextMode));

    // Debounce réel : un clic rapide répété annule le précédent timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      settingsService
        .patchSettings(
          { mode: nextMode },
          { silentLoading: true, silentSuccess: true } as any, // pas d'overlay ni de toast pour un simple toggle
        )
        .then(() => {
          const user = getUser();
          if (user) {
            setUser({ ...user, settings: { ...user.settings, mode: nextMode } });
          }
        })
        .catch(() => {
          // Le toast d'erreur global s'affichera automatiquement (pas silentError ici).
          // On resynchronise l'UI sur l'état réel en cas d'échec.
          setMode(mode);
          onChangeLayoutMode(apiModeToLayout(mode));
        });
    }, DEBOUNCE_MS);
  };

  return (
    <div className="ms-1 header-item d-none d-sm-flex">
      <button
        onClick={toggleMode}
        type="button"
        className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle light-dark-mode"
        aria-label={mode === 'CLAIR' ? 'Activer le mode sombre' : 'Activer le mode clair'}
      >
        <i className={`bx ${mode === 'CLAIR' ? 'bx-moon' : 'bx-sun'} fs-22`} />
      </button>
    </div>
  );
};

export default LightDark;