import React from 'react';
import './Hero2.scss';

const Hero2 = () => {
    return (
        <div className="hero-2-container">
            <div className="hero-2-content">
                <h2>Contanos qué te está pasando</h2>
                <p className="bottom-desc">Elegí la frase que más se repite en tu cabeza esta semana:</p>

                <div className="cure-options">
                    <div className="cure-pill">
                        Vendemos mucho, pero a fin de mes no queda plata en la caja
                    </div>
                    <div className="cure-pill">
                        Tengo un producto increíble, pero nadie lo conoce
                    </div>
                    <div className="cure-pill">
                        Estoy agotado: hago de gerente, vendedor y creativo al mismo tiempo
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero2
