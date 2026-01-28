import React from 'react';
import Hero1 from './subsections/Hero1';
import Hero2 from './subsections/Hero2';
import Degr4 from '../../../assets/img/backgrounds/inicio-degr (4).svg';
import Degr3 from '../../../assets/img/backgrounds/inicio-degr (1).svg';
import './Hero.scss';
import { motion } from 'framer-motion';

const Hero = () => {
  const dropVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] }
    }
  };

  return (
    <>
      <section
        id="inicio"
        className="hero-section"
      >
        <div className="hero-background">
          {/* Layer 1: Independent Float (Organic) */}
          <div className="hero-degr degr-1">
            <img
              src={Degr4}
              alt=""
              style={{ filter: 'blur(3px)' }}
            />
          </div>

          {/* Layer 2: Independent Float (Organic) */}
          <div className="hero-degr degr-2">
            <img
              src={Degr3}
              alt=""
              style={{ filter: 'blur(2px)' }}
            />
          </div>

          <div className="grid-overlay"></div>
        </div>

        <div className="container">
          <motion.h1
            className='hero-title'
            variants={dropVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            ¿Orden o <br />clientes?
          </motion.h1>
          <motion.p
            className='hero-subtitle'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Trabajamos sobre las dos razones reales <br /> por las que un negocio no escala.
          </motion.p>
        </div>

        <div className="hero-floating-icon">
          <div className="circular-text">
            <svg viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              <path d="M 10,50 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" id="circle" fill="transparent" />
              <text fill="#19222B" fontSize="11" fontWeight="900">
                <textPath xlinkHref="#circle" startOffset="0%">
                  FEDES LO HACE POSIBLE
                </textPath>
              </text>

              {/* Rocket 1 */}
              <g className="rocket-icon rocket-1" fill="#19222B">
                <path d="M0-100c10 20 30 60 30 120 0 15-5 30-10 40H-20c-5-10-10-25-10-40 0-60 20-100 30-120z" />
                <path d="M-30 20l-30 40h30V20zM30 20l30 40h-30V20z" />
                <circle cx="0" cy="-20" r="8" fill="white" opacity="0.8" />
              </g>

              {/* Rocket 2 */}
              <g className="rocket-icon rocket-2" fill="#19222B">
                <path d="M0-100c10 20 30 60 30 120 0 15-5 30-10 40H-20c-5-10-10-25-10-40 0-60 20-100 30-120z" />
                <path d="M-30 20l-30 40h30V20zM30 20l30 40h-30V20z" />
                <circle cx="0" cy="-20" r="8" fill="white" opacity="0.8" />
              </g>

              {/* Rocket 3 */}
              <g className="rocket-icon rocket-3" fill="#19222B">
                <path d="M0-100c10 20 30 60 30 120 0 15-5 30-10 40H-20c-5-10-10-25-10-40 0-60 20-100 30-120z" />
                <path d="M-30 20l-30 40h30V20zM30 20l30 40h-30V20z" />
                <circle cx="0" cy="-20" r="8" fill="white" opacity="0.8" />
              </g>
            </svg>
          </div>
          <div className="bot-trigger">
            <svg viewBox="0 0 100 100" className="cohere-icon">
              <path
                d="M50 15c-19.3 0-35 15.7-35 35s15.7 35 35 35 35-15.7 35-35-15.7-35-35-35zm0 64c-16 0-29-13-29-29s13-29 29-29 29 13 29 29-13 29-29 29z"
                fill="currentColor"
              />
              <path
                d="M50 30c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 34c-7.7 0-14-6.3-14-14s6.3-14 14-14 14 6.3 14 14-6.3 14-14 14z"
                fill="currentColor"
              />
              <path
                d="M50 40c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </section>

      <section>
        <Hero1 />
      </section>

      <section>
        <Hero2 />
      </section>
    </>
  );
};

export default Hero;
