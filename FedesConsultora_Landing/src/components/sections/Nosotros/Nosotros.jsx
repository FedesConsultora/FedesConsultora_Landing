import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import SectionPill from '../../ui/SectionPill';
import ServiceCard from '../Agencia/ServiceCard';
import TeamChip from '../../ui/TeamChip';
import './Nosotros.scss';

// Import Leader Photos
import FJuanImg from '../../../assets/img/feders/fjuan.webp';
import FChironiImg from '../../../assets/img/feders/fchironi.webp';

// Import Team Photos
import MartinImg from '../../../assets/img/feders/Martin.webp';
import EnzoImg from '../../../assets/img/feders/pinotti-enzo_3.webp';
import BelenImg from '../../../assets/img/feders/bespilman.webp';
import RominaImg from '../../../assets/img/feders/ralbanesi.webp';
import JuanPImg from '../../../assets/img/feders/jperozo.webp';
import FlorImg from '../../../assets/img/feders/fmarchesotti.webp';
import MateoImg from '../../../assets/img/feders/mgermano.webp';
import MicaImg from '../../../assets/img/feders/mmartinez.webp';
import GonzaloImg from '../../../assets/img/feders/gcanibano.webp';

const Nosotros = () => {
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const x1Raw = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    const x2Raw = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

    const x1 = useSpring(x1Raw, { stiffness: 40, damping: 40, restDelta: 0.001 });
    const x2 = useSpring(x2Raw, { stiffness: 40, damping: 40, restDelta: 0.001 });

    const leaders = [
        { name: "Fede Juan", image: FJuanImg },
        { name: "Fede Chironi", image: FChironiImg }
    ];

    const teamRow1 = [
        { name: "Martín Spinelli", role: "COO", photo: MartinImg },
        { name: "Enzo Pinotti", role: "Analista de Sistemas", photo: EnzoImg },
        { name: "Belén L. Espilman", role: "Desarrolladora Web", photo: BelenImg },
        { name: "Romina Albanesi", role: "Responsable Editorial", photo: RominaImg },
        { name: "Juan Perozo", role: "Diseñador UX/UI", photo: JuanPImg },
        { name: "Flor Marchesotti", role: "Coordinadora de proyectos", photo: FlorImg },
    ];

    const teamRow2 = [
        { name: "Mateo Germano", role: "Editor de Contenido Audiovisual", photo: MateoImg },
        { name: "Matías Lazcano", role: "Editor de Proyectos", photo: null },
        { name: "Micaela Martinez", role: "Asesora Comercial", photo: MicaImg },
        { name: "Victoria Pellegrino", role: "Analista de Cuentas", photo: null },
        { name: "Gonzalo Cañibano", role: "Ejecutivo de Cuentas", photo: GonzaloImg },
    ];

    return (
        <section id="nosotros" className="nosotros-section" ref={containerRef}>
            <div className="container">
                <div className="nosotros-header">
                    <SectionPill text="Nosotros" />
                    <h2><span className="dark">DOS VISIONES,</span> <span className="blue">UN OBJETIVO.</span></h2>
                    <p>Juntos lideramos un equipo multidisciplinario listo para ser tu departamento externo de crecimiento.</p>
                </div>

                <div className="leaders-grid">
                    {leaders.map((leader, index) => (
                        <ServiceCard
                            key={index}
                            title={leader.name}
                            image={leader.image}
                            variant="pill"
                        />
                    ))}
                </div>
            </div>

            <div className="team-parallax-container">
                <div className="parallax-row">
                    <motion.div className="row-content" style={{ x: x1 }}>
                        {teamRow1.map((member, index) => (
                            <TeamChip
                                key={index}
                                name={member.name}
                                role={member.role}
                                photo={member.photo}
                            />
                        ))}
                    </motion.div>
                </div>
                <div className="parallax-row">
                    <motion.div className="row-content" style={{ x: x2 }}>
                        {teamRow2.map((member, index) => (
                            <TeamChip
                                key={index}
                                name={member.name}
                                role={member.role}
                                photo={member.photo}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Nosotros;
