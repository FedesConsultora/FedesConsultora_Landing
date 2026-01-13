import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.scss';
import FedesLogo from '../../assets/img/FedesLogo.webp'

const Header = () => {
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Consultora', path: '/consultora' },
    { name: 'Agencia', path: '/agencia' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <div className="header-container">
      <Link to="/" className="logo">
        <img src={FedesLogo} alt="Fedes Consultora Logo" />
      </Link>
      <header className="site-header">
        <nav>
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <Link to="/contacto" className="btn-appointment">
        Contactanos
      </Link>
    </div>
  );
};

export default Header;
