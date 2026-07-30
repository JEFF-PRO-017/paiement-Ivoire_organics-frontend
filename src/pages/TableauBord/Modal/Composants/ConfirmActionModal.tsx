import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

export type ConfirmMode = 'create' | 'delete' | null;

interface Props {
  mode: ConfirmMode;
  date?: string;
  nomEmploye?: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmActionModal: React.FC<Props> = ({ mode, date, nomEmploye, busy, onCancel, onConfirm }) => (
  <Modal isOpen={!!mode} toggle={onCancel} centered zIndex={1070}>
    <ModalHeader toggle={onCancel}>Confirmation</ModalHeader>
    <ModalBody>
      Êtes-vous sûr de vouloir {mode === 'create' ? 'créer' : 'supprimer'} une présence
      pour <strong>{nomEmploye}</strong> le <strong>{date}</strong> ?
    </ModalBody>
    <ModalFooter>
      <Button color="light" onClick={onCancel} disabled={busy}>Annuler</Button>
      <Button color={mode === 'create' ? 'success' : 'danger'} onClick={onConfirm} disabled={busy}>
        {busy ? 'En cours…' : 'Oui'}
      </Button>
    </ModalFooter>
  </Modal>
);

export default ConfirmActionModal;