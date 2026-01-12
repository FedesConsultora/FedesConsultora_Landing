import React from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';

const Header = () => {
  const navItems = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Consultora', href: '#consultora' },
    { name: 'Agencia', href: '#agencia' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Blog', href: '#blog' },
  ];

  return (
    <div className="header-container">
      <Link to="/" className="logo">
        Fedes Consultora
      </Link>
      <header className="site-header">
        <nav>
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.name}>
                <a href={item.href}>{item.name}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <a href="#contacto" className="btn-appointment">
        Agendar una reunión
      </a>
    </div>
  );
};

export default Header;
