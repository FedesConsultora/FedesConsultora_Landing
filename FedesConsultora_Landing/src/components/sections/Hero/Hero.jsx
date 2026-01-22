import React from 'react';
import Hero1 from './subsections/Hero1';
import Hero2 from './subsections/Hero2';
import Degr4 from '../../../assets/img/backgrounds/inicio-degr (4).svg';
import Degr3 from '../../../assets/img/backgrounds/inicio-degr (1).svg';
import './Hero.scss';

const Hero = () => {
  return (
    <>
      <section id="inicio" className="hero-section">
        <div className="hero-background">
          <img src={Degr4} className="hero-degr degr-1" alt="" />
          <img src={Degr3} className="hero-degr degr-2" alt="" />
          <div className="grid-overlay"></div>
        </div>

        <div className="container">
          <h1 className='hero-title'>¿Orden o <br />Clientes?</h1>
          <p className='hero-subtitle'>En Fedes atacamos las dos <br />únicas razones por las que <br /> tu negocio no escala.</p>
        </div>

        <div className="hero-floating-icon">
          <div className="circular-text">
            <svg viewBox="0 0 100 100">
              <path d="M 10,50 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" id="circle" fill="transparent" />
              <text fill="#19222B">
                <textPath xlinkHref="#circle">
                  FEDES LO HACE POSIBLE • FEDES LO HACE POSIBLE •
                </textPath>
              </text>
            </svg>
          </div>
          <div className="inner-circle"></div>
        </div>
      </section>

      <section>
        <Hero1 />
      </section>

      {/* <section>
        <Hero2 />
      </section> */}
    </>
  );
};

export default Hero;
