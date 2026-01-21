import Agencia1 from './subsections/Agencia1';
import Agencia2 from './subsections/Agencia2';
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
        <>
            <section id="agencia" className="agencia-section">
                <div className="container">
                    <div className="agencia-header">
                        <div className="title-area">
                            <SectionPill text="Agencia" />
                            <h2><span className="dark">DESPUÉS,</span> <span className="blue">LA ACCIÓN.</span></h2>
                            <p>Transformamos esa estrategia en activos digitales que venden. <br /> Somos el brazo ejecutor que tu marca necesita.</p>
                        </div>
                        <div className="action-area">
                            <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ19JF6L1eipDhqCCUQr1FpObl3R5w1WcsYH4wRPfnbOfUsCc2vz07la72glqvWmDA_Svg19CKBU?gv=true" target="_blank" rel="noopener noreferrer" className="btn-primary">Agendar una reunión</a>
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

            <section>
                <Agencia1 />
            </section>

            <section>
                <Agencia2 />
            </section>
        </>
    );
};

export default Agencia;
