// src/pages/BlogPages/ServiciosFedes.js
import React from 'react';
import {
    FaBullseye, FaChartLine, FaLightbulb,
    FaPenFancy, FaBullhorn, FaLayerGroup
} from 'react-icons/fa';
import ArticleLayout from '../../components/layout/ArticleLayout';

const blocks = [
    {
        id: 'intro',
        span: 3,
        icono: <FaBullseye />,
        texto: `Sabemos que el marketing no es publicar por publicar. Es pensar antes de hacer. 
Es planear con inteligencia, ejecutar con sensibilidad y medir con precisión. 
Por eso, cada uno de nuestros servicios parte de una estrategia clara, trabajada en conjunto 
con nuestros clientes, alineada a sus objetivos reales de negocio.`
    },
    {
        id: 'estrategia',
        span: 3,
        icono: <FaBullseye />,
        titulo: 'Estrategia antes que acción',
        texto: `El marketing no es publicar por publicar. Pensamos antes de hacer: 
planeamos con inteligencia, ejecutamos con sensibilidad y medimos con precisión. 
Cada servicio nace de una estrategia clara trabajada codo a codo con vos y alineada 
con tus objetivos reales de negocio.`
    },
    {
        id: 'posicionamiento',
        span: 3,
        icono: <FaChartLine />,
        titulo: 'Posicionamiento digital que trasciende',
        texto: `Diseñamos sitios web, blogs y landings que no sólo informan, sino que persuaden. 
Creamos y renovamos marcas con estrategia, no sólo con diseño, y desarrollamos manuales 
que unifican criterios para cada punto de contacto.`
    },
    {
        id: 'publicidad',
        span: 3,
        icono: <FaBullhorn />,
        titulo: 'Publicidad con foco en resultados',
        texto: `Meta Ads, Google Ads, segmentación inteligente, optimización continua. 
Nada de promesas vacías: planificación, seguimiento y mejora constante. 
Cada peso invertido tiene que tener sentido. Cada mensaje, un objetivo.`
    },
    {
        id: 'consultoria',
        span: 3,
        icono: <FaLightbulb />,
        titulo: 'Consultoría estratégica',
        texto: `Desde análisis de competencia hasta definición de KPIs. 
Nos involucramos para que cada decisión esté respaldada por información, 
intuición y experiencia. Nada se improvisa, todo se conecta.`
    },
    {
        id: 'contenido',
        span: 3,
        icono: <FaPenFancy />,
        titulo: 'Contenido que se siente',
        texto: `Creamos textos, imágenes, campañas, producciones audiovisuales, newsletters 
y piezas que no sólo se ven: se sienten. El contenido con propósito construye relaciones duraderas.`
    },
    {
        id: 'ecosistema',
        span: 3,
        icono: <FaLayerGroup />,
        titulo: 'Ecosistema digital integrado',
        texto: `Redes sociales, mailings, canales de atención, eventos en vivo, salas de streaming, comunidad. 
No se trata de sumar canales, sino de integrarlos con coherencia para darle a tu marca 
presencia real, voz clara y acción efectiva.`
    },
    {
        id: 'cierre',
        span: 3,
        destacado: true,
        icono: <FaChartLine />,
        texto: `En resumen: no hacemos marketing para estar. Hacemos marketing para transformar. 
Y si estás leyendo esto, es porque sentís que tu marca tiene más para dar. 

Hablemos. En Fedes, estamos siempre listos para construir con vos.`
    }
];

export default function ServiciosFedes() {
    return (
        <ArticleLayout
            id={16}
            blocks={blocks}
            accent="#7c81ad"
        />
    );
}
