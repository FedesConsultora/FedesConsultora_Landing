import React from 'react';
import './Consultora.scss';
import Consultora1 from './subsections/Consultora1';
import EngineeringGraphic from '../../../assets/img/backgrounds/consultora-graph.svg';
import ConsultoraDegr1 from '../../../assets/img/backgrounds/consultora-degr (1).svg';
import ConsultoraDegr2 from '../../../assets/img/backgrounds/consultora-degr (2).svg';
import ConsultoraGrid from '../../../assets/img/backgrounds/consultora-grilla (3).svg';
import { useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion';

const Consultora = () => {
    const graphRef = useRef(null);
    const [visible, setVisible] = useState(false);

    const dropVariants = {
        hidden: {
            opacity: 0,
            y: -24,
        },
        visible: (i = 0) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                delay: i * 0.18,
                ease: [0.25, 1, 0.5, 1], // smooth agency easing
            },
        }),
    };


    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setVisible(entry.isIntersecting);
            },
            {
                threshold: 0.3, // cuando se ve ~30%
            }
        );

        if (graphRef.current) {
            observer.observe(graphRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section id="consultora" className="consultora-section">
            <div className="consultora-background">
                <img src={ConsultoraDegr1} className="bg-degr degr-1" alt="" />
                <img src={ConsultoraDegr2} className="bg-degr degr-2" alt="" />
                <img src={ConsultoraGrid} className="bg-grid" alt="" />
            </div>

            {/* Parte 1: El problema de la facturación */}
            <div className="consultora-intro-block">
                <div className="container">
                    <div className="consultora-content">
                        <h2 className="consultora-title">
                            <motion.div
                                className="consultora-title-inner"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{
                                    duration: 2,
                                    ease: [0.30, 1, 0.36, 1],
                                }}
                            >
                                Facturar no es <br />lo mismo que
                            </motion.div>

                            <motion.div
                                className="consultora-title-inner highlight"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{
                                    duration: 1,
                                    delay: 1.2,
                                    ease: [0.30, 1, 0.36, 1],
                                }}
                            >
                                ganar dinero.
                            </motion.div>
                        </h2>


                        <p className="consultora-subtitle">
                            Si tu empresa crece pero tu tranquilidad baja, el problema no es la venta: es la estructura.
                            Te ayudamos a dejar de apagar incendios y empezar a dirigir.
                        </p>

                        <div className="consultora-cta">
                            <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ19JF6L1eipDhqCCUQr1FpObl3R5w1WcsYH4wRPfnbOfUsCc2vz07la72glqvWmDA_Svg19CKBU?gv=true" target="_blank" rel="noopener noreferrer" className="btn-diagnostic">
                                Agendar sesión de diagnóstico
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bloque 2: ¿Te suena familiar? + Pills */}
            <div className="consultora-familiar-block">
                <div className="container">
                    <motion.h2
                        className="familiar-title"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0 }}
                        variants={dropVariants}
                    >
                        ¿Te suena familiar?
                    </motion.h2>

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
                    <div className={`engineering-graphic ${visible ? "is-visible" : ""}`} ref={graphRef}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="746"
                            height="476"
                            viewBox="0 0 746 476"
                            fill="none"
                            className="chart"
                        >
                            <defs>
                                <radialGradient
                                    id="paint0_radial_364_797"
                                    cx="0"
                                    cy="0"
                                    r="1"
                                    gradientUnits="userSpaceOnUse"
                                    gradientTransform="translate(363.678 81.8939) rotate(89.7632) scale(417.245 355.177)"
                                >
                                    <stop stopColor="#3B82F6" />
                                    <stop offset="1" stopColor="#1B5EBF" stopOpacity="0" />
                                </radialGradient>

                                <radialGradient
                                    id="paint1_radial_364_797"
                                    cx="0"
                                    cy="0"
                                    r="1"
                                    gradientUnits="userSpaceOnUse"
                                    gradientTransform="translate(346.437 169.825) rotate(-20.7231) scale(423.906 114.677)"
                                >
                                    <stop stopColor="#1B5EBF" />
                                    <stop offset="0.725952" stopColor="#1B5EBF" />
                                    <stop offset="1" stopColor="#1B5EBF" stopOpacity="0" />
                                </radialGradient>
                            </defs>


                            <path
                                className="chart-fill"
                                d="
      M3 352.584
      L192.692 247.411
      L304.761 259.48
      L389.244 157.072
      L463.382 207.756
      L528.899 138.79
      L640.968 119.825
      L742.916 7.7561
      V472.998
      H3
      Z
    "
                                fill="url(#paint0_radial_364_797)"
                            />


                            <path
                                className="chart-line"
                                d="
      M3 352.584
      L192.692 247.411
      L304.761 259.48
      L389.244 157.072
      L463.382 207.756
      L528.899 138.79
      L640.968 119.825
      L742.916 7.7561
    "
                                stroke="url(#paint1_radial_364_797)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="none"
                            />

                            <circle
                                className="chart-dot"
                                cx="742.916"
                                cy="7.7561"
                                r="8"
                                fill="url(#paint1_radial_364_797)"
                            />


                            <path
                                className="chart-edge"
                                d="M742.916 7.7561 V472.998"
                                stroke="url(#paint1_radial_364_797)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>

                    </div>
                    <div className="engineering-content">
                        <h2 className="engineering-main-title">
                            <motion.span
                                className="blue"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={0.2}
                                variants={dropVariants}
                                style={{ display: 'block' }}
                            >
                                No improvisamos.
                            </motion.span>
                            <motion.span
                                className="dark"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={0.5}
                                variants={dropVariants}
                                style={{ display: 'block' }}
                            >
                                Hacemos ingeniería de negocios.
                            </motion.span>
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



