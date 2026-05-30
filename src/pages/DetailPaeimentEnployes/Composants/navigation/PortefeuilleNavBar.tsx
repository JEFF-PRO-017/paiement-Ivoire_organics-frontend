import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from 'reactstrap';
import { NavItem } from 'pages/Utils/Utils.model';
import NeighborCarousel from './NeighborCarousel';
import EmployeeSearch   from './EmployeeSearch';

interface Props {
    queue:        NavItem[];
    currentIndex: number;
    onIndexChange: (i: number) => void;
}

const PortefeuilleNavBar: React.FC<Props> = ({ queue, currentIndex, onIndexChange }) => {
    const navigate = useNavigate();

    if (!queue || queue.length === 0) return null;

    const go = (nextIndex: number) => {
        onIndexChange(nextIndex);                        // ← met à jour l'index local
        navigate(`/paiement/${queue[nextIndex].id}`);   // ← pas de state, queue reste en mémoire
    };

    return (
        <Card className="mb-3">
            <CardBody className="py-2 px-3">
                <div className="d-flex align-items-center gap-2">

                    <button
                        className="btn btn-sm btn-ghost-secondary flex-shrink-0 d-flex align-items-center"
                        onClick={() => go(currentIndex - 1)}
                        disabled={currentIndex === 0}
                        title="Employé précédent"
                    >
                        <i className="ri-arrow-left-s-line fs-16" />
                    </button>

                    <NeighborCarousel
                        queue={queue}
                        currentIndex={currentIndex}
                        onGo={go}
                    />

                    <span className="text-muted fs-12 flex-shrink-0">
                        {currentIndex + 1} / {queue.length}
                    </span>

                    <EmployeeSearch queue={queue} onGo={go} />

                    <button
                        className="btn btn-sm btn-ghost-secondary flex-shrink-0 d-flex align-items-center"
                        onClick={() => go(currentIndex + 1)}
                        disabled={currentIndex === queue.length - 1}
                        title="Employé suivant"
                    >
                        <i className="ri-arrow-right-s-line fs-16" />
                    </button>

                </div>
            </CardBody>
        </Card>
    );
};

export default PortefeuilleNavBar;