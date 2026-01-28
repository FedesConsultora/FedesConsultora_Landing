import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import FedesLogoDegr from '../../../../assets/img/logo-degr.svg'
import './Hero1.scss'

const Hero1 = () => {
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.2 });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Animation variants for the logo
    const logoVariants = {
        initial: {
            scale: isMobile ? 6 : 12,
            y: isMobile ? "-30vh" : "-80vh",
            x: isMobile ? "-20vw" : "-50vw",
            rotate: isMobile ? -15 : -30,
            opacity: 0,
            left: "50%",
            position: "absolute"
        },
        animate: {
            scale: 1,
            y: 0,
            x: 0,
            rotate: 0,
            opacity: 1,
            left: "0%",
            position: "relative",
            transition: {
                duration: isMobile ? 1.2 : 1.8,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1
            }
        }
    };

    // Animation variants for the text parts coming from behind
    const textPartVariants = {
        hiddenEn: {
            x: isMobile ? 0 : 50,
            y: isMobile ? 20 : 0,
            opacity: 0,
            filter: "blur(10px)"
        },
        hiddenRest: {
            x: isMobile ? 0 : -50,
            y: isMobile ? 20 : 0,
            opacity: 0,
            filter: "blur(10px)"
        },
        revealEn: {
            x: 0,
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                delay: isMobile ? 1.0 : 1.4,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        },
        revealRest: {
            x: 0,
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                delay: isMobile ? 1.1 : 1.6,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    return (
        <div className='hero-1-subsection' ref={containerRef}>
            <div className="hero-1-container">
                <div className="hero-1-top">
                    <h1 className="hero-1-title-animated">
                        <motion.span
                            className="text-part-en"
                            variants={textPartVariants}
                            initial="hiddenEn"
                            animate={isInView ? "revealEn" : "hiddenEn"}
                        >
                            En&nbsp;
                        </motion.span>

                        <div className="logo-wrapper">
                            <motion.div
                                className="fedes-logo-animated"
                                variants={logoVariants}
                                initial="initial"
                                animate={isInView ? "animate" : "initial"}
                            >
                                <img src={FedesLogoDegr} style={{ pointerEvents: 'none', width: '100%' }} alt="FEDES" /> {''}
                            </motion.div>
                        </div>

                        <motion.span
                            className="text-part-rest"
                            variants={textPartVariants}
                            initial="hiddenRest"
                            animate={isInView ? "revealRest" : "hiddenRest"}
                        >
                            tenemos la solución.
                        </motion.span>
                    </h1>
                </div>

                <div className="hero-1-cards">
                    <div className="solution-card">
                        <div className="card-image-placeholder"></div>
                        <h3>¿Sentís que tu negocio te atrapa?
                        </h3>
                        <p>Ventas desordenadas, rentabilidad baja, dependencia de estar presente 24/7.</p>
                        <Link to="/consultora" className="solution-btn">Necesito orden</Link>
                    </div>

                    <div className="solution-card">
                        <div className="card-image-placeholder"></div>
                        <h3>¿Sentís que el mercado te ignora?</h3>
                        <p>Marca desactualizada, anuncios que no convierten, competencia que avanza.</p>
                        <Link to="/agencia" className="solution-btn">Necesito clientes</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero1
