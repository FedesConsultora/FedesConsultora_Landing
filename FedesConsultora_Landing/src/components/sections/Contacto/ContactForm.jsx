import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from "@lottiefiles/react-lottie-player";
import { FaWhatsapp, FaChevronDown } from "react-icons/fa";
import { enviarConsultaContacto, trackEvent } from '../../../services/googleApi';
import coheteLottie from '../../../assets/lotties/coheteThankYou.json';
import './ContactForm.scss';

const CustomSelect = ({ value, onChange, options, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="custom-select-container" ref={containerRef}>
            <label className="static-label">{label}</label>
            <div
                className={`select-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{value}</span>
                <FaChevronDown className={`chevron ${isOpen ? 'rotate' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="select-options"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {options.map((opt) => (
                            <div
                                key={opt}
                                className={`option ${value === opt ? 'selected' : ''}`}
                                onClick={() => {
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                            >
                                {opt}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ContactForm = ({ title = "ESCRIBINOS", showTitle = true, onSuccess, onStartSuccess }) => {
    const [isSending, setIsSending] = useState(false);
    const [sendingTarget, setSendingTarget] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        nombre: "",
        telefono: "",
        email: "",
        empresa: "",
        servicio: "Consultoría empresarial",
        mensaje: ""
    });

    const serviceOptions = [
        "Consultoría empresarial",
        "Gestión de redes sociales",
        "Publicidad y performance",
        "Desarrollo web",
        "Estrategia digital"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleServiceChange = (val) => {
        setFormData(prev => ({ ...prev, servicio: val }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "El email es obligatorio";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email no válido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSending || !validate()) return;

        setIsSending(true);
        setSendingTarget('email');

        const result = await enviarConsultaContacto({ ...formData, origen: "web" });

        if (result.success) {
            trackEvent('Contacto', 'Formulario Enviado', 'Email');
            setShowSuccess(true);
            if (onStartSuccess) onStartSuccess();
            if (onSuccess) {
                setTimeout(() => onSuccess(), 4500);
            }
        } else {
            trackEvent('Contacto', 'Error Envío Formulario', 'Email');
            setErrors({ submit: "Error al enviar. Inténtalo de nuevo." });
        }
        setIsSending(false);
        setSendingTarget(null);
    };

    const handleWhatsApp = async () => {
        if (isSending || !validate()) return;

        setIsSending(true);
        setSendingTarget('whatsapp');

        await enviarConsultaContacto({ ...formData, origen: "whatsapp" });

        const texto = encodeURIComponent(
            `👋 ¡Hola! Soy ${formData.nombre}\n` +
            (formData.empresa ? `🏢 Empresa: ${formData.empresa}\n` : "") +
            `📞 Tel: ${formData.telefono || "–"}\n` +
            `✉️ Email: ${formData.email}\n\n` +
            `🛰️ Interés: ${formData.servicio}\n\n` +
            `💬 Mensaje:\n${formData.mensaje}`
        );

        const wpNum = import.meta.env.VITE_WHATSAPP_NUMBER || "5492213092529";
        trackEvent('Contacto', 'Click WhatsApp', 'Formulario');
        window.open(`https://wa.me/${wpNum}?text=${texto}`, "_blank");

        setShowSuccess(true);
        if (onStartSuccess) onStartSuccess();
        if (onSuccess) {
            setTimeout(() => onSuccess(), 4500);
        }

        setIsSending(false);
        setSendingTarget(null);
    };

    if (showSuccess) {
        return (
            <motion.div
                className="success-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="success-content">
                    <div className="lottie-wrapper">
                        <Player
                            autoplay
                            loop
                            keepLastFrame
                            src={coheteLottie}
                            style={{ height: "220px", width: "220px" }}
                        />
                    </div>
                    <div className="success-text">
                        <span className="success-badge">¡MENSAJE RECIBIDO!</span>
                        <h3 className="success-main-title">Tu mensaje despegó <strong>correctamente</strong></h3>
                        <p className="success-description">Gracias por confiar en nosotros. El equipo de Fedes revisará tu consulta y te responderá muy pronto.</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="contacto-form-container">
            {showTitle && <h3 className="form-title">{title}</h3>}
            <form className="contacto-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                    <div className={`form-group ${errors.nombre ? 'has-error' : ''}`}>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                name="nombre"
                                required
                                placeholder=" "
                                value={formData.nombre}
                                onChange={handleChange}
                            />
                            <label>
                                Nombre completo <span className="required-dot">•</span>
                            </label>
                            <div className="input-focus-line"></div>
                        </div>
                        <AnimatePresence>
                            {errors.nombre && (
                                <motion.span
                                    className="error-text"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {errors.nombre}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder=" "
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <label>
                                Correo electrónico <span className="required-dot">•</span>
                            </label>
                            <div className="input-focus-line"></div>
                        </div>
                        <AnimatePresence>
                            {errors.email && (
                                <motion.span
                                    className="error-text"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {errors.email}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <div className="input-wrapper">
                            <input
                                type="tel"
                                name="telefono"
                                placeholder=" "
                                value={formData.telefono}
                                onChange={handleChange}
                            />
                            <label>Teléfono (opcional)</label>
                            <div className="input-focus-line"></div>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                name="empresa"
                                placeholder=" "
                                value={formData.empresa}
                                onChange={handleChange}
                            />
                            <label>Empresa (opcional)</label>
                            <div className="input-focus-line"></div>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <CustomSelect
                        label="Servicio de interés"
                        value={formData.servicio}
                        onChange={handleServiceChange}
                        options={serviceOptions}
                    />
                </div>

                <div className={`form-group ${errors.mensaje ? 'has-error' : ''}`}>
                    <div className="input-wrapper">
                        <textarea
                            name="mensaje"
                            placeholder=" "
                            rows="4"
                            value={formData.mensaje}
                            onChange={handleChange}
                        ></textarea>
                        <label>
                            ¿Cómo podemos ayudarte?
                        </label>
                        <div className="input-focus-line"></div>
                    </div>
                    <AnimatePresence>
                        {errors.mensaje && (
                            <motion.span
                                className="error-text"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                {errors.mensaje}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {errors.submit && (
                    <motion.div
                        className="form-status error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {errors.submit}
                    </motion.div>
                )}

                <div className="buttons-group">
                    <button type="submit" className="btn-submit" disabled={isSending}>
                        <div className="btn-content">
                            <span>{sendingTarget === 'email' ? 'ENVIANDO...' : 'INICIAR PROYECTO'}</span>
                            {!isSending && <span className="btn-icon" style={{ marginLeft: '10px' }}>→</span>}
                        </div>
                        <div className="btn-bg"></div>
                    </button>

                    <button type="button" className="btn-whatsapp" onClick={handleWhatsApp} disabled={isSending}>
                        <div className="btn-content">
                            <FaWhatsapp size={20} />
                            <span>{sendingTarget === 'whatsapp' ? 'CONECTANDO...' : 'WHATSAPP'}</span>
                        </div>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactForm;
