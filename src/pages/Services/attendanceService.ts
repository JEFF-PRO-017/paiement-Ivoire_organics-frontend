import { api } from "api/api";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Employe {
    odoo_id: string;
    nom_complet: string;
    departement: string;
    site_travail: string;
    statut: 'ACTIF' | 'INACTIF';
    mobile_phone: number
}

export interface Attendance {
    id: number;
    employee_id: string;
    employee_name: string | null;
    action: 'sign_in' | 'sign_out';
    name: string;
    worked_hours: number | null;
    odoo_attendance_id: string | null;
    date_validation_paiement: string | null;
    statut_paiement: 'EN_ATTENTE' | 'PAYE' | 'IMPAYE';
    statut_attendance: 'CREATION_AUTO' | 'CREATION_MANUELLE' | 'ARCHIVE';
}

export interface AttendanceParEmploye {
    employe: Employe;
    attendance_list: Attendance[];
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface UpdateStatutPayload {
    ids: number[];
    statut_paiement?: 'EN_ATTENTE' | 'PAYE' | 'IMPAYE';
    statut_attendance?: 'CREATION_AUTO' | 'CREATION_MANUELLE' | 'ARCHIVE';
}

export interface CreateAttendanceManuelPayload {
    employee_id: string;
    employee_name?: string;
    action: 'sign_in' | 'sign_out';
    name: string;
    worked_hours?: number;
    date_validation_paiement?: string;
    statut_paiement?: 'EN_ATTENTE' | 'PAYE' | 'IMPAYE';
}

// ── Service ──────────────────────────────────────────────────────────────────

export const attendanceService = {

    async fetchList(params?: {
        statut_paiement?: string;
        statut_attendance?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<AttendanceParEmploye>> {
        const query = new URLSearchParams();
        if (params?.statut_paiement) query.append('statut_paiement', params.statut_paiement);
        if (params?.statut_attendance) query.append('statut_attendance', params.statut_attendance);
        if (params?.page) query.append('page', String(params.page));
        if (params?.limit) query.append('limit', String(params.limit));
        return api.get(`/attendances/?${query.toString()}`);
    },

    async fetchEnAttente(params?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<AttendanceParEmploye>> {
        return attendanceService.fetchList({ statut_paiement: 'EN_ATTENTE', ...params });
    },

    async fetchPayees(params?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<AttendanceParEmploye>> {
        return attendanceService.fetchList({ statut_paiement: 'PAYE', ...params });
    },

    async fetchImpayees(params?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<AttendanceParEmploye>> {
        return attendanceService.fetchList({ statut_paiement: 'IMPAYE', ...params });
    },

    async fetchDetail(pk: number): Promise<Attendance> {
        return api.get(`/attendances/${pk}/`);
    },

    async updateStatut(payload: UpdateStatutPayload): Promise<{
        message: string;
        updated: number;
        ids: number[];
    }> {
        return api.patch(`/attendances/update-statut/`, payload);
    },

    async creerAttence(payload: CreateAttendanceManuelPayload): Promise<{
        message: string;
        id: number;
        employee_id: string;
        action: string;
        statut_attendance: string;
    }> {
        return api.post(`/attendances/creer-manuel/`, payload);
    },

};