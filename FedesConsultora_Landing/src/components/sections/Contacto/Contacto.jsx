import React from 'react';
import SectionPill from '../../ui/SectionPill';
import ContactForm from './ContactForm';
import './Contacto.scss';

const Contacto = () => {
    return (
        <section id="contacto" className="contacto-section">
            <div className="container">
                <div className="contacto-wrapper">
                    {/* Header a la izquierda */}
                    <div className="contacto-info">
                        <div className="contacto-header">
                            <SectionPill text="Contacto" />
                            <h2>¿LISTO PARA ESCALAR?</h2>
                            <div className="info-items">
                                <p><strong>Whatsapp:</strong> +54 9 221 309-2529</p>
                                <p><strong>Email:</strong> info@fedesconsultora.com</p>
                                <p><strong>Dirección:</strong> Plaza Paso 159, Buenos Aires</p>
                            </div>
                            <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ19JF6L1eipDhqCCUQr1FpObl3R5w1WcsYH4wRPfnbOfUsCc2vz07la72glqvWmDA_Svg19CKBU?gv=true" target="_blank" rel="noopener noreferrer" className='btn-appointment'>Agendá una reunión</a>
                        </div>
                    </div>

                    {/* Formulario a la derecha */}
                    <ContactForm />
                </div>
            </div>
        </section>
    );
};

export default Contacto;
