// src/pages/BlogPages/ViajeroEternidad.js
import React from 'react';
import {
    FaBookOpen, FaQuoteLeft, FaMapMarkedAlt,
    FaUsers, FaSyncAlt, FaSnowflake
} from 'react-icons/fa';
import ArticleLayout from '../../components/layout/ArticleLayout';

const blocks = [
    {
        id: 'a',
        span: 2,
        icono: <FaBookOpen />,
        texto: `Leí El Eternauta por primera vez a los 16 años, cuando estaba en la escuela secundaria, durante todo un fin de semana. Recuerdo con nitidez que me sentí consumida por el placer íntimo de la lectura silenciosa. Lo que no imaginé fue que ese mundo creado con improvisación, nieve y comunidad volvería a mí más de una década después.

En estos días, vivo el privilegio de mirar la historia con otros ojos. Ya no como estudiante, sino como docente de Letras y como parte de una empresa que trabaja todos los días con una idea que no se declama, se practica.`
    },
    {
        id: 'b',
        span: 1,
        destacado: true,
        icono: <FaQuoteLeft />,
        texto: `Nadie se salva solo.`
    },
    {
        id: 'c',
        span: 3,
        dobleCol: true,
        icono: <FaMapMarkedAlt />,
        texto: `Lo que antes era consigna, hoy es urgencia. El Eternauta es, en muchos sentidos, un mapa emocional de lo que significa sobrevivir, e incluso vivir, con otros. Eso, inevitablemente, también nos habla del trabajo. Más allá de procesos, métricas o entregables, lo que sostiene a un equipo no siempre se ve y son la confianza, la escucha, la presencia.
En Fedes lo vivimos cada día. No hay estructura que funcione sin lo más elemental: cuidarnos, acompañarnos, complementarnos. Cada proyecto es una forma de resistencia frente a lo incierto. Lo resolvemos con lo que tenemos. A veces improvisando, como el Tano con una radio vieja, pero siempre en equipo.
No brindamos sólo servicios: construimos vínculos sostenibles. Elegimos la cooperación incluso cuando lo fácil sería competir.`
    },
    {
        id: 'd',
        span: 1,
        destacado: true,
        icono: <FaSyncAlt />,
        texto: `Nadie lidera todo el tiempo. Nadie acompaña siempre.`
    },
    {
        id: 'e',
        span: 1,
        icono: <FaUsers />,
        texto: `Nos vamos turnando. Como en la historia de Oesterheld, como en las relaciones humanas, como en la vida. Y cuando las nevadas invisibles caen (el desgaste, el miedo, la incertidumbre), la única forma de resistir es abrigándonos entre todos.`
    },
    {
        id: 'f',
        span: 1,
        destacado: true,
        icono: <FaSnowflake />,
        texto: `Con lo que tenemos.
Con lo que somos.
Con lo que elegimos ser.`
    }
];

export default function ViajeroEternidad() {
    return (
        <ArticleLayout
            id={17}
            blocks={blocks}
            accent="#795cbb"
        />
    );
}
