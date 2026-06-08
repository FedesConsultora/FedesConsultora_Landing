// src/pages/BlogPages/SEOECommerce.jsx
import {
    FaSearchDollar, FaChartLine, FaBullseye,
    FaListAlt, FaHandshake
} from 'react-icons/fa';
import ArticleLayout from '../../components/layout/ArticleLayout';

/* —— Texto intacto, sólo maquetado en bloques —— */
const bloques = [
    {
        id: 'intro',
        span: 3,
        icono: <FaSearchDollar />,
        texto: `¿Querés que tu e-commerce aparezca cuando tus clientes ideales te busquen?`
    },
    {
        id: 'no-opcional',
        span: 3,
        icono: <FaChartLine />,
        texto: `El SEO ya no es opcional: es la diferencia entre las marcas que existen en Google y las que se pierden en medio del caos.`
    },
    {
        id: 'intencion-busqueda',
        span: 3,
        dobleCol: true,
        icono: <FaBullseye />,
        texto: `Podés invertir en redes, en campañas y en promociones, pero si no aparecés cuando alguien busca exactamente lo que vendés, estás perdiendo ventas todos los días. Se trata de entender cómo buscan tus clientes y diseñar una estrategia que conecte con esa intención de búsqueda real.`
    },

    /* Título de la sección (destacado breve) */
    {
        id: 'tit-estrategia-medida',
        span: 3,
        destacado: true,
        icono: <FaListAlt />,
        texto: `¿Qué significa una estrategia de SEO a medida?`
    },

    /* Lista (mismo texto, en un solo párrafo para no forzar “blockTitle”) */
    {
        id: 'seo-medida-items',
        span: 3,
        icono: <FaListAlt />,
        texto: `Auditoría de tu sitio. Análisis de mercado. Plan de contenidos inteligente. SEO local. Monitoreo constante.`
    },

    /* Beneficios con título interno (aprovecha blockTitle) */
    {
        id: 'beneficios',
        span: 3,
        icono: <FaChartLine />,
        texto: `Lo que ganás con un SEO bien hecho
Llegar a quienes ya tienen intención de compra.
Aumentar la visibilidad de tu marca sin depender 100% de la pauta paga.
Construir relevancia y confianza a largo plazo.`
    },

    /* Cierre */
    {
        id: 'cierre',
        span: 3,
        icono: <FaHandshake />,
        texto: `En Fedes, no hacemos SEO por moda: lo hacemos porque sabemos que es una de las formas más efectivas de crecer en digital con coherencia y estrategia.`
    }
];

export default function SEOECommerce() {
    return (
        <ArticleLayout
            id={23}
            blocks={bloques}
            accent="#22C55E"
        />
    );
}
