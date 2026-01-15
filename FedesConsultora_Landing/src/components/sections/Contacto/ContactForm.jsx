import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import './Contacto.scss';

const ContactForm = () => {
    const form = useRef();
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const sendEmail = (e) => {
        e.preventDefault();
        setIsSending(true);
        setStatus({ type: '', message: '' });

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            setStatus({
                type: 'error',
                message: 'Error de configuración. Por favor, revisa las variables de entorno.'
            });
            setIsSending(false);
            return;
        }

        emailjs.sendForm(serviceId, templateId, form.current, publicKey)
            .then((result) => {
                console.log(result.text);
                setStatus({ type: 'success', message: '¡Mensaje enviado con éxito!' });
                form.current.reset();
            }, (error) => {
                console.log(error.text);
                setStatus({ type: 'error', message: 'Hubo un error al enviar el mensaje. Reintenta luego.' });
            })
            .finally(() => {
                setIsSending(false);
            });
    };

    return (
        <div className="contacto-form-container">
            <h3 className="form-title">ESCRIBINOS</h3>
            <form ref={form} className="contacto-form" onSubmit={sendEmail}>
                <div className="form-group">
                    <input
                        type="text"
                        name="user_name"
                        placeholder="Nombre"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="email"
                        name="user_email"
                        placeholder="Email"
                        required
                    />
                </div>
                <div className="form-group">
                    <textarea
                        name="message"
                        placeholder="Mensaje"
                        rows="5"
                        required
                    ></textarea>
                </div>

                {status.message && (
                    <div className={`form-status ${status.type}`}>
                        {status.message}
                    </div>
                )}

                <button type="submit" className="btn-submit" disabled={isSending}>
                    {isSending ? 'Enviando...' : 'Enviar'}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
