import './Hero1.scss'
const Hero1 = () => {
    return (
        <div className='hero-1-subsection'>
            <div className="hero-1-container">
                <div className="hero-1-top">
                    <h1>En <span className="fedes-text">FEDES</span> tenemos la solución.</h1>
                </div>

                <div className="hero-1-cards">
                    <div className="solution-card">
                        <div className="card-image-placeholder"></div>
                        <h3>¿Sientes que tu negocio te atrapa?</h3>
                        <p>Ventas desordenadas, rentabilidad baja, dependes de estar presente 24/7.</p>
                        <button className="solution-btn">Necesito orden</button>
                    </div>

                    <div className="solution-card">
                        <div className="card-image-placeholder"></div>
                        <h3>¿Sientes que el mercado te ignora?</h3>
                        <p>Marca anticuada, anuncios que no convierten, competencia ganando terreno.</p>
                        <button className="solution-btn">Necesito ventas</button>
                    </div>
                </div>

                <div className="hero-1-bottom">
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
        </div>
    )
}

export default Hero1