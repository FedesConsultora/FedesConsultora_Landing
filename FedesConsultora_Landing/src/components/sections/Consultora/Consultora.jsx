import SectionPill from '../../ui/SectionPill';
import Consultora1 from './subsections/Consultora1';
import Consultora2 from './subsections/Consultora2';
import './Consultora.scss';

const Consultora = () => {
    const painPoints = [
        "¿Tu facturación crece pero tu rentabilidad baja?",
        "¿Sentís que tu empresa depende 100% de vos?",
        "¿Falta claridad en los procesos comerciales?"
    ];

    return (
        <>
            <section id="consultora" className="consultora-section">
                <div className="container">
                    <div className="intro">
                        <SectionPill text="Consultora" />
                        <h2><span className="dark">PRIMERO,</span> <span className="blue">EL NEGOCIO.</span></h2>
                        <p >De nada sirve un logo lindo si los números no cierran. Antes de ejecutar, ordenamos la casa.</p>
                    </div>

                    <div className="pain-points-stack">
                        {painPoints.map((text, index) => (
                            <div key={index} className="pain-point-card">
                                <p>{text}</p>
                            </div>
                        ))}
                        <div className="btn-container">
                            <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ19JF6L1eipDhqCCUQr1FpObl3R5w1WcsYH4wRPfnbOfUsCc2vz07la72glqvWmDA_Svg19CKBU?gv=true" target="_blank" rel="noopener noreferrer" className="btn-appointment">Agendá una reunión</a>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <Consultora1 />
            </section>

            <section>
                <Consultora2 />
            </section>
        </>
    );
};

export default Consultora;
