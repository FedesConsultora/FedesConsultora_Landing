import React from 'react';
import SectionPill from '../../ui/SectionPill';
import './Nosotros.scss';

const Nosotros = () => {
    return (
        <section id="nosotros" className="nosotros-section">
            <div className="container">
                <SectionPill text="Nosotros" />
                <h2><span className="dark">DOS VISIONES,</span> <span className="blue">UN OBJETIVO.</span></h2>
                <p>Juntos lideramos un equipo multidisciplinario listo para ser tu departamento externo de crecimiento.</p>
            </div>
        </section>
    );
};

export default Nosotros;
