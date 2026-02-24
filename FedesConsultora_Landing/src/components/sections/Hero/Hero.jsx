import React from 'react';
import Hero1 from './subsections/Hero1';
import Hero2 from './subsections/Hero2';
import Consultora1 from '../Consultora/subsections/Consultora1';
import Degr4 from '../../../assets/img/backgrounds/inicio-degr (4).svg';
import Degr3 from '../../../assets/img/backgrounds/inicio-degr (1).svg';
import DegrHero2Left from '../../../assets/img/backgrounds/inicio-degr (3).svg'
import DegrHero2Right from '../../../assets/img/backgrounds/inicio-degr (2).svg'
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
            <span className="hero-title-light">¿Estás <br /> buscando</span> <br /> <span className="hero-title-bold">orden o clientes?</span>
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
      </section>

      <section>
        <Hero1 />
      </section>

      <section className="hero-bottom-combined">
        <Hero2 />
        <Consultora1 />

        {/* Background Ornaments Shared */}
        <img src={DegrHero2Left} className="hero-2-degr degr-left" alt="" />
        <img src={DegrHero2Right} className="hero-2-degr degr-right" alt="" />
      </section>
    </>
  );
};

export default Hero;
