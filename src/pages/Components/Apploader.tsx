import React from 'react';
import {
  Alert, Button, Col, Container, Row,
} from 'reactstrap';

interface AppLoaderProps {
  /** Affiche l'overlay de chargement */
  loading: boolean;
  /** Message d'erreur à afficher (null/undefined = pas d'erreur) */
  error?: string | null;
  /** Texte affiché sous le spinner pendant le chargement */
  label?: string;
  /** Callback optionnel pour réessayer après une erreur */
  onRetry?: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1080, // au-dessus des modals Bootstrap (1055)
  background: 'rgba(15, 23, 42, 0.45)', // laisse deviner la vue derrière
  backdropFilter: 'blur(6px) saturate(120%)',
  WebkitBackdropFilter: 'blur(6px) saturate(120%)',
  animation: 'al-fade-in 0.25s ease-out',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.92)',
  borderRadius: '1.25rem',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.08)',
  padding: '2.75rem 2rem',
  textAlign: 'center',
  animation: 'al-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
};

const ringWrapStyle: React.CSSProperties = {
  position: 'relative',
  width: '4rem',
  height: '4rem',
  margin: '0 auto 1.25rem',
};

const AppLoader: React.FC<AppLoaderProps> = ({
  loading,
  error,
  label = 'Chargement en cours…',
  onRetry,
}) => {
  if (!loading && !error) return null;

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={overlayStyle}
      role={error ? 'alert' : 'status'}
      aria-live={error ? 'assertive' : 'polite'}
      aria-busy={loading && !error}
    >
      <style>{`
        @keyframes al-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes al-pop-in {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes al-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes al-pulse {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50% { opacity: 0.9; transform: scale(1); }
        }
        .al-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 4px solid transparent;
          border-top-color: #6366f1;
          border-right-color: #6366f1;
          animation: al-spin 0.85s linear infinite;
        }
        .al-core {
          position: absolute;
          inset: 10px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #818cf8, #6366f1);
          animation: al-pulse 1.6s ease-in-out infinite;
        }
        .al-label {
          color: #475569;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.01em;
        }
        @media (prefers-reduced-motion: reduce) {
          .al-ring, .al-core { animation: none; }
        }
      `}
      </style>
      <Container>
        <Row className="justify-content-center">
          <Col xs="11" sm="7" md="4" lg="3">
            <div style={cardStyle}>
              {error ? (
                <>
                  <Alert color="danger" className="text-start mb-3" fade={false}>
                    {error}
                  </Alert>
                  {onRetry && (
                    <Button color="primary" outline onClick={onRetry}>
                      Réessayer
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <div style={ringWrapStyle}>
                    <div className="al-ring" />
                    <div className="al-core" />
                  </div>
                  <p className="al-label mb-0">{label}</p>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AppLoader;