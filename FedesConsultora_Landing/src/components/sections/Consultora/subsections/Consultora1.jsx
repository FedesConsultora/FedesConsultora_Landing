import React, { useState } from 'react';
import './Consultora1.scss';

const Consultora1 = () => {
    const successCases = [
        {
            id: 1,
            tag: "Ganador del premio mercurio 2024",
            client: "KronenVet",
            stat: "+40%",
            result: "Rentabilidad neta en 6 meses.",
            imageUrl: "" // Temporary placeholder
        }
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section className="consultora-cases-block">
            <div className="container">
                <h2 className="cases-title">Casos de éxito</h2>

                <div className="cases-slider-main">
                    <button className="slider-nav prev" aria-label="Anterior">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>

                    <div className="case-card">
                        <div className="case-image-container">
                            <div className="case-image-ratio">
                                <div className="case-image" style={{ backgroundImage: `url(${successCases[activeIndex].imageUrl})` }}>
                                    <div className="play-overlay">
                                        <div className="play-button"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="case-details">
                            <span className="case-label">{successCases[activeIndex].tag}</span>
                            <h3 className="case-client">{successCases[activeIndex].client}</h3>
                            <div className="case-stat">{successCases[activeIndex].stat}</div>
                            <p className="case-result">{successCases[activeIndex].result}</p>

                            <div className="case-action">
                                <a href="/galeria" className="btn-view-gallery">Ver más casos en la galería</a>
                            </div>
                        </div>
                    </div>

                    <button className="slider-nav next" aria-label="Siguiente">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Consultora1;