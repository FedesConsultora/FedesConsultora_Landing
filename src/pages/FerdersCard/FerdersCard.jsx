import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Linkedin, Mail, Phone, Globe, Download, Send, Sparkles } from 'lucide-react';
import './FerdersCard.scss';

// Import images
import ChironiImg from '../../assets/img/feders/jefes/Fede Chironi.webp';
import FedeJuanImg from '../../assets/img/feders/jefes/Fede Juan.webp';

// Data for each card.
// Note: Phone numbers can be easily updated here. We use placeholders for now, which can be modified.
const CARD_DATA = {
    federicochironi: {
        name: 'FEDERICO CHIRONI',
        role: 'CoFounder y CEO',
        company: 'Fedes Consultora',
        photo: ChironiImg,
        photoPosition: 'center 10%', // focus on the head/face
        email: 'fchironi@fedes.ai',
        phone: '+5493416562038', // Format for calling / WhatsApp
        phoneDisplay: '+54 9 341 656-2038',
        linkedin: 'https://www.linkedin.com/in/federicochironi/',
        whatsapp: 'https://wa.me/5493416562038',
        website: 'https://www.fedes.ai',
        bio: 'Consultor en Marketing Estratégico y Análisis de Mercado. Miembro del Jurado de la Asociación Argentina de Marketing.',
        skills: ['Marketing Estratégico', 'Negocios', 'Liderazgo', 'Consultoría']
    },
    federicojuan: {
        name: 'FEDE JUAN',
        role: 'CoFounder y CGO',
        company: 'Fedes Consultora',
        photo: FedeJuanImg,
        photoPosition: 'center 8%', // focus on the head/face
        email: 'fjuan@fedes.ai',
        phone: '+5491112345678', // Placeholder, please update with real phone
        phoneDisplay: '+54 9 11 1234-5678',
        linkedin: 'https://www.linkedin.com/in/fede-juan/',
        whatsapp: 'https://wa.me/5491112345678', // Placeholder
        website: 'https://www.fedes.ai',
        bio: 'Licenciado en Administración de Empresas (UdeSA). Fundador de ReydelosNegocios con más de 400k seguidores.',
        skills: ['Growth Marketing', 'Marcas Digitales', 'Estrategia Digital', 'Contenido']
    }
};

// Handle alternative slugs/aliases for robustness
const SLUG_ALIASES = {
    'chironi': 'federicochironi',
    'federico-chironi': 'federicochironi',
    'juan': 'federicojuan',
    'federico-juan': 'federicojuan'
};

export default function FerdersCard() {
    const { slug } = useParams();
    
    // Normalize slug
    const normalizedSlug = slug ? slug.toLowerCase().replace(/\s+/g, '') : '';
    const resolvedSlug = SLUG_ALIASES[normalizedSlug] || normalizedSlug;
    
    const data = CARD_DATA[resolvedSlug];

    if (!data) {
        return (
            <div className="card-error-container">
                <div className="error-card">
                    <h2>Tarjeta no encontrada</h2>
                    <p>La tarjeta digital solicitada no existe o el enlace es incorrecto.</p>
                    <Link to="/" className="back-home-btn">Ir al Inicio</Link>
                </div>
            </div>
        );
    }

    // Function to generate and download the vCard (.vcf)
    const handleDownloadVCard = () => {
        const vCardData = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${data.name}`,
            `N:${data.name.split(' ').reverse().join(';')};;;`,
            `ORG:${data.company}`,
            `TITLE:${data.role}`,
            `TEL;TYPE=CELL,VOICE:${data.phone}`,
            `EMAIL;TYPE=PREF,INTERNET:${data.email}`,
            `URL:${data.website}`,
            'REV:' + new Date().toISOString(),
            'END:VCARD'
        ].join('\r\n');

        const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${data.name.replace(/\s+/g, '_')}_contacto.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="ferders-card-page">
            {/* Ambient Background Lights */}
            <div className="ambient-glow glow-1"></div>
            <div className="ambient-glow glow-2"></div>

            <motion.div 
                className="profile-card-container"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                {/* Main Glass Card */}
                <div className="glass-card-body">
                    {/* Header Sparkle Icon */}
                    <div className="card-sparkle">
                        <Sparkles className="sparkle-icon" />
                    </div>

                    {/* Profile Image & Badge */}
                    <div className="profile-image-wrapper">
                        <div className="image-border-gradient">
                            <img src={data.photo} alt={data.name} className="profile-image" style={{ objectPosition: data.photoPosition }} />
                        </div>
                        <span className="profile-company-badge">{data.company}</span>
                    </div>

                    {/* Profile Header Info */}
                    <div className="profile-header-info">
                        <h1 className="profile-name-metallic">{data.name}</h1>
                        <p className="profile-role">{data.role}</p>
                    </div>

                    {/* Bio Section */}
                    <p className="profile-bio">{data.bio}</p>


                    {/* Primary Call to Action: Agendame */}
                    <motion.button 
                        className="btn-primary-agendame"
                        onClick={handleDownloadVCard}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Download className="btn-icon" />
                        <span>AGENDAME</span>
                    </motion.button>

                    {/* Contact details list */}
                    <div className="contact-details-list">
                        <a href={`tel:${data.phone}`} className="detail-item">
                            <span className="icon-wrapper">
                                <Phone className="detail-icon" />
                            </span>
                            <div className="detail-text">
                                <span className="detail-label">Llamar</span>
                                <span className="detail-value">{data.phoneDisplay}</span>
                            </div>
                        </a>

                        <a href={`mailto:${data.email}`} className="detail-item">
                            <span className="icon-wrapper">
                                <Mail className="detail-icon" />
                            </span>
                            <div className="detail-text">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{data.email}</span>
                            </div>
                        </a>

                        <a href={data.website} target="_blank" rel="noopener noreferrer" className="detail-item">
                            <span className="icon-wrapper">
                                <Globe className="detail-icon" />
                            </span>
                            <div className="detail-text">
                                <span className="detail-label">Sitio Web</span>
                                <span className="detail-value">www.fedes.ai</span>
                            </div>
                        </a>
                    </div>

                    {/* Social networks & instant messengers grid */}
                    <div className="social-links-grid">
                        <motion.a 
                            href={data.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-btn linkedin"
                            whileHover={{ y: -3 }}
                            title="LinkedIn"
                        >
                            <Linkedin />
                        </motion.a>

                        <motion.a 
                            href={data.whatsapp} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-btn whatsapp"
                            whileHover={{ y: -3 }}
                            title="WhatsApp"
                        >
                            <Send className="whatsapp-icon-rotate" />
                        </motion.a>
                    </div>
                </div>

                {/* Footer Brand Logo */}
                <div className="card-footer-brand">
                    <Link to="/" className="brand-logo-link">
                        <span className="brand-fedes">FEDES</span>
                        <span className="brand-dot">.</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
