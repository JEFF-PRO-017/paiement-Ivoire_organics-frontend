import { STATUT_CHOICES_ATTENDANCE } from 'pages/Utils/types';
import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

export type DayAction = { date: string; attendanceId?: number,statut:STATUT_CHOICES_ATTENDANCE };

interface Props {
  isOpen: boolean;
  dayAction: DayAction | null;
  nomEmploye?: string;
  onClose: () => void;
  onChoisirCreer: () => void;
  onChoisirSupprimer: () => void;
}

const DayActionModal: React.FC<Props> = ({
  isOpen, dayAction, nomEmploye, onClose, onChoisirCreer, onChoisirSupprimer,
}) => (
  <Modal isOpen={isOpen} toggle={onClose} centered zIndex={1060}>
    <ModalHeader toggle={onClose}>Action sur le jour</ModalHeader>
    <ModalBody>
      <p className="mb-1"><strong>Employé :</strong> {nomEmploye}</p>
      <p className="mb-0"><strong>Jour :</strong> {dayAction?.date}</p>
    </ModalBody>
    <ModalFooter>
      <Button color="light" onClick={onClose}>Annuler</Button>
      {dayAction?.attendanceId || dayAction?.statut === 'EN_COURS_TRAITEMENT_SUPPRESION' ? (
        <Button color="danger" onClick={onChoisirSupprimer}>
          <i className="ri-delete-bin-line align-middle me-1" />Supprimer la présence
        </Button>
      ) : (
        <Button color="success" onClick={onChoisirCreer}>
          <i className="ri-add-line align-middle me-1" />{dayAction?.statut==='EN_COURS_TRAITEMENT_CREATION'?'Confirmer la Creation':'Créer la présence'}
        </Button>
      )}
    </ModalFooter>
  </Modal>
);

export default DayActionModal;