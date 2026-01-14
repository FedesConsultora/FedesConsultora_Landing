import React from 'react';
import Consultora from '../../components/sections/Consultora/Consultora';
import Agencia from '../../components/sections/Agencia/Agencia';
import Nosotros from '../../components/sections/Nosotros/Nosotros';
import Blog from '../../components/sections/Blog/Blog';
import Divider from '../../components/ui/Divider';

const LandingPage = () => {
    return (
        <main>
            <Consultora />
            <Divider variant="blue" />
            <Divider variant="dark" />
            <Agencia />
            <Nosotros />
            <Blog />
        </main>
    );
};

export default LandingPage;
