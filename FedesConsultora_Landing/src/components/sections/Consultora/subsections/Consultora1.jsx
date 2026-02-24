import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Consultora1.scss';

// Import video assets
import case1mp4 from '../../../../assets/video/cases/case1.mp4';
import case1webm from '../../../../assets/video/cases/case1.webm';
import case1poster from '../../../../assets/video/cases/case1.webp';
import case2mp4 from '../../../../assets/video/cases/case2.mp4';
import case2webm from '../../../../assets/video/cases/case2.webm';
import case2poster from '../../../../assets/video/cases/case2.webp';
import case3mp4 from '../../../../assets/video/cases/case3.mp4';
import case3webm from '../../../../assets/video/cases/case3.webm';
import case3poster from '../../../../assets/video/cases/case3.webp';

const successCases = [
    {
        id: 1,
        tag: "Ganadores del Premio Mercurio 2024",
        stat: "+40%",
        result: "de rentabilidad neta en 6 meses mediante optimización estructural.",
        videoSources: {
            mp4: case1mp4,
            webm: case1webm
        },
        poster: case1poster
    },
    {
        id: 2,
        tag: "Escalamiento Estratégico",
        stat: "2.5x",
        result: "aumento en la capacidad operativa sin incrementar costos fijos.",
        videoSources: {
            mp4: case2mp4,
            webm: case2webm
        },
        poster: case2poster
    },
    {
        id: 3,
        tag: "Estructura de Negocios",
        stat: "+65%",
        result: "de eficiencia en procesos comerciales y flujo de caja.",
        videoSources: {
            mp4: case3mp4,
            webm: case3webm
        },
        poster: case3poster
    }
];

const Consultora1 = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const dropVariants = {
        hidden: {
            opacity: 0,
            y: -24,
        },
        visible: (i = 0) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1.8,
                delay: i * 0.1,
                ease: [0.26, 1, 0.36, 1],
            },
        }),
    };

    const handleNext = () => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % successCases.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + successCases.length) % successCases.length);
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    const currentCase = successCases[activeIndex];

    return (
        <section className="consultora-cases-block">
            <div className="container">
                <motion.h2
                    className="cases-title"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={dropVariants}
                >
                    Casos de éxito
                </motion.h2>

                <div className="cases-slider-container">
                    {successCases.length > 1 && (
                        <button className="slider-nav prev" onClick={handlePrev} aria-label="Anterior">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                    )}

                    <div className="case-content-wrapper">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={activeIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className="case-card-grid"
                            >
                                <div className="case-video-container">
                                    <div className="video-inner">
                                        <video
                                            key={currentCase.id}
                                            controls
                                            poster={currentCase.poster}
                                            className="main-video"
                                            playsInline
                                        >
                                            <source src={currentCase.videoSources.webm} type="video/webm" />
                                            <source src={currentCase.videoSources.mp4} type="video/mp4" />
                                            Tu navegador no soporta videos.
                                        </video>
                                    </div>
                                </div>

                                <div className="case-info">
                                    <span className="case-tag">{currentCase.tag}</span>
                                    <div className="case-stat">{currentCase.stat}</div>
                                    <p className="case-result">{currentCase.result}</p>

                                    <div className="case-action">
                                        <a href="/galeria" className="btn-success-gallery">
                                            Ver más casos en la galería
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {successCases.length > 1 && (
                        <button className="slider-nav next" onClick={handleNext} aria-label="Siguiente">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Consultora1;
