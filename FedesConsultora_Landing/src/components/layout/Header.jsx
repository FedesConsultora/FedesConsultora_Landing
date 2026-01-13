import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.scss';

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
        Fedes Consultora
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
        Agendar una reunión
      </Link>
    </div>
  );
};

export default Header;
