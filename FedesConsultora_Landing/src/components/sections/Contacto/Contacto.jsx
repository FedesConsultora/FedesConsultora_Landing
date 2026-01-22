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
                        <h2>¿Listo para <span style={{ fontWeight: 'bold' }}>escalar?</span></h2>
                    </div>

                    <div className="contacto-info-items">
                        <p>
                            <a className='contact-item'
                                href="https://wa.me/5492213092529"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Whatsapp: +54 9 221 309-2529
                            </a>
                        </p>

                        <p>
                            <a className='contact-item' style={{ pointerEvents: ' auto' }} href="mailto:info@fedesconsultora.com" target="_blank" rel="noopener noreferrer">
                                Email: info@fedesconsultora.com
                            </a>
                        </p>

                        <p>
                            <a className='contact-item'
                                href='https://www.google.com/maps/place/Pl.+Paso+159,+B1900+La+Plata,+Provincia+de+Buenos+Aires/@-34.9164597,-57.9653554,17z/data=!3m1!4b1!4m6!3m5!1s0x95a2e634a32c953f:0xa7f9bb231a4546c7!8m2!3d-34.9164598!4d-57.9604845!16s%2Fg%2F11s9kvmwr8?entry=ttu&g_ep=EgoyMDI2MDEyMC4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D'
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Dirección: Plaza Paso 159, Buenos Aires
                            </a>
                        </p>

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
