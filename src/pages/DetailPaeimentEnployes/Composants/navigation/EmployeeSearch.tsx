import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import { NavItem } from 'pages/Utils/Utils.model';

interface Props {
    queue: NavItem[];
    onGo:  (index: number) => void;
}

const EmployeeSearch: React.FC<Props> = ({ queue, onGo }) => {
    const wrapRef  = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [open,    setOpen]    = useState(false);
    const [query,   setQuery]   = useState('');
    const [results, setResults] = useState<{ item: NavItem; index: number }[]>([]);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        const q = query.toLowerCase();
        setResults(
            queue
                .map((item, index) => ({ item, index }))
                .filter(({ item }) => item.nom.toLowerCase().includes(q))
                .slice(0, 8)
        );
    }, [query, queue]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false); setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggle = () => {
        setOpen(o => !o);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const select = (index: number) => {
        onGo(index);
        setOpen(false);
        setQuery('');
    };

    return (
        <div className="position-relative flex-shrink-0" ref={wrapRef}>
            <button
                className="btn btn-sm btn-ghost-secondary d-flex align-items-center gap-1"
                onClick={toggle}
                title="Rechercher un employé"
            >
                <i className="ri-search-line fs-14" />
            </button>

            {open && (
                <Card className="position-absolute shadow" style={{ right: 0, top: '110%', width: 260, zIndex: 1050 }}>
                    <CardBody className="p-2">
                        <div className="search-box">
                            <input
                                ref={inputRef}
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Nom de l'employé…"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                            <i className="ri-search-line search-icon" />
                        </div>

                        {results.length > 0 && (
                            <ul className="list-unstyled mb-0 mt-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
                                {results.map(({ item, index }) => {
                                    const initiales = item.nom
                                        .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
                                    return (
                                        <li key={item.id}>
                                            <button
                                                className="btn btn-ghost-secondary w-100 text-start d-flex align-items-center gap-2 py-1 px-2"
                                                onClick={() => select(index)}
                                            >
                                                <div className="avatar-xxs flex-shrink-0">
                                                    <span className="avatar-title rounded-circle bg-primary-subtle text-primary fs-10 fw-bold">
                                                        {initiales}
                                                    </span>
                                                </div>
                                                <span className="fs-13 text-truncate flex-grow-1">{item.nom}</span>
                                                <span className="text-muted fs-11 flex-shrink-0">#{item.id}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {query.trim() && results.length === 0 && (
                            <p className="text-muted text-center fs-12 mb-0 mt-2">Aucun résultat</p>
                        )}
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default EmployeeSearch;