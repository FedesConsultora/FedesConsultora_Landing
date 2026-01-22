import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContactForm from '../sections/Contacto/ContactForm';
import './HeaderContactDropdown.scss';

const HeaderContactDropdown = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="header-contact-dropdown"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.165, 0.84, 0.44, 1] }}
                >
                    <div className="dropdown-header">
                        <h3>Hablemos</h3>
                        <p>Contanos tu proyecto y nos pondremos en contacto con vos a la brevedad.</p>
                    </div>

                    <ContactForm title="ESCRIBINOS" showTitle={false} onSuccess={onClose} />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HeaderContactDropdown;
