import React from 'react';
import Agencia1 from './subsections/Agencia1';
import Agencia2 from './subsections/Agencia2';
import SectionPill from '../../ui/SectionPill';
import ServiceCard from './ServiceCard';
import './Agencia.scss';
import AgenciaDegr1 from '../../../assets/img/backgrounds/agencia-degr (2).svg';
import AgenciaDegr2 from '../../../assets/img/backgrounds/agencia-degr (1).svg';
import ConsultoraGrid from '../../../assets/img/backgrounds/consultora-grilla (3).svg';
import { motion } from 'framer-motion';

// 1. Guardar tus imágenes en: src/assets/img/services/
// 2. Nombres: paid-media.webp, branding.webp, social.webp
// 3. Descomentar las siguientes líneas cuando las tengas:
import PaidMediaImg from '../../../assets/img/services/paid-media.webp';
import BrandingImg from '../../../assets/img/services/branding.webp';
import SocialImg from '../../../assets/img/services/social.webp';

const Agencia = () => {
    // Definimos como null las que aún no existen para que no den error
    const dropVariants = {
        hidden: {
            opacity: 0,
            y: -30
        },
        visible: (i = 0) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1.8,
                ease: [0.26, 1, 0.36, 1],
                delay: i * 0.1
            }
        })
    };

    const services = [
        {
            title: "Paid media (ads)",
            tag: "Growth",
            desc: "Ponemos tu mensaje frente a quienes ya están listos para comprar. Meta y Google Ads con foco en ROI",
            image: PaidMediaImg
        },
        {
            title: "Branding y diseño",
            tag: "Identidad",
            desc: "Identidades visuales que ordenan, diferencian y construyen autoridad inmediata.",
            image: BrandingImg
        },
        {
            title: "Social y content",
            tag: "Engage",
            desc: "Estrategias de contenido vertical (reels de Instagram y videos de TikTok) para captar y retener la audiencia.",
            image: SocialImg
        }
    ];

    const titleContainer = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.4,
                delayChildren: 0.2,
            },
        },
    };

    const titleItem = {
        hidden: {
            y: -18,
            opacity: 0,
        },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 1.65,
                ease: [0.26, 1, 0.36, 1],
            },
        },
    };


    return (
        <div id="agencia" className="agencia-wrapper">
            <div className="agencia-background">
                <img src={AgenciaDegr1} className="bg-degr degr-1" alt="" />
                <img src={AgenciaDegr2} className="bg-degr degr-2" alt="" />

                <img src={ConsultoraGrid} className="bg-grid" alt="" />
            </div>

            {/* Bloque 1: Intro Creativa */}
            <section className="agencia-intro-block">

                <div className="container">
                    <div className="agencia-content">
                        <h2 className="agencia-title">
                            <motion.div
                                className="agencia-title-inner highlight"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{
                                    duration: 1.8,
                                    ease: [0.30, 1, 0.36, 1],
                                }}
                            >
                                Creatividad
                            </motion.div>

                            <motion.div
                                className="agencia-title-inner"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-100px' }}
                                transition={{
                                    duration: 1.2,
                                    delay: 0.6,
                                    ease: [0.30, 1, 0.36, 1],
                                }}
                            >
                                que se mide <br />en ventas.
                            </motion.div>
                        </h2>


                        <p className="agencia-subtitle">
                            Branding, contenido y paid media pensados para que tu marca deje de competir y empiece a liderar.                        </p>

                        <div className="agencia-cta">
                            <button
                                onClick={() => {
                                    const event = new CustomEvent('open-fedi', {
                                        detail: { message: 'Ver Planes' }
                                    });
                                    window.dispatchEvent(event);
                                }}
                                className="btn-planes"
                            >
                                Ver nuestros planes
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bloque 2: Tu departamento de marketing */}
            <section className="agencia-services-block">
                <div className="container" style={{ paddingLeft: '60px', paddingRight: '60px' }}>
                    <motion.h2
                        className="services-title"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0 }}
                        variants={dropVariants}
                    >
                        Tu departamento de <br /> marketing externo.
                    </motion.h2>

                    <div className="services-grid">
                        {services.map((service, index) => (
                            <div key={index} className="service-column">
                                <ServiceCard
                                    title={service.title}
                                    tag={service.tag}
                                    image={service.image}
                                />
                                <p className="service-desc">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bloque 3: Casos de éxito (Agencia) (Hidden as requested) */}
            {/* <Agencia1 /> */}
        </div>
    );
};

export default Agencia;
