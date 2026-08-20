import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { EmployeAttendanceGroup, AttendanceItem } from '../../Utils/types';
import { NavItem } from 'pages/Utils/Utils.model';
import { fmt } from 'pages/Utils/Utils';
import { STATUT_COLOR, STATUT_LABEL } from './constants';
import { attendanceService } from 'pages/TableauBord/Services/AttendanceService';
import { paiementService } from 'pages/TableauBord/Services/Service';


export type ConfirmationAction = 'confirmer_rh' | 'marquer_paye' | null;

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  allDay: boolean;
  className: string;
}

export interface UseDetailEmployeReturn {
  group: EmployeAttendanceGroup | null;
  isLoading: boolean;
  navQueue: NavItem[];
  navIndex: number;
  setNavIndex: (i: number) => void;
  calendarEvents: CalendarEvent[];

  enAttenteIds: number[];
  impayeIds: number[];
  montantEnAttente: number;
  montantImpaye: number;

  confirmationAction: ConfirmationAction;
  ouvrirConfirmation: (action: ConfirmationAction) => void;
  fermerConfirmation: () => void;
  handleConfirmer: () => Promise<void>;

  handleEventClick: (arg: { event: { id: string; title: string } }) => void;
}

export const useDetailEmploye = (): UseDetailEmployeReturn => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Queue lue UNE SEULE FOIS au montage depuis location.state ─────────
  const [navQueue] = useState<NavItem[]>(() => (location.state as any)?.queue ?? []);
  const [navIndex, setNavIndex] = useState<number>(() => (location.state as any)?.index ?? 0);

  // ── State ──────────────────────────────────────────────────────────────
  const [group, setGroup] = useState<EmployeAttendanceGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction>(null);

  // ── Chargement — se redéclenche quand id change ────────────────────────
  const fetchGroup = useCallback(async (employeId: number) => {
    // ⚠️ endpoint à confirmer côté back : doit retourner un EmployeAttendanceGroup pour un employé donné
    return paiementService.getEmployeAttendanceGroup(employeId);
  }, []);

  useEffect(() => {
    const employeId = Number(id);
    if (isNaN(employeId)) {
      toast.error('Identifiant employé invalide');
      navigate('/paiements');
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchGroup(employeId);
        if (!cancelled) setGroup(data); console.log('group datat',data);
      } catch {
        if (!cancelled) toast.error('Impossible de charger le portefeuille');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id, navigate, fetchGroup]);

  useEffect(() => {
    if (group?.employe?.nom_complet) {
      document.title = `${group.employe.nom_complet} | Portefeuille`;
    }
  }, [group?.employe?.nom_complet]);

  // ── Dérivés : plus de statut unique, on regroupe par statut_paiement ────
  const attendances = group?.attendance_list ?? [];

  const enAttente = useMemo(
    () => attendances.filter(a => a.statut_paiement === 'EN_ATTENTE'),
    [attendances],
  );
  const impaye = useMemo(
    () => attendances.filter(a => a.statut_paiement === 'IMPAYE'),
    [attendances],
  );

  const enAttenteIds = useMemo(() => enAttente.map(a => a.id), [enAttente]);
  const impayeIds = useMemo(() => impaye.map(a => a.id), [impaye]);

  const montantEnAttente = useMemo(
    () => enAttente.reduce((acc, a) => acc + parseFloat(a.montant_journalier), 0),
    [enAttente],
  );
  const montantImpaye = useMemo(
    () => impaye.reduce((acc, a) => acc + parseFloat(a.montant_journalier), 0),
    [impaye],
  );

  // ── Calendrier : un événement par attendance, coloré selon son statut ───
const calendarEvents = useMemo((): CalendarEvent[] => {
  return attendances.map((a: AttendanceItem) => ({
    id: `attendance-${a.id}`,
    title: `${fmt(parseFloat(a.montant_journalier))}`,
    start: new Date(a.date),
    allDay: true,
    className: `bg-${STATUT_COLOR[a.statut_paiement] ?? 'secondary'}-subtle text-${STATUT_COLOR[a.statut_paiement] ?? 'secondary'} border-0`,
    extendedProps: {
      statut_paiement: a.statut_paiement,
      statut_label: STATUT_LABEL[a.statut_paiement] ?? a.statut_paiement,
      montant_journalier: a.montant_journalier,
    },
  }));
}, [attendances]);

  // ── Actions groupées ─────────────────────────────────────────────────────
  const ouvrirConfirmation = (action: ConfirmationAction) => {
    if (action === 'confirmer_rh' && enAttenteIds.length === 0) return;
    if (action === 'marquer_paye' && impayeIds.length === 0) return;
    setConfirmationAction(action);
  };

  const fermerConfirmation = () => setConfirmationAction(null);

  const handleConfirmer = async () => {
    if (!group || !confirmationAction) return;
    const employeId = group.employe.id;
    setIsLoading(true);
    try {
      if (confirmationAction === 'confirmer_rh') {
        await paiementService.confirmerRH(enAttenteIds);
      } else {
        // ⚠️ à créer côté service si absent : PATCH bulk statut_paiement -> 'PAYE'
        await attendanceService.payementManuel(enAttenteIds);
      }
      const refreshed = await fetchGroup(employeId);
      setGroup(refreshed);
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      fermerConfirmation();
    }
  };

  const handleEventClick = (arg: { event: { id: string; title: string } }) => {
    toast.info(arg.event.title);
  };

  return {
    group, isLoading,
    navQueue, navIndex, setNavIndex,
    calendarEvents,
    enAttenteIds, impayeIds, montantEnAttente, montantImpaye,
    confirmationAction, ouvrirConfirmation, fermerConfirmation, handleConfirmer,
    handleEventClick,
  };
};