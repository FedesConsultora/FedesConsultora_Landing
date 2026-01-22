import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import TeamChip from '../../ui/TeamChip';
import './Nosotros.scss';

// Import Team Photos
import MartinImg from '../../../assets/img/feders/Martin.webp';
import EnzoImg from '../../../assets/img/feders/pinotti-enzo_3.webp';
import BelenImg from '../../../assets/img/feders/bespilman.webp';
import RominaImg from '../../../assets/img/feders/ralbanesi.webp';
import JuanPImg from '../../../assets/img/feders/jperozo.webp';
import FlorImg from '../../../assets/img/feders/fmarchesotti.webp';
import MateoImg from '../../../assets/img/feders/mgermano.webp';
import MicaImg from '../../../assets/img/feders/mmartinez.webp';
import GonzaloImg from '../../../assets/img/feders/gcanibano.webp';

const Nosotros = () => {
    const containerRef = useRef(null);
    const [phase, setPhase] = useState(1);
    const isInView = useInView(containerRef, { amount: 0.3, once: true });

    // Transition from Phase 1 to Phase 2 after a delay
    useEffect(() => {
        if (isInView && phase === 1) {
            const timer = setTimeout(() => {
                setPhase(2);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [isInView, phase]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const x1Raw = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    const x2Raw = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

    const x1 = useSpring(x1Raw, { stiffness: 40, damping: 40, restDelta: 0.001 });
    const x2 = useSpring(x2Raw, { stiffness: 40, damping: 40, restDelta: 0.001 });

    const teamRow1 = [
        { name: "Martín Spinelli", role: "COO", photo: MartinImg },
        { name: "Enzo Pinotti", role: "Analista de Sistemas", photo: EnzoImg },
        { name: "Belén L. Espilman", role: "Desarrolladora Web", photo: BelenImg },
        { name: "Romina Albanesi", role: "Responsable Editorial", photo: RominaImg },
        { name: "Juan Perozo", role: "Diseñador UX/UI", photo: JuanPImg },
        { name: "Flor Marchesotti", role: "Coordinadora de proyectos", photo: FlorImg },
    ];

    const teamRow2 = [
        { name: "Mateo Germano", role: "Editor de Contenido Audiovisual", photo: MateoImg },
        { name: "Matías Lazcano", role: "Editor de Proyectos", photo: null },
        { name: "Micaela Martinez", role: "Asesora Comercial", photo: MicaImg },
        { name: "Victoria Pellegrino", role: "Analista de Cuentas", photo: null },
        { name: "Gonzalo Cañibano", role: "Ejecutivo de Cuentas", photo: GonzaloImg },
    ];

    return (
        <section id="nosotros" className="nosotros-section" ref={containerRef}>
            <div className="nosotros-content-wrapper">
                <AnimatePresence mode="wait">
                    {phase === 1 ? (
                        <motion.div
                            key="phase1"
                            className="phase-container phase-1"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -100 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        >
                            <h2 className="title-intro">
                                Entendimos que para escalar, <br />
                                <span className="blue-gradient">una empresa necesita cerebro y corazón</span>
                            </h2>
                            <p className="subtitle-intro">Eso somos.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="phase2"
                            className="phase-container phase-2"
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="nosotros-header">
                                <h2 className="title-main">Estrategas y <br /> Creativos.</h2>
                                <p className="subtitle-main">
                                    La historia de dos Fedes y un equipo <br />
                                    obsesionado con la excelencia.
                                </p>
                            </div>

                            <div className="team-parallax-container">
                                <div className="parallax-row">
                                    <motion.div className="row-content" style={{ x: x1 }}>
                                        {teamRow1.map((member, index) => (
                                            <TeamChip
                                                key={index}
                                                name={member.name}
                                                role={member.role}
                                                photo={member.photo}
                                            />
                                        ))}
                                    </motion.div>
                                </div>
                                <div className="parallax-row">
                                    <motion.div className="row-content" style={{ x: x2 }}>
                                        {teamRow2.map((member, index) => (
                                            <TeamChip
                                                key={index}
                                                name={member.name}
                                                role={member.role}
                                                photo={member.photo}
                                            />
                                        ))}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default Nosotros;
