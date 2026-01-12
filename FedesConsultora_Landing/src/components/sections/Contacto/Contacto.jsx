import React from 'react';
import './Contacto.scss';

const Contacto = () => {
    return (
        <section id="contacto" className="contacto-section">
            <div className="container">
                <div className="contacto-wrapper">
                    {/* Header a la izquierda */}
                    <div className="contacto-info">
                        <div className="contacto-header">
                            <h2>¿LISTO PARA ESCALAR?</h2>
                            <div className="info-items">
                                <p><strong>Whatsapp:</strong> +54 9 221 309-2529</p>
                                <p><strong>Email:</strong> info@fedesconsultora.com</p>
                                <p><strong>Dirección:</strong> Plaza Paso 159, Buenos Aires</p>
                            </div>
                            <div className='btn-container'>
                                <button className='btn-appointment'>Agendar un reunion</button>
                            </div>
                        </div>
                    </div>

                    {/* Formulario a la derecha */}
                    <form className="contacto-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <input type="text" placeholder="Nombre completo" required />
                        </div>
                        <div className="form-group">
                            <input type="email" placeholder="Email corporativo" required />
                        </div>
                        <div className="form-group">
                            <input type="text" placeholder="Empresa / Proyecto" required />
                        </div>
                        <div className="form-group">
                            <textarea placeholder="¿En qué podemos ayudarte?" rows="4"></textarea>
                        </div>
                        <button type="submit" className="btn-submit">
                            Enviar mensaje
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contacto;
