// src/pages/BlogPages/GrowthMarketing.jsx
import {
    FaRocket, FaLightbulb, FaFlask, FaChartLine, FaUsers, FaHandshake
} from 'react-icons/fa';
import ArticleLayout from '../../components/layout/ArticleLayout';

/* —— Texto intacto, solo separado en bloques —— */
const bloques = [
    {
        id: 'tit-growth',
        span: 3,
        destacado: true,
        icono: <FaRocket />,
        texto: `Growth marketing: cuando crecer deja de ser promesa y se vuelve método`
    },

    {
        id: 'contexto',
        span: 3,
        dobleCol: true,
        icono: <FaLightbulb />,
        texto: `El marketing tradicional habla de campañas, de branding, de alcance. Pero, ¿qué pasa cuando eso no alcanza para crecer?<br/><br/>El growth marketing aparece como una manera de trabajar que combina lo creativo con lo analítico, lo rápido con lo estratégico. Es dejar de hacer por costumbre y empezar a hacer con intención.`
    },

    {
        id: 'mentalidad-tit',
        span: 3,
        destacado: true,
        icono: <FaFlask />,
        texto: `No es moda, es mentalidad`
    },

    {
        id: 'mentalidad',
        span: 3,
        icono: <FaFlask />,
        texto: `El growth no es un nuevo nombre para lo de siempre. Es pensar en hipótesis, probar, medir y volver a probar.<br/>Es transformar cada acción en un aprendizaje y cada aprendizaje en un paso hacia adelante.`
    },

    {
        id: 'por-que-tit',
        span: 3,
        destacado: true,
        icono: <FaChartLine />,
        texto: `Por qué funciona`
    },

    {
        id: 'por-que-lista',
        span: 3,
        icono: <FaChartLine />,
        texto: `Porque mide lo que importa (y descarta el ruido).<br/>Porque se adapta en el camino, en lugar de esperar meses para reaccionar.<br/>Porque multiplica lo que sí funciona.<br/>Porque entiende al cliente, no como un número, sino como el centro del proceso.`
    },

    {
        id: 'experiencia-tit',
        span: 3,
        destacado: true,
        icono: <FaUsers />,
        texto: `Una experiencia que lo dice todo`
    },

    {
        id: 'experiencia',
        span: 3,
        dobleCol: true,
        icono: <FaUsers />,
        texto: `Cuando aplicamos growth en proyectos reales, el resultado no es un gráfico lindo: son ventas que crecen con el mismo presupuesto, leads que dejan de ser “fríos” y se convierten en relaciones, marcas que dejan de improvisar y empiezan a decidir con datos.`
    },

    {
        id: 'cierre',
        span: 3,
        icono: <FaHandshake />,
        texto: `En Fedes, lo trabajamos como lo que es: una brújula que convierte la creatividad en crecimiento real.<br/><br/>Si querés explorar cómo aplicarlo a tu negocio, escribinos.`
    }
];

export default function GrowthMarketing() {
    return (
        <ArticleLayout
            id={24}
            blocks={bloques}
            accent="#FF7A00"  // acento naranja
        />
    );
}
