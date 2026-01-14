import React from 'react';
import SectionPill from '../../ui/SectionPill';
import ServiceCard from './ServiceCard';
import './Agencia.scss';

const Agencia = () => {
    const services = [
        {
            title: "Branding & Identidad",
            tag: "Identidad",
            image: ""
        },
        {
            title: "Web Design & Dev",
            tag: "Digital",
            image: ""
        },
        {
            title: "Ads & Performance",
            tag: "Growth",
            image: ""
        }
    ];

    return (
        <section id="agencia" className="agencia-section">
            <div className="container">
                <div className="agencia-header">
                    <div className="title-area">
                        <SectionPill text="Agencia" />
                        <h2><span className="dark">DESPUÉS,</span> <span className="blue">LA ACCIÓN.</span></h2>
                        <p>Transformamos esa estrategia en activos digitales que venden. <br /> Somos el brazo ejecutor que tu marca necesita.</p>
                    </div>
                    <div className="action-area">
                        <a href="/contacto" className="btn-primary">Agendar una reunión</a>
                    </div>
                </div>

                <div className="services-grid">
                    {services.map((service, index) => (
                        <ServiceCard
                            key={index}
                            title={service.title}
                            tag={service.tag}
                            image={service.image}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Agencia;
