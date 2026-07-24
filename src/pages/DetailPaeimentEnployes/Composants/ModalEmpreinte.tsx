import React, { useEffect, useRef, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';


const POLL_INTERVAL_MS = 1_500;

// Libellés selon l'action en cours
const ACTION_LABELS: Record<string, { titre: string; bouton: string; couleur: string }> = {
  confirmer_rh: {
    titre: 'Confirmer RH',
    bouton: 'Confirmer RH',
    couleur: 'success',
  },
  marquer_paye: {
    titre: 'Valider le paiement',
    bouton: 'Valider le paiement',
    couleur: 'primary',
  },
};

interface Props {
  isOpen: boolean;
  action: 'confirmer_rh' | 'marquer_paye' | null;
  employeId: number;
  loading: boolean;
  onConfirm: () => void;     // déclenché après clic sur le bouton de validation
  onCancel: () => void;      // ferme la modal et remet empreinteOk à false
}

const ModalEmpreinte: React.FC<Props> = ({
  isOpen,
  action,
  employeId,
  loading,
  onConfirm,
  onCancel,
}) => {
  // true uniquement lorsque le back confirme que l'empreinte correspond
  const [empreinteOk, setEmpreinteOk] = useState(false);
  const [erreur,      setErreur]      = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Démarre/arrête le polling selon l'ouverture de la modal
  useEffect(() => {
    if (!isOpen) {
      // Nettoyage à la fermeture
      stopPolling();
      setEmpreinteOk(false);
      setErreur(null);
      return;
    }

    startPolling();
    return () => stopPolling();
  }, [isOpen, employeId]);

  const startPolling = () => {
    stopPolling(); // sécurité : pas de double intervalle
    intervalRef.current = setInterval(async () => {
      try {
        /*
          TODO: remplacer par le vrai appel réseau :
            const res  = await fetch(`/empreinte/verify?employe_id=${employeId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.verified) { setEmpreinteOk(true); stopPolling(); }
        */

        // ── SIMULATION (à supprimer en production) ──────────────────
        // Simule une réponse positive après 4 secondes pour les tests.
        // Remplacer intégralement ce bloc par l'appel fetch ci-dessus.
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            setEmpreinteOk(true);
            stopPolling();
            resolve();
          }, 4_000);
        });
        // ─────────────────────────────────────────────────────────────

      } catch {
        setErreur('Erreur de connexion au terminal. Vérifiez le branchement USB.');
      }
    }, POLL_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  if (!action) return null;

  const { titre, bouton, couleur } = ACTION_LABELS[action];

  return (
    <Modal isOpen={isOpen} toggle={onCancel} centered>
      <ModalHeader toggle={onCancel} className="border-0 pb-0">
        <i className={`ri-fingerprint-line text-${couleur} me-2`} />
        {titre}
      </ModalHeader>

      <ModalBody className="text-center py-4">
        {!empreinteOk ? (
          <>
            {/* Animation d'attente de l'empreinte */}
            <div className="mb-3">
              <div
                className={`avatar-xl mx-auto mb-3 rounded-circle bg-${couleur}-subtle d-flex align-items-center justify-content-center`}
                style={{
                  width: 80,
                  height: 80,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                <i className={`ri-fingerprint-line text-${couleur} fs-1`} />
              </div>
              <style>{`
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50%       { transform: scale(1.08); opacity: 0.7; }
                }
              `}</style>
            </div>

            <h6 className="fw-semibold mb-1">En attente de l'empreinte</h6>
            <p className="text-muted fs-13 mb-0">
              Demandez à l'employé de poser son doigt sur le terminal USB.
            </p>

            {/* Erreur de connexion terminal */}
            {erreur && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mt-3 text-start">
                <i className="ri-usb-line fs-16" />
                <span className="fs-13">{erreur}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Empreinte validée — bouton d'action débloqué */}
            <div className="mb-3">
              <div
                className="avatar-xl mx-auto mb-3 rounded-circle bg-success-subtle d-flex align-items-center justify-content-center"
                style={{ width: 80, height: 80 }}
              >
                <i className="ri-checkbox-circle-line text-success fs-1" />
              </div>
            </div>
            <h6 className="fw-semibold text-success mb-1">Empreinte vérifiée ✓</h6>
            <p className="text-muted fs-13 mb-0">
              Identité confirmée. Vous pouvez maintenant valider l'action.
            </p>
          </>
        )}
      </ModalBody>

      <ModalFooter className="border-0 pt-0">
        <Button color="light" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>

        {/*
          Le bouton de validation n'apparaît QUE si l'empreinte est vérifiée.
          Avant cela, il reste masqué — l'employé ne peut pas bypasser.
        */}
        {empreinteOk && (
          <Button color={couleur} onClick={onConfirm} disabled={loading}>
            {loading
              ? <span className="spinner-border spinner-border-sm me-1" />
              : <i className={`ri-check-double-line me-1`} />
            }
            {bouton}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ModalEmpreinte;