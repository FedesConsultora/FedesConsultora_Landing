import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaWhatsapp,
    FaInstagram,
    FaLinkedin,
    FaYoutube
} from "react-icons/fa";
import { Player } from "@lottiefiles/react-lottie-player";
import { enviarConsultaContacto } from "../../services/googleApi";
import lottieSuccess from "../../assets/lotties/coheteThankYou.json";
import "./OdooLanding.scss";
import CampoImg from '../../assets/img/campo/campo.webp'

const OdooLanding = () => {
    /* ---------- state ---------- */
    const [formData, setFormData] = useState({
        nombre: "",
        telefono: "",
        email: "",
        empresa: "",
        servicio: "Odoo Agromarketing",
        mensaje: ""
    });
    const [sendingTarget, setSendingTarget] = useState(null); // null | 'email' | 'whatsapp'
    const [formError, setFormError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    /* ---------- handlers ---------- */
    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const checkRequired = () => {
        if (!formData.nombre || !formData.email || !formData.mensaje) {
            setFormError("Por favor completá los campos obligatorios antes de enviar.");
            return false;
        }
        setFormError("");
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (sendingTarget) return;
        if (!checkRequired()) return;

        setSendingTarget("email");
        try {
            const ok = await enviarConsultaContacto({ ...formData, origen: "odoo_landing" });
            if (ok.success) {
                setSubmitted(true);
            } else {
                alert("Hubo un error enviando la consulta. Intenta nuevamente.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Error de conexión. Intenta nuevamente.");
        } finally {
            setSendingTarget(null);
        }
    };

    const handleWhatsApp = () => {
        const texto = encodeURIComponent(
            `👋 ¡Hola! Vengo desde la Landing de Odoo y me gustaría recibir más información.` +
            (formData.nombre ? `\n\n👤 Mi nombre es: ${formData.nombre}` : "") +
            (formData.empresa ? `\n🏢 Empresa: ${formData.empresa}` : "") +
            (formData.mensaje ? `\n\n💬 Mensaje: ${formData.mensaje}` : "")
        );

        const wpNum = "5492213092529";
        window.open(`https://wa.me/${wpNum}?text=${texto}`, "_blank");
    };

    return (
        <div className="odoo-landing">
            {/* SUCCESS OVERLAY */}
            <AnimatePresence>
                {submitted && (
                    <motion.div
                        className="success-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="success-content"
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                        >
                            <Player
                                autoplay
                                loop={false}
                                keepLastFrame
                                src={lottieSuccess}
                                style={{ height: "250px", width: "250px" }}
                            />
                            <h2>¡MENSAJE ENVIADO!</h2>
                            <p>Gracias por contactarte. Nuestro equipo técnico se comunicará con vos a la brevedad para potenciar tu marca.</p>
                            <button onClick={() => setSubmitted(false)} className="close-success">CONTINUAR</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="hero-section">
                <img
                    src={CampoImg}
                    alt="Campo Argentino"
                    className="hero-bg-image"
                />

                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="badge-agro">Ecosistema Agromarketing</span>
                        <h1>¿CUÁNTO TE CUESTA EL <strong>SILENCIO</strong> DE TU MARCA?</h1>
                        <p className="hero-desc">
                            No sólo produzcas excelencia, asegurate de que el mercado lo sepa. Potenciamos tu presencia en el sector agropecuario con soluciones estratégicas.
                        </p>

                        <div className="hero-footer">
                            <img src="https://fedesconsultora.com/fedes-consultora/landing/lineaBlancaHorizontal.svg" alt="Fedes Consultora" className="mini-logo" />
                            <div className="social-icons">
                                <a href="https://www.instagram.com/fedesconsultora/" target="_blank" rel="noreferrer"><FaInstagram /></a>
                                <a href="https://www.linkedin.com/company/fedesagency/" target="_blank" rel="noreferrer"><FaLinkedin /></a>
                                <a href="https://www.youtube.com/@fedesconsultora" target="_blank" rel="noreferrer"><FaYoutube /></a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="form-container"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="glass-card">
                            <h3>Accedé a una consultoría sin costo</h3>
                            <form className="google-form" onSubmit={handleSubmit}>
                                <div className="field">
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nombre completo"
                                    />
                                </div>

                                <div className="input-row">
                                    <div className="field">
                                        <input
                                            type="text"
                                            name="empresa"
                                            value={formData.empresa}
                                            onChange={handleChange}
                                            placeholder="Empresa / Establecimiento"
                                        />
                                    </div>
                                    <div className="field">
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            placeholder="WhatsApp"
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Correo electrónico"
                                    />
                                </div>

                                <div className="field">
                                    <textarea
                                        name="mensaje"
                                        value={formData.mensaje}
                                        onChange={handleChange}
                                        required
                                        placeholder="¿En qué podemos ayudarte?"
                                    />
                                </div>

                                {formError && <p className="error-text">{formError}</p>}

                                <button type="submit" className="btn-submit" disabled={!!sendingTarget}>
                                    {sendingTarget === 'email' ? 'Enviando...' : 'Obtener Consultoría'}
                                </button>

                                <button type="button" className="btn-whatsapp" onClick={handleWhatsApp}>
                                    <FaWhatsapp /> WhatsApp Directo
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CONTACT INFO */}
            <section className="odoo-footer">
                <div className="contact-info">
                    <div className="info-item">
                        <FaMapMarkerAlt /> <span>Plaza Paso 159, La Plata</span>
                    </div>
                    <div className="info-item">
                        <FaPhone /> <span>+54 9 221 309-2529</span>
                    </div>
                    <div className="info-item">
                        <FaEnvelope /> <span>info@fedesconsultora.com</span>
                    </div>
                </div>
            </section>

            <div className="bottom-cta">
                <p className="cta-text">ACCEDÉ A UNA CONSULTORÍA ESTRATÉGICA INICIAL, SIN COSTO.</p>
                <strong className="cta-big">Impulsamos tu Marca en el Sector Agropecuario.</strong>
            </div>
        </div>
    );
};

export default OdooLanding;
