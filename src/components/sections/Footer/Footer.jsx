import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';
import FedesLogo from '../../../assets/img/Logo.svg'

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="container">
                <div className="footer-bottom">
                    <div className="footer-logo">
                        <img src={FedesLogo} alt="Fedes Consultora Logo" />
                    </div>
                    <div className="footer-links">
                        <Link to="/privacidad">Política de Privacidad</Link>
                        <span className="separator">|</span>
                        <Link to="/terminos-y-condiciones">Términos y Condiciones</Link>
                    </div>
                    <p>&copy; {new Date().getFullYear()} {""}
                        | FEDES Consultora - Todos los derechos reservados</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
