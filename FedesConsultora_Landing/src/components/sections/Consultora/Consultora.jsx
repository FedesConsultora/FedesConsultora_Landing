import React from 'react';
import './Consultora.scss';
import Consultora1 from './subsections/Consultora1';

const Consultora = () => {
    return (
        <section id="consultora" className="consultora-section">
            {/* Parte 1: El problema de la facturación */}
            <div className="consultora-intro-block">
                <div className="consultora-background">
                    <div className="gradient-brush purple-brush"></div>
                    <div className="grid-overlay"></div>
                </div>

                <div className="container">
                    <div className="consultora-content">
                        <h2 className="consultora-title">
                            Facturar no es <br />lo mismo que <br />ganar dinero.
                        </h2>

                        <p className="consultora-subtitle">
                            Si tu empresa crece pero tu tranquilidad baja, tenés un problema de estructura, no de ventas. Te ayudamos a dejar de apagar incendios y empezar a dirigir.
                        </p>

                        <div className="consultora-cta">
                            <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ19JF6L1eipDhqCCUQr1FpObl3R5w1WcsYH4wRPfnbOfUsCc2vz07la72glqvWmDA_Svg19CKBU?gv=true" target="_blank" rel="noopener noreferrer" className="btn-diagnostic">
                                Agenda tu sesión de diagnóstico
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bloque 2: ¿Te suena familiar? + Pills */}
            <div className="consultora-familiar-block">
                <div className="container">
                    <h2 className="familiar-title">¿Te suena familiar?</h2>

                    <div className="familiar-pills">
                        <div className="familiar-pill">Facturación alta, rentabilidad baja.</div>
                        <div className="familiar-pill">El negocio depende 100% de vos y no tenés vida.</div>
                        <div className="familiar-pill">Procesos comerciales informales o inexistentes.</div>
                    </div>
                </div>
            </div>

            {/* Bloque 3: No improvisamos / Ingeniería */}
            <div className="consultora-engineering-block">
                <div className="container">
                    <div className="engineering-graphic">
                        <svg viewBox="0 0 800 400" className="chart-svg">
                            <path
                                d="M 50,350 L 150,300 L 250,280 L 350,290 L 450,220 L 550,260 L 650,200 L 750,200 L 850,50"
                                fill="none"
                                stroke="url(#gradient-stroke)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <defs>
                                <linearGradient id="gradient-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3A54FF" stopOpacity="0.2" />
                                    <stop offset="50%" stopColor="#3A54FF" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="#3A54FF" stopOpacity="1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="engineering-content">
                        <h2 className="engineering-main-title">
                            <span className="blue">No improvisamos.</span><br />
                            <span className="dark">Hacemos ingeniería de negocios.</span>
                        </h2>
                    </div>
                </div>
            </div>

            {/* Bloque 4: Casos de éxito */}
            <Consultora1 />
        </section>
    );
};

export default Consultora;
