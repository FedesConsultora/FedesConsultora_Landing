import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { RxHamburgerMenu, RxCross1 } from 'react-icons/rx';
import FedesLogo from '../../assets/img/FedesLogo.webp'
import './Header.scss';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();

  // Ref to track cumulative scroll up
  const scrollUpAmount = useRef(0);

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Consultora', path: '/consultora' },
    { name: 'Agencia', path: '/agencia' },
    { name: 'Galería', path: '/galeria' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Blog', path: '/blog' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Logic to hide header on scroll down and show on scroll up with a threshold
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const diff = latest - previous;

    if (diff > 0) {
      // Scrolling down
      scrollUpAmount.current = 0; // Reset up-scroll tracking
      if (latest > 150) {
        setIsHidden(true);
      }
    } else {
      // Scrolling up
      scrollUpAmount.current += Math.abs(diff);

      // Threshold: only show if we scroll up more than 200px OR we are at the very top
      if (scrollUpAmount.current > 200 || latest < 50) {
        setIsHidden(false);
      }
    }
  });

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsHidden(false);
    scrollUpAmount.current = 0;
  }, [location]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <motion.div
      className={`header-container ${isMenuOpen ? 'menu-open' : ''}`}
      variants={{
        visible: { y: 0 },
        hidden: { y: -100 },
      }}
      animate={isHidden && !isMenuOpen ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
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
                  end={item.path === '/'}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="header-actions">
        <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ19JF6L1eipDhqCCUQr1FpObl3R5w1WcsYH4wRPfnbOfUsCc2vz07la72glqvWmDA_Svg19CKBU?gv=true" target="_blank" rel="noopener noreferrer" className="btn-appointment">
          Hablemos
        </a>

        <button
          className="hamburger-icon-btn"
          onClick={toggleMenu}
          aria-label="Menu"
        >
          {isMenuOpen ? <RxCross1 size={30} /> : <RxHamburgerMenu size={30} />}
        </button>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <nav>
          <ul className="mobile-nav-links">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
            <li>
              <a
                href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ19JF6L1eipDhqCCUQr1FpObl3R5w1WcsYH4wRPfnbOfUsCc2vz07la72glqvWmDA_Svg19CKBU?gv=true"
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-btn-contact"
                onClick={() => setIsMenuOpen(false)}
              >
                Hablemos
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </motion.div>
  );
};

export default Header;
