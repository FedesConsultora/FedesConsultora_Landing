import React, { useState, useRef, useEffect } from 'react';
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

const CaseVideo = ({ currentCase }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        // Reset state when case changes
        setIsPlaying(true);
    }, [currentCase.id]);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="case-video-container">
            <div className="video-inner">
                <video
                    ref={videoRef}
                    key={currentCase.id}
                    autoPlay
                    muted
                    loop
                    poster={currentCase.poster}
                    className="main-video"
                    playsInline
                >
                    <source src={currentCase.videoSources.webm} type="video/webm" />
                    <source src={currentCase.videoSources.mp4} type="video/mp4" />
                    Tu navegador no soporta videos.
                </video>

                <div className="video-custom-controls">
                    <button className="control-btn play-pause" onClick={togglePlay} aria-label={isPlaying ? "Pausar" : "Reproducir"}>
                        {isPlaying ? (
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </button>
                    <button className="control-btn mute-unmute" onClick={toggleMute} aria-label={isMuted ? "Activar sonido" : "Silenciar"}>
                        {isMuted ? (
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM3 9v6h4l5 5V4L7 9H3zM12.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

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
                                <CaseVideo currentCase={currentCase} />

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
