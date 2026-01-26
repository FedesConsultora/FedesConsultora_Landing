import Agencia1 from './subsections/Agencia1';
import Agencia2 from './subsections/Agencia2';
import SectionPill from '../../ui/SectionPill';
import ServiceCard from './ServiceCard';
import './Agencia.scss';
import AgenciaDegr1 from '../../../assets/img/backgrounds/agencia-degr (2).svg';

import ConsultoraGrid from '../../../assets/img/backgrounds/consultora-grilla (3).svg';

const Agencia = () => {
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
                            Creatividad <br />que se mide <br />en ventas.
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
                    <h2 className="services-title">Tu departamento de <br /> marketing externo.</h2>

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
