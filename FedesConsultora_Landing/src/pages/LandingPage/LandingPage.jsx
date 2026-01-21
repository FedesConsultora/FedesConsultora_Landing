import React from 'react';
import Hero from '../../components/sections/Hero/Hero';
import Agencia from '../../components/sections/Agencia/Agencia';
import Nosotros from '../../components/sections/Nosotros/Nosotros';
import Blog from '../../components/sections/Blog/Blog';
import Galeria from '../../components/sections/Galeria/Galeria';
import Contacto from '../../components/sections/Contacto/Contacto';
import Divider from '../../components/ui/Divider';

const LandingPage = () => {
    return (
        <main>
            <Hero />
            <Divider variant="blue" />
            <Divider variant="dark" />
            <Agencia />
            <Galeria />
            <Nosotros />
            <Blog />
        </main>
    );
};

export default LandingPage;
