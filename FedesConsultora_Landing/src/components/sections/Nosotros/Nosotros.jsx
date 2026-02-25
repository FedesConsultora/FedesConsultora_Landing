import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import TeamChip from '../../ui/TeamChip';
import './Nosotros.scss';

// Import background assets
import DegrNosotros1 from '../../../assets/img/backgrounds/nosotros-degr (1).svg';
import DegrNosotros2 from '../../../assets/img/backgrounds/nosotros-degr (2).svg';

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

// Import Boss Photos
import ChironiImg from '../../../assets/img/feders/jefes/Fede Chironi.webp';
import FedeJuanImg from '../../../assets/img/feders/jefes/Fede Juan.webp';

const BOSSES = [
    {
        id: 'chironi',
        name: 'FEDERICO CHIRONI',
        role: 'CoFounder y CEO',
        photo: ChironiImg,
        align: 'left',
        linkedin: 'https://www.linkedin.com/in/federicochironi/',
        details: [
            'Consultor en Marketing Estratégico y Análisis de Mercado.',
            'Master en Marketing en The University of Texas at Arlington',
            'Miembro del Jurado Experto de la Asociación Argentina de Marketing.',
            'Empresario UNAJE.'
        ]
    },
    {
        id: 'juan',
        name: 'FEDE JUAN',
        role: 'CoFounder y CGO',
        photo: FedeJuanImg,
        align: 'right',
        linkedin: 'https://www.linkedin.com/in/fede-juan/',
        details: [
            'Licenciado en Administración de Empresas de la Universidad de San Andrés',
            'Máster en Diseño y Marketing en UNLP',
            'Fundador de ReydelosNegocios (400k seguidores)',
            'Creador de más de 50 marcas digitales',
            'Más de 8 años en el mundo del Marketing Digital'
        ]
    }
];

const Nosotros = () => {
    const containerRef = useRef(null);
    const carouselRef1 = useRef(null);
    const carouselRef2 = useRef(null);
    const [activeBoss, setActiveBoss] = useState(null);

    // Scroll progress de la sección completa (250vh)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Fase 1: Intro
    const phase1Opacity = useTransform(scrollYProgress, [0, 0.35, 0.48], [1, 1, 0]);
    const phase1Y = useTransform(scrollYProgress, [0.35, 0.55], [0, -120]);
    const phase1Scale = useTransform(scrollYProgress, [0.35, 0.55], [1, 0.92]);
    const phase1ZIndex = useTransform(scrollYProgress, (val) => val > 0.45 ? 1 : 10);

    // Fase 2: Equipo
    const phase2Opacity = useTransform(scrollYProgress, [0.42, 0.58, 1], [0, 1, 1]);
    const phase2Y = useTransform(scrollYProgress, [0.42, 0.62], [150, 0]);
    const phase2Scale = useTransform(scrollYProgress, [0.42, 0.62], [0.95, 1]);
    const phase2ZIndex = useTransform(scrollYProgress, (val) => val > 0.45 ? 10 : 1);

    // Paralaje lateral - Empezamos en -33.33% para mostrar el juego central de la triplicación
    // Esto asegura que Enzo (arriba) y Belén (abajo) se vean primero al estar en el centro del array
    const x1Raw = useTransform(scrollYProgress, [0.42, 1], ["-33.33%", "-20%"]);
    const x2Raw = useTransform(scrollYProgress, [0.42, 1], ["-33.33%", "-46%"]);

    const x1 = useSpring(x1Raw, { stiffness: 20, damping: 25, mass: 1 });
    const x2 = useSpring(x2Raw, { stiffness: 20, damping: 25, mass: 1 });

    // Fila 1: Líderes (Victoria incluida)
    // Reordered to put Enzo in the middle (index 2 of 6)
    const leadersRow = [
        { name: "Martín Spinelli", role: "COO", photo: MartinImg, linkedin: "https://www.linkedin.com/in/mart%C3%ADn-spinelli-310606203/" },
        { name: "Romina Albanesi", role: "Responsable Editorial", photo: RominaImg, linkedin: "https://www.linkedin.com/in/rominaalbanesi/" },
        { name: "Enzo Pinotti", role: "Analista de Sistemas", photo: EnzoImg, linkedin: "https://www.linkedin.com/in/enzo-daniel-pinotti-667270179/" },
        { name: "Victoria Pellegrino", role: "Analista de Cuentas", photo: null, linkedin: "https://www.linkedin.com/in/victoria-pellegrino-23b966208/" },
        { name: "Florencia Marchesotti", role: "Coordinadora de Proyectos", photo: FlorImg, linkedin: "https://www.linkedin.com/in/florencia-marchesotti-7570a3212/" },
        { name: "Gonzalo Cañibano", role: "Ejecutivo de Cuentas", photo: GonzaloImg, linkedin: "https://www.linkedin.com/in/gonzalo-canibano-a703872a/" },
    ];

    // Fila 2: El resto del equipo
    // Reordered to put Belen in the middle (index 2 of 5)
    const theRestRow = [
        { name: "Mateo Germano", role: "Editor de Contenido Audiovisual", photo: MateoImg, linkedin: "https://www.linkedin.com/in/mateo-germano-898b872b1/" },
        { name: "Matías Lazcano", role: "Editor de Proyectos", photo: null, linkedin: "https://www.linkedin.com/in/mat%C3%ADas-lazcano-b86342240/" },
        { name: "Belén L. Espilman", role: "Desarrolladora Web", photo: BelenImg, linkedin: "https://www.linkedin.com/in/belenespilman/" },
        { name: "Micaela Martínez", role: "Asesora Comercial", photo: MicaImg, linkedin: "https://www.linkedin.com/in/micaela-martinez-82609339b/" },
        { name: "Juan Perozo", role: "Diseñador UX/UI", photo: JuanPImg, linkedin: "https://www.linkedin.com/in/jperozo97/" },
    ];

    return (
        <section id="nosotros" className="nosotros-section" ref={containerRef}>
            <div className="nosotros-sticky-wrapper">

                {/* Fondo de gradientes dinámico */}
                <div className="nosotros-background">
                    <img src={DegrNosotros1} className="bg-degr degr-1" alt="" />
                    <img src={DegrNosotros2} className="bg-degr degr-2" alt="" />
                </div>

                <div className="nosotros-content-viewport">

                    {/* FASE 1: INTRODUCCIÓN */}
                    <motion.div
                        className="nosotros-phase-box phase-1"
                        style={{
                            opacity: phase1Opacity,
                            y: phase1Y,
                            scale: phase1Scale,
                            zIndex: phase1ZIndex
                        }}
                    >
                        <h2 className="nosotros-title-render">
                            <span className="bold-metallic">Entendimos que,</span>
                            <span className="bold-metallic">para escalar, una empresa</span>
                            <span className="text-primary-bold">necesita cerebro y corazón.</span>
                        </h2>
                        <p className="subtitle-intro-text">Desde ahí trabajamos.</p>

                        <motion.div
                            className="scroll-hint-arrow"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                                <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="#1a56db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.div>
                    </motion.div>

                    {/* FASE 2: EQUIPO */}
                    <motion.div
                        className="nosotros-phase-box phase-2"
                        style={{
                            opacity: phase2Opacity,
                            y: phase2Y,
                            scale: phase2Scale,
                            zIndex: phase2ZIndex
                        }}
                    >
                        <div className="team-header-box">
                            <div className="team-title-wrap">
                                <h2 className="nosotros-title-render team-title">
                                    <span className="bold-metallic">Estrategas y creativos.</span>
                                </h2>
                                <p className="team-subtitle-text">
                                    Dos Fedes y un equipo multidisciplinario obsesionado con la excelencia.
                                </p>
                            </div>

                            <div className="bosses-container">
                                {BOSSES.map((boss) => (
                                    <motion.div
                                        key={boss.id}
                                        className="boss-card"
                                        style={{ '--boss-image': `url(${boss.photo})` }}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setActiveBoss(boss)}
                                    >
                                        <img src={boss.photo} alt={boss.name} />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="team-chips-display">
                            <div className="chips-row">
                                <motion.div style={{ x: x1 }}>
                                    <motion.div
                                        className="row-inner"
                                        drag="x"
                                        dragConstraints={{ left: -1200, right: 1200 }}
                                        dragElastic={0}
                                        dragMomentum={true}
                                        dragTransition={{ power: 0.1, timeConstant: 200 }}
                                    >
                                        {[...leadersRow, ...leadersRow, ...leadersRow].map((member, index) => (
                                            <TeamChip key={`leader-${index}`} {...member} />
                                        ))}
                                    </motion.div>
                                </motion.div>
                            </div>
                            <div className="chips-row">
                                <motion.div style={{ x: x2 }}>
                                    <motion.div
                                        className="row-inner"
                                        drag="x"
                                        dragConstraints={{ left: -1200, right: 1200 }}
                                        dragElastic={0}
                                        dragMomentum={true}
                                        dragTransition={{ power: 0.1, timeConstant: 200 }}
                                    >
                                        {[...theRestRow, ...theRestRow, ...theRestRow].map((member, index) => (
                                            <TeamChip key={`rest-${index}`} {...member} />
                                        ))}
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Modal de Detalle de Jefe */}
            <AnimatePresence>
                {activeBoss && (
                    <motion.div
                        className="boss-detail-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="overlay-backdrop" onClick={() => setActiveBoss(null)} />

                        <motion.div
                            className={`detail-body align-${activeBoss.align}`}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                        >
                            <div className="image-wrap">
                                <img src={activeBoss.photo} alt={activeBoss.name} />
                            </div>
                            <div className="info-wrap">
                                <span className="boss-tag">{activeBoss.role}</span>
                                <h3 className="boss-name">{activeBoss.name}</h3>
                                <ul className="boss-list">
                                    {activeBoss.details.map((detail, idx) => (
                                        <li key={idx}>{detail}</li>
                                    ))}
                                </ul>
                                <a
                                    href={activeBoss.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-linkedin-boss"
                                >
                                    <span>VER LINKEDIN</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </a>
                            </div>
                        </motion.div>

                        <button className="close-btn" onClick={() => setActiveBoss(null)}>
                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Nosotros;
