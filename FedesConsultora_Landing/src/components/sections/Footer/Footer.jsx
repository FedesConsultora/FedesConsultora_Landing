import React from 'react';
import './Footer.scss';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="container">
                <p>&copy; {new Date().getFullYear()} FedesConsultora. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
