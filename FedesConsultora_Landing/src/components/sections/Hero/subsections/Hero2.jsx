import React from 'react'
import DegrHero2Left from '../../../../assets/img/backgrounds/inicio-degr (3).svg'
import DegrHero2Right from '../../../../assets/img/backgrounds/inicio-degr (2).svg'
import './Hero2.scss'

const Hero2 = () => {
    return (
        <div className='hero-2-subsection'>
            <div className="hero-2-container">
                <div className="hero-2-content">
                    <h2>Dinos qué te duele y te diremos la cura</h2>
                    <p className="bottom-desc">Selecciona la frase que más repites en tu cabeza esta semana:</p>

                    <div className="cure-options">
                        <div className="cure-pill">
                            Vendemos mucho pero a fin de mes no queda plata en la caja
                        </div>
                        <div className="cure-pill">
                            Tengo un producto increíble pero nadie lo conoce
                        </div>
                        <div className="cure-pill">
                            Estoy quemado hago de gerente, vendedor y creativo a la vez
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Ornaments */}
            <img src={DegrHero2Left} className="hero-2-degr degr-left" alt="" />
            <img src={DegrHero2Right} className="hero-2-degr degr-right" alt="" />
        </div>
    )
}

export default Hero2