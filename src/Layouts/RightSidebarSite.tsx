import React, { useEffect, useState } from 'react';
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from 'reactstrap';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useAuth } from 'pages/Authentication/useAuth';

const selectPreloader = createSelector(
    (state: any) => state.Layout,
    (layout) => ({ preloader: layout.preloader })
);

const RightSidebarSite: React.FC = () => {
    const { preloader } = useSelector(selectPreloader);
    const { user, siteActif, setSiteActif } = useAuth();
    const [open, setOpen] = useState(false);

    // Scroll-to-top
    useEffect(() => {
        const onScroll = () => {
            const el = document.getElementById('back-to-top');
            if (el) el.style.display =
                document.body.scrollTop > 100 || document.documentElement.scrollTop > 100
                    ? 'block' : 'none';
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Preloader
    useEffect(() => {
        const el = document.getElementById('preloader');
        if (!el) return;
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        const t = setTimeout(() => {
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
        }, 1000);
        return () => clearTimeout(t);
    }, [preloader]);

    const toTop = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    return (
        <React.Fragment>
            <button onClick={toTop} className="btn btn-danger btn-icon" id="back-to-top" style={{ display: 'none' }}>
                <i className="ri-arrow-up-line" />
            </button>

            {preloader === 'enable' && (
                <div id="preloader">
                    <div id="status">
                        <div className="spinner-border text-primary avatar-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Bouton flottant */}
            <div className="customizer-setting d-none d-md-block">
                <div onClick={() => setOpen(true)} className="btn-primary rounded-pill shadow-lg btn btn-icon btn-lg p-2">
                    <i className='mdi mdi-spin mdi-cog-outline fs-22'></i>
                </div>
            </div>

            {/* Offcanvas */}
            <Offcanvas isOpen={open} toggle={() => setOpen(false)} direction="end" className="offcanvas-end border-0" style={{ width: 300 }}>
                <OffcanvasHeader toggle={() => setOpen(false)} className="bg-primary bg-gradient p-3 offcanvas-header-dark">
                    <span className="text-white fw-semibold">Changer de site</span>
                </OffcanvasHeader>

                <OffcanvasBody className="p-3">

                    {/* Utilisateur connecté */}
                    {user && (
                        <div className="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded">
                            <div className="avatar-xs">
                                <span className="avatar-title rounded-circle bg-primary-subtle text-primary fw-bold fs-13">
                                    {user.first_name[0]}{user.last_name[0]}
                                </span>
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                                <p className="mb-0 fw-medium fs-13 text-truncate">{user.first_name} {user.last_name}</p>
                                <p className="mb-0 fs-11 text-muted text-truncate">{user.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Site actif */}
                    {siteActif && (
                        <div className="mb-3">
                            <p className="text-muted fs-11 text-uppercase fw-semibold mb-1">Site actif</p>
                            <div className="d-flex align-items-center gap-2 p-2 bg-primary-subtle rounded">
                                <i className="ri-map-pin-line text-primary" />
                                <span className="fw-semibold fs-13 text-primary">{siteActif}</span>
                            </div>
                        </div>
                    )}

                    {/* Liste des sites */}
                    <p className="text-muted fs-11 text-uppercase fw-semibold mb-2">Tous les sites</p>
                    <div className="d-flex flex-column gap-2">
                        {(user?.sites ?? []).map((site) => {
                            const isActive = site === siteActif;
                            return (
                                <button
                                    key={site}
                                    onClick={() => { setSiteActif(site); setOpen(false); }}
                                    disabled={isActive}
                                    className={`btn d-flex align-items-center gap-2 text-start p-2 rounded ${isActive ? 'btn-primary' : 'btn-soft-secondary'}`}
                                >
                                    <i className={`ri-map-pin-line ${isActive ? 'text-white' : 'text-muted'}`} />
                                    <span className={`fs-13 fw-medium flex-grow-1 ${isActive ? 'text-white' : ''}`}>{site}</span>
                                    {isActive && <i className="ri-check-line text-white" />}
                                </button>
                            );
                        })}
                    </div>

                </OffcanvasBody>
            </Offcanvas>
        </React.Fragment>
    );
};

export default RightSidebarSite;