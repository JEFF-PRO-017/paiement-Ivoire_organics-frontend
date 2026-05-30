import React, { useEffect, useRef } from 'react';
import { NavItem } from 'pages/Utils/Utils.model';

interface Props {
    queue:        NavItem[];
    currentIndex: number;
    onGo:         (index: number) => void;
}

const WINDOW = 3;

const NeighborCarousel: React.FC<Props> = ({ queue, currentIndex, onGo }) => {
    const activeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        activeRef.current?.scrollIntoView({
            behavior: 'smooth', block: 'nearest', inline: 'center',
        });
    }, [currentIndex]);

    const start = Math.max(0, currentIndex - WINDOW);
    const end   = Math.min(queue.length - 1, currentIndex + WINDOW);

    return (
        <div className="d-flex align-items-center gap-1 overflow-hidden" style={{ flex: 1, minWidth: 0 }}>
            {queue.slice(start, end + 1).map((item, i) => {
                const absoluteIndex = start + i;
                const isCurrent     = absoluteIndex === currentIndex;
                const initiales     = item.nom
                    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

                return (
                    <button
                        key={item.id}
                        ref={isCurrent ? activeRef : undefined}
                        onClick={() => onGo(absoluteIndex)}
                        className={`btn btn-sm d-flex align-items-center gap-1 flex-shrink-0 ${
                            isCurrent ? 'btn-soft-primary' : 'btn-ghost-secondary'
                        }`}
                        style={{ fontSize: 12, padding: '3px 8px', whiteSpace: 'nowrap' }}
                        title={item.nom}
                    >
                        <div className="avatar-xxs flex-shrink-0">
                            <span className={`avatar-title rounded-circle fs-10 fw-bold ${
                                isCurrent ? 'bg-primary text-white' : 'bg-primary-subtle text-primary'
                            }`}>
                                {initiales}
                            </span>
                        </div>
                        <span className="d-none d-sm-inline fs-12">
                            {item.nom.split(' ')[0]}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default NeighborCarousel;