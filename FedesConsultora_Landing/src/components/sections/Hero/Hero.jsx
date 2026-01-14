import React from 'react';
import heroVideo from '../../../assets/renders/3d-render-2025-12-09-06-19-10-utc.mov';
import './Hero.scss';

const Hero = () => {
  return (
    <section id="inicio" className="hero-section">
      <video
        className="hero-render"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={heroVideo} type="video/quicktime" />
        <source src={heroVideo} type="video/mp4" />
      </video>

      <div className="container">
        <h1 className='hero-title'>DESBLOQUEA <br />EL POTENCIAL <br /> DE TU EMPRESA</h1>
        <p className='hero-subtitle'>Impulsamos el éxito sostenible de tu negocio con publicidad innovadora, estrategias de posicionamiento <br />
          y consultoría experta para aumentar tu facturación y consolidar tu posición como lider del mercado</p>
      </div>
    </section>
  );
};

export default Hero;
