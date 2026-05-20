/*
  ══════════════════════════════════════════════════════════════════
  useDetailPortefeuille.ts
  ══════════════════════════════════════════════════════════════════
  Hook custom qui centralise :
    • le chargement du portefeuille + historique
    • la construction des événements FullCalendar
    • les handlers empreinte (ouvrir / fermer / confirmer)
    • le handler reset (suppression)

  Le composant DetailPortefeuille ne fait plus que du JSX.
  ══════════════════════════════════════════════════════════════════
*/

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { HistoriquePaiement, Portefeuille, StatutPortefeuille } from '../types';
import { STATUT_CLR }                       from './constants';
import { portefeuilleService }              from './portefeuilleService';

// ── Types exposés ─────────────────────────────────────────────────────────────

export type ActionEmpreinte = 'confirmer_rh' | 'marquer_paye';

export interface CalendarEvent {
  id:        string;
  title:     string;
  start:     Date | string;
  end?:      Date;
  allDay:    boolean;
  className: string;
}


export interface UseDetailPortefeuilleReturn {
  // Data
  pf:         Portefeuille | null;
  isLoading:  boolean;

  // Calendrier
  calendarEvents: CalendarEvent[];

  // Modal empreinte
  modalEmpreinteOpen: boolean;
  actionEmpreinte:    ActionEmpreinte | null;
  ouvrirEmpreinte:    (action: ActionEmpreinte) => void;
  fermerEmpreinte:    () => void;
  handleConfirmEmpreinte: () => Promise<void>;

  // Actions
  handleReset:        () => Promise<void>;
  handleEventClick:   (arg: { event: { id: string; title: string } }) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useDetailPortefeuille = (): UseDetailPortefeuilleReturn => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────

  const [pf,        setPf]        = useState<Portefeuille | null>(null);
  const [historique, setHistorique] = useState<HistoriquePaiement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [actionEmpreinte,    setActionEmpreinte]    = useState<ActionEmpreinte | null>(null);
  const [modalEmpreinteOpen, setModalEmpreinteOpen] = useState(false);

  // ── Chargement initial ─────────────────────────────────────────────────────

  useEffect(() => {
    debugger
    const pfId = Number(id);
    
    if (isNaN(pfId)) {
      toast.error('Identifiant de portefeuille invalide');
      navigate('/paiements');
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const { portefeuille, historique: hist } = await portefeuilleService.fetchDetail(pfId);
        if (!cancelled) {
          setPf(portefeuille);
          setHistorique(hist);
        }
      } catch {
        if (!cancelled) toast.error('Impossible de charger le portefeuille');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id, navigate]);

  // ── Titre de page ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (pf?.employe?.nom_complet) {
      document.title = `${pf.employe.nom_complet} | Portefeuille | Velzon`;
    }
  }, [pf?.employe?.nom_complet]);

  // ── Événements FullCalendar ────────────────────────────────────────────────

  const calendarEvents = useMemo((): CalendarEvent[] => {
    if (!pf) return [];

    const joursEvents: CalendarEvent[] = (pf.periodes_paiement ?? []).map((iso) => ({
      id:        `jour-${iso}`,
      title:     'Jour travaillé',
      start:     new Date(iso),
      allDay:    true,
      className: 'bg-warning-subtle text-warning border-0',
    }));

    const historiqueEvents: CalendarEvent[] = historique.map((h) => ({
      id:        `paiement-${h.id}`,
      title:     `${h.statut} · ${h.jours} j · ${h.montant.toLocaleString('fr-FR')} F`,
      start:     h.date_debut,
      end:       h.date_fin,
      allDay:    true,
      className: `bg-${STATUT_CLR[h.statut]}-subtle text-${STATUT_CLR[h.statut]} border-0`,
    }));

    return [...joursEvents, ...historiqueEvents];
  }, [pf, historique]);

  // ── Handlers empreinte ─────────────────────────────────────────────────────

  const ouvrirEmpreinte = (action: ActionEmpreinte) => {
    setActionEmpreinte(action);
    setModalEmpreinteOpen(true);
  };

  const fermerEmpreinte = () => {
    setModalEmpreinteOpen(false);
    setActionEmpreinte(null);
  };

  const handleConfirmEmpreinte = async () => {
    if (!pf || !actionEmpreinte) return;
    setIsLoading(true);
    try {
      if (actionEmpreinte === 'confirmer_rh') {
        await portefeuilleService.confirmerRH(pf.id);
        setPf(p => p ? { ...p, statut: StatutPortefeuille.CONFIRME_RH } : p);
        toast.success('Portefeuille confirmé RH');

      } else {
        await portefeuilleService.marquerPaye(pf.id);
        setPf(p => p ? { ...p, statut: StatutPortefeuille.PAYE } : p);
        toast.success('Portefeuille marqué comme payé');
      }
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      fermerEmpreinte();
    }
  };

  // ── Handler reset ──────────────────────────────────────────────────────────

  const handleReset = async () => {
    if (!pf) return;
    if (!window.confirm('Réinitialiser ce portefeuille ? Cette action est irréversible.')) return;

    setIsLoading(true);
    try {
      await portefeuilleService.supprimer(pf.id);
      toast.warning('Portefeuille réinitialisé');
      navigate('/paiements/historique');
    } catch {
      toast.error('Impossible de réinitialiser le portefeuille.');
      setIsLoading(false);
    }
  };

  // ── Handler clic calendrier ────────────────────────────────────────────────

  const handleEventClick = (arg: { event: { id: string; title: string } }) => {
    const { id: eventId, title } = arg.event;
    /*
      TODO: naviguer vers le détail du paiement archivé :
        if (eventId.startsWith('paiement-')) {
          navigate(`/paiements/${eventId.replace('paiement-', '')}`);
          return;
        }
    */
    toast.info(title);
  };

  // ── Retour ─────────────────────────────────────────────────────────────────

  return {
    pf,
    isLoading,
    calendarEvents,
    modalEmpreinteOpen,
    actionEmpreinte,
    ouvrirEmpreinte,
    fermerEmpreinte,
    handleConfirmEmpreinte,
    handleReset,
    handleEventClick,
  };
};