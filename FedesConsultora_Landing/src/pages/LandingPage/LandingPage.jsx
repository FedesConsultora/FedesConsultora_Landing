import React from 'react';
import Consultora from '../../components/sections/Consultora/Consultora';
import Agencia from '../../components/sections/Agencia/Agencia';
import Nosotros from '../../components/sections/Nosotros/Nosotros';
import Blog from '../../components/sections/Blog/Blog';
import Contacto from '../../components/sections/Contacto/Contacto';

const LandingPage = () => {
    return (
        <main>
            <Consultora />
            <Agencia />
            <Nosotros />
            <Blog />
            <Contacto />
        </main>
    );
};

export default LandingPage;
