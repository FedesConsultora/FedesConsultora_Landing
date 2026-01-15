import React from 'react';
import './Footer.scss';
import FedesLogo from '../../../assets/img/FedesLogo.webp'

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="container">
                <div className="footer-bottom">
                    <div className="footer-logo">
                        <img src={FedesLogo} alt="Fedes Consultora Logo" />
                    </div>
                    <span> <p>Política de Privacidad | Términos y Condiciones</p></span>
                    <p>&copy; {new Date().getFullYear()} {""}
                        | FEDES Consultora - Todos los derechos reservados</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
