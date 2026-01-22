import React from 'react';
import './Consultora.scss';
import Consultora1 from './subsections/Consultora1';
import EngineeringGraphic from '../../../assets/img/backgrounds/consultora-graph.svg';

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
                            <span style={{ fontWeight: '400' }}>Facturar no es <br />lo mismo que <br /></span> ganar dinero.
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
                        <img src={EngineeringGraphic} alt="Gráfico" />
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
