import Agencia1 from './subsections/Agencia1';
import Agencia2 from './subsections/Agencia2';
import SectionPill from '../../ui/SectionPill';
import ServiceCard from './ServiceCard';
import './Agencia.scss';

const Agencia = () => {
    const services = [
        {
            title: "Paid Media [Ads]",
            tag: "Growth",
            desc: "Ponemos tu mensaje frente a quien quiere comprar. Meta & Google Ads con foco en ROI.",
            image: ""
        },
        {
            title: "Branding & Diseño",
            tag: "Identidad",
            desc: "Identidades visuales que construyen autoridad inmediata.",
            image: ""
        },
        {
            title: "Social & Content",
            tag: "Engage",
            desc: "Estrategias de contenido vertical (Reels/TikTok) para retener audiencia.",
            image: ""
        }
    ];

    return (
        <div id="agencia" className="agencia-wrapper">
            {/* Bloque 1: Intro Creativa */}
            <section className="agencia-intro-block">
                <div className="agencia-background">
                    <div className="gradient-sphere orange-sphere"></div>
                    <div className="grid-overlay"></div>
                </div>

                <div className="container">
                    <div className="agencia-content">
                        <h2 className="agencia-title">
                            Creatividad <br />que se mide <br />en ventas.
                        </h2>

                        <p className="agencia-subtitle">
                            Branding, Contenido y Paid Media para marcas que quieren liderar, no solo competir.
                        </p>

                        <div className="agencia-cta">
                            <a href="#planes" className="btn-planes">
                                Mira nuestros planes
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bloque 2: Tu departamento de marketing */}
            <section className="agencia-services-block">
                <div className="container">
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
        </div>
    );
};

export default Agencia;
