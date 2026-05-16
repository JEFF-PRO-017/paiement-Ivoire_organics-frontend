/*
  ══════════════════════════════════════════════════════════════════
  Login.tsx — Ivoire Organics
  ══════════════════════════════════════════════════════════════════
  UI pure. Toute la logique est dans useAuth.
  Mock actif : admin@ivoireorganics.com / admin123
               demo@ivoireorganics.com  / demo123
  ══════════════════════════════════════════════════════════════════
*/

import React, { useState } from 'react';
import { Link }            from 'react-router-dom';
import {
  Alert, Button, Card, CardBody, Col, Container,
  Form, FormFeedback, Input, Label, Row, Spinner,
} from 'reactstrap';
import * as Yup        from 'yup';
import { useFormik }   from 'formik';
import ParticlesAuth   from '../AuthenticationInner/ParticlesAuth';
import { useAuth }     from './useAuth';

import logoLight from '../../assets/images/logo-light.png';

// ── Composant ─────────────────────────────────────────────────────────────────

const Login: React.FC = () => {
  document.title = 'Connexion | Ivoire Organics — Gestion des paiements';

  const { login, isLoading, error } = useAuth();
  const [passwordShow, setPasswordShow] = useState(false);

  const form = useFormik({
    initialValues: {
      email:    '',
      password: '',
    },
    validationSchema: Yup.object({
      email:    Yup.string().email('Email invalide').required('Email requis'),
      password: Yup.string().required('Mot de passe requis'),
    }),
    onSubmit: ({ email, password }) => login(email, password),
  });

  return (
    <React.Fragment>
      <ParticlesAuth>
        <div className="auth-page-content">
          <Container>

            {/* ── En-tête logo ── */}
            <Row>
              <Col lg={12}>
                <div className="text-center mt-sm-5 mb-4 text-white-50">
                  <Link to="/" className="d-inline-block auth-logo">
                    <img src={logoLight} alt="Ivoire Organics" height="28" />
                  </Link>
                  <p className="mt-3 fs-15 fw-medium">Gestion des paiements</p>
                </div>
              </Col>
            </Row>

            {/* ── Carte de login ── */}
            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <Card className="mt-4">
                  <CardBody className="p-4">

                    {/* Titre */}
                    <div className="text-center mt-2 mb-4">
                      <h5 className="text-primary fw-semibold">Bienvenue</h5>
                      <p className="text-muted fs-14">
                        Connectez-vous pour accéder à votre espace.
                      </p>
                    </div>

                    {/* Erreur serveur */}
                    {error && (
                      <Alert color="danger" className="d-flex align-items-center gap-2">
                        <i className="ri-error-warning-line fs-16" />
                        {error}
                      </Alert>
                    )}

                    {/* Indice mock (retirer en production) */}
                    <Alert color="info" className="fs-12 py-2">
                      <strong>Demo :</strong> admin@ivoireorganics.com / admin123
                    </Alert>

                    <div className="p-2">
                      <Form onSubmit={form.handleSubmit} noValidate>

                        {/* Email */}
                        <div className="mb-3">
                          <Label htmlFor="email" className="form-label">
                            Adresse e-mail
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="exemple@ivoireorganics.com"
                            autoComplete="username"
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            value={form.values.email}
                            invalid={!!(form.touched.email && form.errors.email)}
                          />
                          {form.touched.email && form.errors.email && (
                            <FormFeedback>{form.errors.email}</FormFeedback>
                          )}
                        </div>

                        {/* Mot de passe */}
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <Label htmlFor="password" className="form-label mb-0">
                              Mot de passe
                            </Label>
                            <Link to="/forgot-password" className="text-muted fs-12">
                              Mot de passe oublié ?
                            </Link>
                          </div>
                          <div className="position-relative auth-pass-inputgroup">
                            <Input
                              id="password"
                              name="password"
                              type={passwordShow ? 'text' : 'password'}
                              placeholder="••••••••"
                              autoComplete="current-password"
                              className="pe-5"
                              onChange={form.handleChange}
                              onBlur={form.handleBlur}
                              value={form.values.password}
                              invalid={!!(form.touched.password && form.errors.password)}
                            />
                            {form.touched.password && form.errors.password && (
                              <FormFeedback>{form.errors.password}</FormFeedback>
                            )}
                            <button
                              type="button"
                              className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                              onClick={() => setPasswordShow(v => !v)}
                              tabIndex={-1}
                            >
                              <i className={`ri-${passwordShow ? 'eye-off' : 'eye'}-fill align-middle`} />
                            </button>
                          </div>
                        </div>

                        {/* Se souvenir de moi */}
                        <div className="form-check mb-4">
                          <Input
                            className="form-check-input"
                            type="checkbox"
                            id="remember-check"
                          />
                          <Label className="form-check-label" htmlFor="remember-check">
                            Se souvenir de moi
                          </Label>
                        </div>

                        {/* Bouton soumettre */}
                        <Button
                          color="success"
                          type="submit"
                          className="w-100"
                          disabled={isLoading}
                        >
                          {isLoading
                            ? <><Spinner size="sm" className="me-2" />Connexion…</>
                            : 'Se connecter'
                          }
                        </Button>

                      </Form>
                    </div>
                  </CardBody>
                </Card>

                {/* Lien inscription */}
                <div className="mt-4 text-center">
                  <p className="mb-0 text-muted fs-13">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="fw-semibold text-primary text-decoration-underline">
                      Créer un compte
                    </Link>
                  </p>
                </div>

              </Col>
            </Row>
          </Container>
        </div>
      </ParticlesAuth>
    </React.Fragment>
  );
};

export default Login;