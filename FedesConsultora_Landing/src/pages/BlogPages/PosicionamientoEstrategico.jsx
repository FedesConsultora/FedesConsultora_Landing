// src/pages/BlogPages/PosicionamientoEstrategico.jsx
import React from 'react';
import ArticleLayout from '../../components/layout/ArticleLayout';
import {
    FaBullhorn, FaMapMarkedAlt, FaTasks, FaPuzzlePiece,
    FaQuestionCircle, FaSearch, FaFingerprint, FaProjectDiagram
} from 'react-icons/fa';

const bloques = [
    {
        id: 'ruido',
        span: 3,
        icono: <FaBullhorn />,
        texto: `Hoy tu empresa no compite solamente con otras marcas: compite con el ruido. Publicar contenido, tener presencia online o contar con seguidores ya no garantiza resultados reales. El desafío es otro: lograr que alguien frene en medio de ese ruido para prestarte atención genuina.`
    },
    {
        id: 'sentido',
        span: 3,
        icono: <FaMapMarkedAlt />,
        texto: `En Fedes, no hacemos posicionamiento por moda ni por algoritmo. Lo hacemos porque sabemos que una marca relevante es mucho más que visibilidad: es diferenciación real, que se sostiene con estrategia y sentido.`
    },
    {
        id: 'sin-direccion',
        span: 3,
        dobleCol: true,
        icono: <FaTasks />,
        texto: `Muchas empresas vienen con la misma inquietud: “hacemos de todo y no pasa nada”. Tienen buenas intenciones, pero no tienen una dirección clara. En la práctica, esto se traduce en esfuerzos dispersos que terminan diluyendo su identidad. Para estas marcas, el problema no es la falta de acciones, sino la ausencia de un plan que ordene esas acciones alrededor de objetivos claros de negocio.`
    },
    {
        id: 'integracion',
        span: 3,
        icono: <FaPuzzlePiece />,
        texto: `Nosotros lo vemos así: un posicionamiento sólido no es la suma de acciones aisladas, sino la integración estratégica de todas las decisiones que tomás como marca.`
    },
    {
        id: 'como',
        span: 3,
        destacado: true,
        icono: <FaQuestionCircle />,
        texto: `¿Cómo lo hacemos?`
    },
    {
        id: 'paso1',
        span: 1,
        paso: 1,
        icono: <FaSearch />,
        texto: `Primero, frenamos y analizamos. Llevamos adelante una auditoría realista y honesta sobre dónde estás parado hoy, quién es tu competencia y cómo te estás diferenciando. Porque si no sabés dónde empezás, difícilmente puedas llegar adonde querés.`
    },
    {
        id: 'paso2',
        span: 1,
        paso: 2,
        icono: <FaFingerprint />,
        texto: `En segundo lugar, definimos lo que te hace distinto. Y esto no se improvisa ni se copia: se construye a partir de tu identidad real y única. La relevancia se logra cuando comunicás con coherencia lo que sos, lo que creés y lo que ofrecés.`
    },
    {
        id: 'paso3',
        span: 1,
        paso: 3,
        icono: <FaProjectDiagram />,
        texto: `Por último, diseñamos un plan estratégico que no piensa sólo en el mes siguiente, sino en los próximos años. Si el posicionamiento es real, no cambia con cada tendencia. Evoluciona, pero no pierde el foco.`
    }
];

export default function PosicionamientoEstrategico() {
    return (
        <ArticleLayout
            id={21}
            blocks={bloques}
            accent="#181d3b"
        />
    );
}
