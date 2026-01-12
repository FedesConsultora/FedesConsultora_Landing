import React from 'react';
import Hero from '../../components/sections/Hero/Hero';
import Consultora from '../../components/sections/Consultora/Consultora';
import Agencia from '../../components/sections/Agencia/Agencia';
import Nosotros from '../../components/sections/Nosotros/Nosotros';
import Blog from '../../components/sections/Blog/Blog';
import Contacto from '../../components/sections/Contacto/Contacto';
import Footer from '../../components/sections/Footer/Footer';

const LandingPage = () => {
    return (
        <main>
            <Hero />
            <Consultora />
            <Agencia />
            <Nosotros />
            <Blog />
            <Contacto />
            <Footer />
        </main>
    );
};

export default LandingPage;
