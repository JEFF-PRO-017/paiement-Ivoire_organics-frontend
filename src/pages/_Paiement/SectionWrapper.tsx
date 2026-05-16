import React, { useEffect, useRef, useState } from 'react';
import { SectionKey } from './useDashboard';

interface Props {
  sectionKey: SectionKey;
  label: string;
  visible: boolean | null;
  onClose: (key: SectionKey) => void;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}

const SectionWrapper: React.FC<Props> = ({
  sectionKey, label, visible, onClose, children, skeleton,
}) => {
  const [render, setRender] = useState(false);
  const [cls, setCls]       = useState('');
  const timer               = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    if (visible === null) { setRender(true); setCls(''); return; }
    if (visible) {
      setRender(true);
      timer.current = setTimeout(() => setCls('section-fade-in'), 10);
    } else {
      setCls('section-fade-out');
      timer.current = setTimeout(() => setRender(false), 290);
    }
    return () => clearTimeout(timer.current);
  }, [visible]);

  if (!render) return null;

  return (
    <div className={`section-wrapper position-relative ${cls}`}>
      {/* Croix Velzon — opacity 0 par défaut, 1 au survol via dashboard.scss */}
      <button
        className="btn-close-section btn btn-icon btn-sm btn-soft-danger position-absolute top-0 end-0 m-2"
        title={`Masquer ${label}`}
        style={{ zIndex: 10 }}
        onClick={() => onClose(sectionKey)}
      >
        <i className="ri-close-line fs-14" />
      </button>
      {visible === null ? skeleton : children}
    </div>
  );
};

export default SectionWrapper;