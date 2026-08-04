import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

export type ConfirmationAction = 'confirmer_rh' | 'marquer_paye' | null;

interface Props {
  action: ConfirmationAction;
  nbConcernes: number;
  montant: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LABELS: Record<Exclude<ConfirmationAction, null>, { titre: string; verbe: string; couleur: string }> = {
  confirmer_rh: { titre: 'Confirmer RH', verbe: 'confirmer', couleur: 'success' },
  marquer_paye: { titre: 'Marquer comme payé', verbe: 'marquer comme payées', couleur: 'primary' },
};

const ConfirmationModal: React.FC<Props> = ({ action, nbConcernes, montant, loading, onCancel, onConfirm }) => {
  if (!action) return <Modal isOpen={false} />;
  const { titre, verbe, couleur } = LABELS[action];

  return (
    <Modal isOpen={!!action} toggle={onCancel} centered>
      <ModalHeader toggle={onCancel}>{titre}</ModalHeader>
      <ModalBody>
        <p className="mb-1">
          Vous allez {verbe} <strong>{nbConcernes}</strong> présence{nbConcernes > 1 ? 's' : ''}.
        </p>
        <p className="text-muted mb-0">Montant total concerné : <strong>{montant}</strong></p>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onCancel} disabled={loading}>Annuler</Button>
        <Button color={couleur} onClick={onConfirm} disabled={loading}>
          {loading ? 'En cours…' : 'Confirmer'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;