import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Row, Container } from 'reactstrap';

const NoSitePage = () => {
    const navigate = useNavigate();

    return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <Row className="justify-content-center w-100">
                <Col xs={12} sm={8} md={5} lg={4} className="text-center">

                    <div className="mb-4">
                        <i className="ri-error-warning-line" style={{ fontSize: '3rem', color: '#dc3545' }} />
                    </div>

                    <h4 className="fw-semibold mb-2">Aucun Site Actif</h4>

                    <p className="text-muted mb-4">
                        Aucun site actif. Veuillez Contacter l'administrateur.
                    </p>

                    <button
                        className="btn btn-dark px-4"
                        onClick={() => navigate('/login')}
                    >
                        Retour à la connexion
                    </button>

                </Col>
            </Row>
        </Container>
    );
};

export default NoSitePage;