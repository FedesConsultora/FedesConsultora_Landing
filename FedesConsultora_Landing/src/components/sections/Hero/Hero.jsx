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
          <motion.div
            className="hero-degr degr-1"
            animate={{
              // Patrón asimétrico para evitar sensación de repetición circular
              x: [0, 70, -40, 90, -20, 50, 0],
              y: [0, -50, 30, -70, 40, -20, 0],
              rotate: [0, 5, -3, 6, -4, 2, 0],
            }}
            transition={{
              duration: 23, // Número primo para desincronizar capas
              ease: "easeInOut",
              repeat: Infinity,
              times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1] // Distribución de tiempos irregular
            }}
            style={{ willChange: 'transform', z: 0 }}
          >
            <motion.img
              src={Degr4}
              alt=""
              style={{
                scale: 1.1,
                filter: 'blur(2px)',
              }}
            />
          </motion.div>

          {/* Layer 2: Independent Float (Organic) */}
          <motion.div
            className="hero-degr degr-2"
            animate={{
              // Patrón opuesto y con diferentes amplitudes
              x: [0, -100, 60, -80, 40, -30, 0],
              y: [0, 40, -60, 20, -50, 30, 0],
              rotate: [0, -6, 4, -5, 3, -2, 0],
            }}
            transition={{
              duration: 31, // Otro número primo para romper simetría
              ease: "easeInOut",
              repeat: Infinity,
              times: [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1]
            }}
            style={{ willChange: 'transform', z: 0 }}
          >
            <motion.img
              src={Degr3}
              alt=""
              style={{
                scale: 1.25,
                filter: 'blur(1px)',
              }}
            />
          </motion.div>

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

      <section>
        <Hero2 />
      </section>
    </>
  );
};

export default Hero;
