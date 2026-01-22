import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
// import emailjs from '@emailjs/browser';
import './ContactForm.scss';

const ContactForm = ({ title = "ESCRIBINOS", showTitle = true, onSuccess }) => {
    const form = useRef();
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const sendEmail = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setStatus({ type: '', message: '' });

        // Implementation with FormSubmit.co
        const formData = new FormData(form.current);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('https://formsubmit.co/ajax/info@fedesconsultora.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setStatus({ type: 'success', message: '¡Mensaje enviado con éxito!' });
                form.current.reset();
                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess();
                    }, 2500);
                }
            } else {
                setStatus({ type: 'error', message: 'Hubo un error al enviar.' });
            }
        } catch (error) {
            console.error('FormSubmit Error:', error);
            setStatus({ type: 'error', message: 'Hubo un error al enviar el mensaje.' });
        } finally {
            setIsSending(false);
        }

        /* 
        // Original EmailJS logic (Commented out)
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        emailjs.sendForm(serviceId, templateId, form.current, publicKey)
            .then((result) => {
                setStatus({ type: 'success', message: '¡Mensaje enviado con éxito!' });
                form.current.reset();
            }, (error) => {
                setStatus({ type: 'error', message: 'Hubo un error al enviar.' });
            })
            .finally(() => {
                setIsSending(false);
            });
        */
    };

    return (
        <div className="contacto-form-container">
            {showTitle && <h3 className="form-title">{title}</h3>}
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
                    <motion.div
                        className={`form-status ${status.type}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {status.type === 'success' && (
                            <motion.span
                                className="success-icon"
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                            >
                                <IoCheckmarkCircleOutline size={22} />
                            </motion.span>
                        )}
                        {status.message}
                    </motion.div>
                )}

                <button type="submit" className="btn-submit" disabled={isSending}>
                    {isSending ? 'Enviando...' : 'Enviar'}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
