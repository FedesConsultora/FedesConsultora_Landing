import React from 'react';
import Agencia1 from './subsections/Agencia1';
import Agencia2 from './subsections/Agencia2';
import SectionPill from '../../ui/SectionPill';
import ServiceCard from './ServiceCard';
import './Agencia.scss';
import AgenciaDegr1 from '../../../assets/img/backgrounds/agencia-degr (2).svg';
import ConsultoraGrid from '../../../assets/img/backgrounds/consultora-grilla (3).svg';
import { motion } from 'framer-motion';

const Agencia = () => {
    const dropVariants = {
        hidden: {
            opacity: 0,
            y: -30
        },
        visible: (i = 0) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 1, 0.5, 1],
                delay: i * 0.15
            }
        })
    };

    const services = [
        {
            title: "Paid media (ads)",
            tag: "Growth",
            desc: "Ponemos tu mensaje frente a quienes ya están listos para comprar. Meta y Google Ads con foco en ROI",
            image: ""
        },
        {
            title: "Branding y diseño",
            tag: "Identidad",
            desc: "Identidades visuales que ordenan, diferencian y construyen autoridad inmediata.",
            image: ""
        },
        {
            title: "Social y content",
            tag: "Engage",
            desc: "Estrategias de contenido vertical (reels de Instagram y videos de TikTok) para captar y retener la audiencia.",
            image: ""
        }
    ];

    const titleContainer = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.8,
                delayChildren: 0.7,
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

                duration: 1,
                ease: [0.26, 1, 0.36, 1],
            },
        },
    };


    return (
        <div id="agencia" className="agencia-wrapper">
            <div className="agencia-background">
                <img src={AgenciaDegr1} className="bg-degr degr-1" alt="" />

                <img src={ConsultoraGrid} className="bg-grid" alt="" />
            </div>

            {/* Bloque 1: Intro Creativa */}
            <section className="agencia-intro-block">

                <div className="container">
                    <div className="agencia-content">
                        <h2 className="agencia-title">
                            <motion.div
                                variants={titleContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.6 }}
                            >
                                <motion.span
                                    className="agencia-title-inner"
                                    variants={titleItem}
                                >
                                    Creatividad
                                </motion.span>

                                <motion.span
                                    className="agencia-title-inner"
                                    variants={titleItem}
                                >
                                    que se mide <br />en ventas.
                                </motion.span>
                            </motion.div>
                        </h2>


                        <p className="agencia-subtitle">
                            Branding, contenido y paid media pensados para que tu marca deje de competir y empiece a liderar.                        </p>

                        <div className="agencia-cta">
                            <a href="#planes" className="btn-planes">
                                Ver nuestros planes
                            </a>
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

            {/* Bloque 3: Casos de éxito (Agencia) */}
            <Agencia1 />
        </div>
    );
};

export default Agencia;
