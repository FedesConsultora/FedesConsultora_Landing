import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import './OnboardingMenu.scss';

// Assets
import imgDigital from '../../../../assets/img/onboarding/digital.webp';
import imgIdentity from '../../../../assets/img/onboarding/identity.webp';
import imgMarket from '../../../../assets/img/onboarding/market.webp';
import imgOrg from '../../../../assets/img/onboarding/org.webp';
import imgProduct from '../../../../assets/img/onboarding/product.webp';
import imgCommercial from '../../../../assets/img/onboarding/commercial.webp';
import imgFinancial from '../../../../assets/img/onboarding/financial.webp';

const modules = [
    {
        id: 'digital',
        title: 'Onboarding Digital',
        description: 'El punto de partida esencial para ordenar el ecosistema online. Análisis profundo de Instagram, Facebook, Google y e-commerce.',
        deliverable: 'Playbook de canales: qué publicar, dónde y con qué presupuesto exacto.',
        value: 'Dejamos de mirar "likes" para mirar el retorno de inversión real.',
        image: imgDigital,
        color: '#3b82f6'
    },
    {
        id: 'identity',
        title: 'Onboarding Identidad',
        description: 'Bajo la lupa el ADN de la marca. Coherencia visual, narrativa, naming, slogans y segmentación estratégica.',
        deliverable: 'Biblia de marca: documento que unifica el tono de voz y la estética visual.',
        value: 'Tu marca deja de ser un logo para convertirse en una narrativa que justifica tus precios.',
        image: imgIdentity,
        color: '#a855f7'
    },
    {
        id: 'market',
        title: 'Onboarding Mercado',
        description: 'Estudio de mercado y benchmarking competitivo. Análisis de tendencias, amenazas y rentabilidad para expansión.',
        deliverable: 'Matriz de oportunidades y pricing: comparativa contra la competencia para subir precios.',
        value: 'Seguridad estratégica basada en datos reales y tendencias validadas.',
        image: imgMarket,
        color: '#06b6d4'
    },
    {
        id: 'org',
        title: 'Onboarding Organizacional',
        description: 'Ordenar la casa por dentro. Procesos internos, roles, flujos de comunicación y cultura de trabajo.',
        deliverable: 'Mapa de procesos y roles: define quién hace qué y cómo se mide.',
        value: 'Recuperar tiempo personal. La empresa deja de depender 100% de la memoria del dueño.',
        image: imgOrg,
        color: '#10b981'
    },
    {
        id: 'product',
        title: 'Onboarding Producto',
        description: 'Arquitectura de la oferta para maximizar el deseo de compra. Ciclo de vida, packaging y propuesta de valor.',
        deliverable: 'Catálogo optimizado: priorización de productos de mayor margen.',
        value: 'Eficiencia comercial enfocando los recursos donde hay rentabilidad real.',
        image: imgProduct,
        color: '#f59e0b'
    },
    {
        id: 'commercial',
        title: 'Onboarding Comercial',
        description: 'Auditoría del motor de ventas. Embudo de conversión, CRM, desempeño de equipo y protocolos de cierre.',
        deliverable: 'Protocolo de gestión de ventas: el "paso a paso" de cómo atender y cerrar prospectos.',
        value: 'Dejás de depender del talento natural para pasar a un proceso repetible.',
        image: imgCommercial,
        color: '#6366f1'
    },
    {
        id: 'financial',
        title: 'Onboarding Financiero',
        description: 'Diagnóstico de salud económica. Costos, márgenes, flujos de caja y proyecciones sostenibles.',
        deliverable: 'Hoja de ruta de rentabilidad: informe de números claros y punto de equilibrio.',
        value: 'Claridad total. Entender por fin por qué, aunque facturás, sentís que no te queda plata.',
        image: imgFinancial,
        color: '#ef4444'
    }
];

const combos = [
    { title: 'Imagen y presencia', modules: 'Digital + Identidad', desc: 'Para marcas que necesitan profesionalizarse y traccionar redes.' },
    { title: 'Crecimiento de mercado', modules: 'Mercado + Comercial', desc: 'Para empresas estancadas que necesitan capturar rentabilidad.' },
    { title: 'Estructura de hierro', modules: 'Organizacional + Financiero', desc: 'Para dueños desbordados operativamente.' },
    { title: 'Full Fedes', modules: 'Digital + Identidad + Mercado', desc: 'Transformación total con visión 360 grados.' }
];

const OnboardingMenu = () => {
    const [width, setWidth] = useState(0);
    const sliderRef = useRef();
    const controls = useAnimation();
    const x = useMotionValue(0);

    // Single set of modules
    const displayModules = modules;

    const updateWidth = () => {
        if (sliderRef.current) {
            setWidth(sliderRef.current.scrollWidth - sliderRef.current.offsetWidth);
        }
    };

    useEffect(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Auto-scroll effect
    useEffect(() => {
        const autoScroll = async () => {
            if (width > 0) {
                await controls.start({
                    x: -width,
                    transition: {
                        duration: 30,
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "mirror"
                    }
                });
            }
        };
        autoScroll();
    }, [width, controls]);

    const handleDragEnd = (_, info) => {
        // Simple drag end to resume auto-scroll
        controls.start({
            x: x.get() > -width / 2 ? -width : 0,
            transition: {
                duration: 30,
                ease: "linear",
                repeat: Infinity,
                repeatType: "mirror"
            }
        });
    };

    return (
        <div className="onboarding-menu-container">
            <div className="container">
                <motion.div
                    className="onboarding-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="tag">Módulos Estratégicos</span>
                    <h2 className="section-title">Menú de onboarding</h2>
                    <p className="section-intro">
                        Elegí los pilares que tu empresa necesita para escalar con estructura y datos. Deslizá para navegar.
                    </p>
                </motion.div>

                <div className="slider-outer-wrapper">
                    <motion.div
                        ref={sliderRef}
                        className="modules-slider"
                        drag="x"
                        dragConstraints={{ right: 0, left: -width }}
                        style={{ x }}
                        animate={controls}
                        onDragStart={() => controls.stop()}
                        onDragEnd={handleDragEnd}
                    >
                        {displayModules.map((module, idx) => (
                            <div key={`${module.id}-${idx}`} className="module-card-wrapper">
                                <div className="module-card">
                                    <div className="card-image-area">
                                        {module.image ? (
                                            <img src={module.image} alt={module.title} className="bg-img" />
                                        ) : (
                                            <div className="placeholder-img" style={{ background: `linear-gradient(135deg, ${module.color}dd, #19222B)` }} />
                                        )}
                                        <div className="card-overlay" style={{ background: `linear-gradient(to bottom, transparent, #19222B)` }} />
                                        <h3 className="card-title">{module.title}</h3>
                                    </div>
                                    <div className="card-content">
                                        <p className="module-desc">{module.description}</p>
                                        <div className="module-details">
                                            <div className="detail-item">
                                                <span className="label">Entregable:</span>
                                                <span className="text">{module.deliverable}</span>
                                            </div>
                                            <div className="detail-item highlight">
                                                <span className="label">Valor:</span>
                                                <span className="text">{module.value}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="combos-section">
                    <div className="combos-header">
                        <h3 className="combos-title">Combos sugeridos</h3>
                        <p className="combos-subtitle">Estrategias integrales potenciadas</p>
                    </div>
                    <div className="combos-grid">
                        {combos.map((combo, idx) => (
                            <motion.div
                                key={idx}
                                className="combo-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="combo-content">
                                    <span className="combo-badge">Estrategia</span>
                                    <h4 className="combo-name">{combo.title}</h4>
                                    <div className="combo-tag">{combo.modules}</div>
                                    <p className="combo-desc">{combo.desc}</p>
                                </div>
                                <div className="combo-footer">
                                    <a
                                        href="https://calendar.app.google/PJRvwpLUfYQciy1Y8"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-consult"
                                    >
                                        Agendar reunión
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingMenu;
