import React from 'react';
import SectionPill from '../../ui/SectionPill';
import './Agencia.scss';

const Agencia = () => {
    return (
        <section id="agencia" className="agencia-section">
            <div className="container">
                <SectionPill text="Agencia" />
                <h2><span className="dark">DESPUÉS,</span> <span className="blue">LA ACCIÓN.</span></h2>
                <p>Transformamos esa estrategia en activos digitales que venden. Somos el brazo ejecutor que tu marca necesita.</p>
            </div>
        </section>
    );
};

export default Agencia;
