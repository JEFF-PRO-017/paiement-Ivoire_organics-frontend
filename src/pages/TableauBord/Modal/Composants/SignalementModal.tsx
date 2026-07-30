import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label } from 'reactstrap';

export type ReportMode = 'create' | 'delete' | null;

interface Props {
  mode: ReportMode;
  date?: string;
  nomEmploye?: string;
  raison: string;
  busy: boolean;
  onRaisonChange: (v: string) => void;
  onCancel: () => void;
  onEnvoyer: () => void;
}

const SignalementModal: React.FC<Props> = ({
  mode, date, nomEmploye, raison, busy, onRaisonChange, onCancel, onEnvoyer,
}) => {
  const titre = mode === 'create'
    ? `Demande de création de présence — ${nomEmploye ?? ''}`
    : `Demande de suppression de présence — ${nomEmploye ?? ''}`;

  return (
    <Modal isOpen={!!mode} toggle={onCancel} centered zIndex={1070}>
      <ModalHeader toggle={onCancel}>Signaler au service maintenance</ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <Label className="fw-medium">Titre</Label>
          <Input disabled value={titre} />
        </div>
        <div className="mb-3">
          <Label className="fw-medium">Jour</Label>
          <Input disabled value={date ?? ''} />
        </div>
        <div className="mb-0">
          <Label className="fw-medium">Raison <span className="text-danger">*</span></Label>
          <Input
            type="textarea"
            rows={4}
            value={raison}
            onChange={e => onRaisonChange(e.target.value)}
            placeholder="Expliquez la raison de cette demande…"
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onCancel} disabled={busy}>Annuler</Button>
        <Button color="primary" onClick={onEnvoyer} disabled={!raison.trim() || busy}>
          {busy ? 'Envoi…' : <><i className="ri-send-plane-line align-middle me-1" />Envoyer au service suivi</>}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SignalementModal;