import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import FedesLogoDegr from '../../../../assets/img/logo-degr.svg'
import './Hero1.scss'

const Hero1 = () => {
    const [isMobile, setIsMobile] = useState(false);

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
                duration: isMobile ? 1.8 : 2.5,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2
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
                delay: isMobile ? 1.9 : 2.8,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
            }
        },
        revealRest: {
            x: 0,
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                delay: isMobile ? 2.1 : 3.1,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    return (
        <div className='hero-1-subsection'>
            <div className="hero-1-container">
                <div className="hero-1-top">
                    <h1 className="hero-1-title-animated">
                        <motion.span
                            className="text-part-en"
                            variants={textPartVariants}
                            initial="hiddenEn"
                            animate="revealEn"
                        >
                            En&nbsp;
                        </motion.span>

                        <div className="logo-wrapper">
                            <motion.div
                                className="fedes-logo-animated"
                                variants={logoVariants}
                                initial="initial"
                                animate="animate"
                            >
                                <img src={FedesLogoDegr} style={{ pointerEvents: 'none', width: '100%' }} alt="FEDES" /> {''}
                            </motion.div>
                        </div>

                        <motion.span
                            className="text-part-rest"
                            variants={textPartVariants}
                            initial="hiddenRest"
                            animate="revealRest"
                        >
                            tenemos la solución.
                        </motion.span>
                    </h1>
                </div>

                <div className="hero-1-cards">
                    <div className="solution-card">
                        <div className="card-image-placeholder"></div>
                        <h3>¿Sientes que tu negocio te atrapa?</h3>
                        <p>Ventas desordenadas, rentabilidad baja, dependes de estar presente 24/7.</p>
                        <button className="solution-btn">Necesito orden</button>
                    </div>

                    <div className="solution-card">
                        <div className="card-image-placeholder"></div>
                        <h3>¿Sientes que el mercado te ignora?</h3>
                        <p>Marca anticuada, anuncios que no convierten, competencia ganando terreno.</p>
                        <button className="solution-btn">Necesito ventas</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero1
