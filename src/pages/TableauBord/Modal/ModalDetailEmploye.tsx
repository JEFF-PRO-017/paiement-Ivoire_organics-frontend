import React, { useMemo, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Badge, Row, Col,
} from 'reactstrap';
import { createColumnHelper } from '@tanstack/react-table';
import { toast } from 'react-toastify';
import { EmployeAttendanceGroup, AttendanceItem, StatutEmploye, StatutPortefeuille, STATUT_CHOICES_ATTENDANCE } from '../../Utils/types';
import { getUser } from 'pages/Authentication/utilis';
import { attendanceService } from '../Services/AttendanceService';
import { signalementService } from '../Services/SignalementService';
import TableContainer from 'pages/Components/TableContainer'; // ← même composant que TableauEnAttente/TableauImpayes
import ConfirmActionModal, { ConfirmMode } from './Composants/ConfirmActionModal';
import DayActionModal, { DayAction } from './Composants/DayActionModal';
import SignalementModal, { ReportMode } from './Composants/SignalementModal';



const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';
const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// couleur du badge selon statut_paiement (inclut EN_COURS_TRAITEMENT en violet)
const statutBadgeClass = (s: string) => {
  if (s === 'PAYE') return 'bg-success-subtle text-success';
  if (s === 'EN_ATTENTE') return 'bg-warning-subtle text-warning';
  if (s === 'EN_COURS_TRAITEMENT') return 'bg-purple-subtle text-purple';
  if (s === 'IMPAYE') return 'bg-danger-subtle text-danger';
  if (s === 'EN_COURS') return 'bg-info-subtle text-info';
  return 'bg-secondary-subtle text-secondary';
};

// ⚠️ adaptez selon le champ réel de rôle dans AuthUser
const isAdmin = () => {
  const user = getUser() as any;
  return user?.role === 'admin' || user?.is_admin === true;
};

const col = createColumnHelper<AttendanceItem>();

interface Props {
  group: EmployeAttendanceGroup | null;
  isOpen: boolean;
  toggle: () => void;
  onViewPortefeuille?: (row: EmployeAttendanceGroup) => void;
  onConfirmerRH?: (ids: number[]) => void;
  onRefetch?: () => void; // branchez sur enAttente.refetch / impayes.refetch du hook useDashboard
}

const ModalDetailEmploye: React.FC<Props> = ({
  group, isOpen, toggle, onViewPortefeuille, onConfirmerRH, onRefetch,
}) => {
  const g = group;
  const emp = g?.employe;
  const attendances = g?.attendance_list ?? [];


  const initiales = emp?.nom_complet.split(' ').map(n => n[0]).slice(0, 2).join('') ?? '';
  const nbJours = attendances.length;
  const montantDu = attendances.reduce((acc, a) => acc + parseFloat(a.montant_journalier), 0);
  const totalHeures = attendances.reduce((acc, a) => acc + (a.worked_hours ?? 0), 0);
  const enAttenteIds = attendances.filter(a => a.statut_paiement === 'EN_ATTENTE').map(a => a.id);

  // Map jour ISO -> AttendanceItem, pour retrouver le statut de chaque jour marqué dans le calendrier
  const joursMarques = new Map(attendances.map(a => [a.date, a]));

  const [dayAction, setDayAction] = useState<DayAction | null>(null);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null);
  const [reportMode, setReportMode] = useState<ReportMode>(null);
  const [raison, setRaison] = useState('');
  const [busy, setBusy] = useState(false);

  // ─── Fermetures explicites, une par modal ───────────────────────────────
  const closeDayActionModal = () => setDayAction(null);
  const closeConfirmModal = () => { setConfirmMode(null); setDayAction(null); };
  const closeSignalementModal = () => { setReportMode(null); setDayAction(null); setRaison(''); };

  const handleActionClick = (action: 'create' | 'delete') => {
    if (isAdmin()) setConfirmMode(action);
    else setReportMode(action);
  };

  // ─── Admin : création ou archivage direct ──────────────────────────────
  const handleConfirmed = async () => {
    if (!dayAction || !emp || !confirmMode) return;
    setBusy(true);
    try {
      if (confirmMode === 'create' && !dayAction.attendanceId) {
        await attendanceService.creerPresence({
          employe_id: emp.id,
          action: 'sign_out',                        // ⚠️ valeur par défaut
          date_work: `${dayAction.date}T08:00:00Z`,   // ⚠️ heure par défaut
        });
        toast.success('Présence créée et mise en attente');
      } else if (dayAction.attendanceId) {
        if (dayAction.statut === StatutPortefeuille.EN_COURS_TRAITEMENT_SUPPRESION)
          await attendanceService.mettreAJourStatutPaiement([dayAction.attendanceId], StatutPortefeuille.ARCHIVE);
        if (dayAction.statut === StatutPortefeuille.EN_COURS_TRAITEMENT_CREATION)
          await attendanceService.mettreAJourStatutPaiement([dayAction.attendanceId], StatutPortefeuille.EN_ATTENTE);
      }
      onRefetch?.();
      closeConfirmModal(); // ← ferme confirmation + modal d'action jour après succès
    } catch {
      toast.error("Une erreur est survenue lors de l'opération");
    } finally {
      setBusy(false);
    }
  };

  // ─── Non-admin : signalement au service maintenance ────────────────────
  const handleEnvoyerSignalement = async () => {
    if (!raison.trim() || !dayAction || !emp || !reportMode) return;
    setBusy(true);
    try {
      await signalementService.envoyer({
        employe_id: emp.id,
        type_demande: reportMode === 'create' ? 'CREATION' : 'SUPPRESSION',
        jour: dayAction.date,
        raison,
      });
      toast.success('Signalement envoyé au service maintenance');
      onRefetch?.();
      closeSignalementModal(); // ← ferme signalement + modal d'action jour après succès
    } catch {
      toast.error("Échec de l'envoi du signalement");
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => [
    col.accessor('date', {
      header: 'Date',
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('fr-FR'),
    }),
    col.accessor('action', {
      header: 'Action',
      cell: ({ getValue }) => <span className="text-muted">{getValue()}</span>,
    }),
    col.accessor('worked_hours', {
      header: 'Heures',
      cell: ({ getValue }) => `${getValue()}h`,
    }),
    col.accessor(a => parseFloat(a.montant_journalier), {
      id: 'montant', header: 'Montant',
      cell: ({ getValue }) => <span className="fw-medium">{fmt(getValue())}</span>,
    }),
    col.accessor('statut_paiement', {
      header: 'Statut',
      cell: ({ getValue }) => <Badge className={statutBadgeClass(getValue())}>{getValue()}</Badge>,
    }),
    col.accessor('statut_attendance', {
      header: 'Statut A',
      cell: ({ getValue }) => <Badge className={statutBadgeClass(getValue())}>{getValue()}</Badge>,
    }),
    col.accessor('date_validation_paiement', {
      header: 'Validé le',
      cell: ({ getValue }) => (
        <span className="text-muted fs-13">
          {getValue() ? new Date(getValue() as string).toLocaleDateString('fr-FR') : '—'}
        </span>
      ),
    }),
  ], []);

  return (
    <>
      {/* ── Modal principale ── */}
      <Modal isOpen={isOpen} toggle={toggle} centered size="xl" backdrop="static">
        <ModalHeader toggle={toggle} className="border-0 pb-0 align-items-start">
          {emp && (
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="avatar-sm flex-shrink-0">
                <span className="avatar-title rounded-circle bg-primary-subtle text-primary fw-medium fs-16">
                  {initiales}
                </span>
              </div>
              <div>
                <h5 className="mb-0">{emp.nom_complet}</h5>
                <small className="text-muted">
                  {emp.departement} · {emp.site_travail} · ID Odoo #{emp.odoo_id}
                </small>
              </div>
              <Badge
                color={emp.statut === StatutEmploye.ACTIF ? 'success' : 'danger'}
                className="ms-1"
              >
                {emp.statut}
              </Badge>
            </div>
          )}
        </ModalHeader>

        {g && (
          <ModalBody className="pt-2">
            <Row className="g-3">

              {/* ── Colonne gauche : KPIs, contact, calendrier ── */}
              <Col lg={4}>
                <Row className="g-2 mb-3">
                  <Col xs={6}>
                    <div className="p-3 bg-warning-subtle rounded-2 text-center">
                      <p className="text-uppercase fw-medium text-muted fs-11 mb-1">Jours</p>
                      <h4 className="text-warning mb-0">{nbJours} j</h4>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="p-3 bg-success-subtle rounded-2 text-center">
                      <p className="text-uppercase fw-medium text-muted fs-11 mb-1">Montant dû</p>
                      <h4 className="text-success mb-0">{fmt(montantDu)}</h4>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="p-3 bg-light rounded-2 text-center">
                      <p className="text-uppercase fw-medium text-muted fs-11 mb-1">Heures travaillées</p>
                      {/* <h5 className="mb-0">{Number.isFinite(totalHeures) ? `${totalHeures}h` : '—'}</h5> */}
                      <h5 className="mb-0">—</h5>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="p-3 bg-light rounded-2 text-center">
                      <p className="text-uppercase fw-medium text-muted fs-11 mb-1">En attente</p>
                      <h5 className="mb-0">{enAttenteIds.length}</h5>
                    </div>
                  </Col>
                </Row>

                {/* Bloc contact / paiement */}
                <div className="border rounded-2 p-3">
                  <h6 className="text-uppercase fw-semibold text-muted fs-11 mb-3">Contact & paiement</h6>
                  <ul className="list-unstyled mb-0 vstack gap-2">
                    <li className="d-flex align-items-center gap-2">
                      <i className="ri-phone-line text-muted" />
                      <span>{emp?.mobile_phone ?? '—'}</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <i className="ri-smartphone-line text-muted" />
                      <span>{emp?.operateur_mobile ?? '—'}</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <i className="ri-bank-card-line text-muted" />
                      {emp?.notchpay_beneficiary_id ? (
                        <Badge color="success" className="bg-success-subtle text-success">
                          Bénéficiaire NotchPay lié
                        </Badge>
                      ) : (
                        <Badge color="danger" className="bg-danger-subtle text-danger">
                          Non lié NotchPay
                        </Badge>
                      )}
                    </li>
                  </ul>
                </div>

                {/* Calendrier interactif */}
                <div className="mt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="text-uppercase fw-semibold text-muted fs-11 mb-0">Jours pointés</h6>
                    <small className="text-muted fst-italic">cliquez un jour</small>
                  </div>

                  <div className="upcoming-scheduled">
                    <Flatpickr
                      className="form-control"
                      options={{
                        dateFormat: 'd M, Y',
                        inline: true,
                        onDayCreate: (_d, _s, _fp, dayElem) => {
                          const iso = toISO(dayElem.dateObj);
                          const attendance = joursMarques.get(iso);

                          if (attendance) {
                            dayElem.classList.add(
                              attendance.statut_paiement === 'EN_COURS_TRAITEMENT_CREATION' ||attendance.statut_paiement === 'EN_COURS_TRAITEMENT_SUPPRESION'
                                ? 'jour-en-traitement'
                                : 'jour-cumule',
                            );
                          }

                          dayElem.style.cursor = 'pointer';
                          dayElem.addEventListener('click', (e: { preventDefault: () => void; stopPropagation: () => void }) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDayAction({ date: iso, attendanceId: attendance?.id ,statut: attendance?.statut_paiement as STATUT_CHOICES_ATTENDANCE});
                          });
                        },
                      }}
                    />
                  </div>

                  <div className="d-flex flex-column gap-1 mt-2">
                    <div className="d-flex align-items-center">
                      <span
                        className="rounded-circle me-2 flex-shrink-0"
                        style={{ width: 8, height: 8, background: '#c9a227', display: 'inline-block' }}
                      />
                      <small className="text-muted">Jour validé / historique normal</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <span
                        className="rounded-circle me-2 flex-shrink-0"
                        style={{ width: 8, height: 8, background: '#6f42c1', display: 'inline-block' }}
                      />
                      <small className="text-muted">En cours de traitement (signalement)</small>
                    </div>
                  </div>
                </div>
              </Col>

              {/* ── Colonne droite : détail des attendances ── */}
              <Col lg={8}>
                <h6 className="text-uppercase fw-semibold text-muted fs-11 mb-2">
                  Détail des pointages ({attendances.length})
                </h6>
                <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                  <TableContainer
                    columns={columns}
                    data={attendances}
                    isGlobalFilter
                    SearchPlaceholder="Rechercher une date, un statut…"
                    // ⚠️ liste déjà entièrement chargée (pas de pagination serveur ici) —
                    // adaptez selon la capacité de TableContainer à fonctionner en mode client-only
                    page={1}
                    total={attendances.length}
                    pageSize={Math.max(attendances.length, 1)}
                    onPageChange={() => { }}
                    onPageSizeChange={() => { }}
                  />
                </div>
              </Col>
            </Row>
          </ModalBody>
        )}

        <ModalFooter className="border-0 pt-0">
          <Button color="light" onClick={toggle}>Fermer</Button>
          <button
            onClick={() => { if (g && onViewPortefeuille) onViewPortefeuille(g); }}
            className="btn btn-soft-primary d-flex align-items-center gap-1"
          >
            <i className="ri-eye-line" />Voir le portefeuille
          </button>
          {onConfirmerRH && g && enAttenteIds.length > 0 && (
            <Button color="success" onClick={() => { onConfirmerRH(enAttenteIds); toggle(); }}>
              <i className="ri-check-line align-middle me-1" />
              Confirmer RH ({enAttenteIds.length})
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* ── Les 3 modales d'action, extraites car réutilisables/isolées ── */}
      <DayActionModal
        isOpen={!!dayAction && !confirmMode && !reportMode}
        dayAction={dayAction}
        nomEmploye={emp?.nom_complet}
        onClose={closeDayActionModal}
        onChoisirCreer={() => handleActionClick('create')}
        onChoisirSupprimer={() => handleActionClick('delete')}
      />

      <ConfirmActionModal
        mode={confirmMode}
        date={dayAction?.date}
        nomEmploye={emp?.nom_complet}
        busy={busy}
        onCancel={closeConfirmModal}
        onConfirm={handleConfirmed}
      />

      <SignalementModal
        mode={reportMode}
        date={dayAction?.date}
        nomEmploye={emp?.nom_complet}
        raison={raison}
        busy={busy}
        onRaisonChange={setRaison}
        onCancel={closeSignalementModal}
        onEnvoyer={handleEnvoyerSignalement}
      />
    </>
  );
};

export default ModalDetailEmploye;