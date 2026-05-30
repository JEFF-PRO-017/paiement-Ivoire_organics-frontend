import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { HistoriquePaiement, Portefeuille, StatutPortefeuille } from '../../Utils/types';
import { NavItem } from 'pages/Utils/Utils.model';

import { fmt } from 'pages/Utils/Utils';
import { portefeuilleService } from '../Services/Service';
import { STATUT_CLR } from './constants';

export type ActionEmpreinte = 'confirmer_rh' | 'marquer_paye';

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date | string;
    end?: Date;
    allDay: boolean;
    className: string;
}

export interface UseDetailPortefeuilleReturn {
    pf: Portefeuille | null;
    isLoading: boolean;
    navQueue: NavItem[];
    navIndex: number;
    setNavIndex: (i: number) => void;
    calendarEvents: CalendarEvent[];
    modalEmpreinteOpen: boolean;
    actionEmpreinte: ActionEmpreinte | null;
    ouvrirEmpreinte: (action: ActionEmpreinte) => void;
    fermerEmpreinte: () => void;
    handleConfirmEmpreinte: () => Promise<void>;
    handleReset: () => Promise<void>;
    handleEventClick: (arg: { event: { id: string; title: string } }) => void;
}

export const useDetailPortefeuille = (): UseDetailPortefeuilleReturn => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // ── Queue lue UNE SEULE FOIS au montage depuis location.state ─────────
    // On ne relit pas location.state quand id change (navigation interne)
    // => la queue ne devient jamais périmée par rapport au tableau source
    const [navQueue] = useState<NavItem[]>(
        () => (location.state as any)?.queue ?? []
    );
    const [navIndex, setNavIndex] = useState<number>(
        () => (location.state as any)?.index ?? 0
    );

    // ── State ──────────────────────────────────────────────────────────────
    const [pf, setPf] = useState<Portefeuille | null>(null);
    const [historique, setHistorique] = useState<HistoriquePaiement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionEmpreinte, setActionEmpreinte] = useState<ActionEmpreinte | null>(null);
    const [modalEmpreinteOpen, setModalEmpreinteOpen] = useState(false);

    // ── Chargement — se redéclenche quand id change ────────────────────────
    useEffect(() => {
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
                const { portefeuille, historique: hist } =
                    await portefeuilleService.fetchDetail(pfId);
                if (!cancelled) { setPf(portefeuille); setHistorique(hist); }
            } catch {
                if (!cancelled) toast.error('Impossible de charger le portefeuille');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [id, navigate]);

    useEffect(() => {
        if (pf?.employe?.nom_complet) {
            document.title = `${pf.employe.nom_complet} | Portefeuille | Velzon`;
        }
    }, [pf?.employe?.nom_complet]);

    const calendarEvents = useMemo((): CalendarEvent[] => {
        if (!pf) return [];
        const joursEvents: CalendarEvent[] = (pf.periodes_paiement ?? []).map((iso) => ({
            id: `jour-${iso}`, title: 'Jour travaillé',
            start: new Date(iso), allDay: true,
            className: `bg-${STATUT_CLR[pf.statut]}-subtle text-${STATUT_CLR[pf.statut]} border-0`,
        }));

        const historiqueEvents: CalendarEvent[] = historique.map((h) => h?.periodes_paiement.map((iso) => ({
            id: `paiement-${h.id}`,
            title: `${h.statut} · ${h.nombre_jours} j · ${fmt(h.montant_total)}`,
             start: new Date(iso), allDay: true,
            className: `bg-${STATUT_CLR[h.statut]}-subtle text-${STATUT_CLR[h.statut]} border-0`,
        }))).flat() || [];

        console.log('Events calculés', { joursEvents, historique });
        return [...joursEvents, ...historiqueEvents];
    }, [pf, historique]);

    const ouvrirEmpreinte = (action: ActionEmpreinte) => {
        setActionEmpreinte(action); setModalEmpreinteOpen(true);
    };
    const fermerEmpreinte = () => {
        setModalEmpreinteOpen(false); setActionEmpreinte(null);
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
            setIsLoading(false); fermerEmpreinte();
        }
    };

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

    const handleEventClick = (arg: { event: { id: string; title: string } }) => {
        toast.info(arg.event.title);
    };

    return {
        pf, isLoading,
        navQueue, navIndex, setNavIndex,
        calendarEvents,
        modalEmpreinteOpen, actionEmpreinte,
        ouvrirEmpreinte, fermerEmpreinte, handleConfirmEmpreinte,
        handleReset, handleEventClick,
    };
};