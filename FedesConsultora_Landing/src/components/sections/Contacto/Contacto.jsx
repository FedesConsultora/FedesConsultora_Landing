import React from 'react';
import SectionPill from '../../ui/SectionPill';
import ContactForm from './ContactForm';
import './Contacto.scss';

const Contacto = () => {
    return (
        <section id="contacto" className="contacto-section">
            <div className="container">
                <div className="contacto-wrapper">
                    <div className="contacto-title">
                        <h2>¿LISTO PARA ESCALAR?</h2>
                    </div>

                    <div className="contacto-info-items">
                        <p><strong>Whatsapp:</strong> +54 9 221 309-2529</p>
                        <p><strong>Email:</strong> info@fedesconsultora.com</p>
                        <p><strong>Dirección:</strong> Plaza Paso 159, Buenos Aires</p>
                    </div>

                    <div className="contacto-cta">
                        <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ19JF6L1eipDhqCCUQr1FpObl3R5w1WcsYH4wRPfnbOfUsCc2vz07la72glqvWmDA_Svg19CKBU?gv=true" target="_blank" rel="noopener noreferrer" className='btn-appointment-white'>Agenda una reunion</a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contacto;
