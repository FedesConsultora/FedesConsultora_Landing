import React from 'react';
import SectionPill from '../../ui/SectionPill';
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
                            <button className='btn-appointment'>Agendá una reunión</button>
                        </div>
                    </div>

                    {/* Formulario a la derecha */}
                    <div className="contacto-form-container">
                        <h3 className="form-title">ESCRIBINOS</h3>
                        <form className="contacto-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <input type="text" placeholder="Nombre" required />
                            </div>
                            <div className="form-group">
                                <input type="email" placeholder="Email" required />
                            </div>
                            <div className="form-group">
                                <textarea placeholder="Mensaje" rows="5"></textarea>
                            </div>
                            <button type="submit" className="btn-submit">
                                Enviar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contacto;
