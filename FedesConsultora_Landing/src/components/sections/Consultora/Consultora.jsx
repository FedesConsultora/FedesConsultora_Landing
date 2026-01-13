import SectionPill from '../../ui/SectionPill';
import './Consultora.scss';

const Consultora = () => {
    const painPoints = [
        "¿Tu facturación crece pero tu rentabilidad baja?",
        "¿Sentís que tu empresa depende 100% de vos?",
        "¿Falta claridad en los procesos comerciales?"
    ];

    return (
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
                        <a href="/contacto" className="btn-appointment">Agendá una reunión</a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Consultora;
