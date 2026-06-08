// src/pages/BlogPages/ManualMarca.js

import React from 'react';
import ArticleLayout from '../../components/layout/ArticleLayout';

const blocks = [
    {
        id: 'intro',
        span: 3,
        icono: '🚀',
        texto: `Manual de Marca\nUn documento vivo, más allá del diseño`
    },
    {
        id: 'introduccion',
        span: 3,
        icono: '🚀',
        texto: `Un manual de marca no es sólo un PDF con logos y paletas: es una herramienta estratégica que traduce la identidad de una organización en criterios claros para comunicar. Cuando está bien hecho, alinea equipos, potencia la coherencia y mejora la percepción externa.`
    },
    {
        id: 'porque_es_fundamental',
        span: 3,
        icono: '🚀',
        texto: `¿Por qué es fundamental?\nPorque permite que todos hablen el mismo idioma sin necesidad de improvisar. Porque ordena y profesionaliza. Porque ayuda a ser reconocibles y recordados, no solo visualmente, sino también en el tono, en los valores, en la actitud.`
    },
    {
        id: 'benefit-identity',
        span: 1,
        icono: '🚀',
        texto: `Refuerza la identidad y esencia de la organización`
    },
    {
        id: 'benefit-communication',
        span: 1,
        icono: '🚀',
        texto: `Ordena y unifica la comunicación externa e interna`
    },
    {
        id: 'benefit-value-proposal',
        span: 1,
        icono: '🚀',
        texto: `Mejora la propuesta de valor al hacerla más consistente`
    },
    {
        id: 'benefit-efficiency',
        span: 1,
        icono: '🚀',
        texto: `Aumenta la eficiencia y reduce el margen de error`
    },
    {
        id: 'impacto_intro',
        span: 3,
        icono: '✅',
        texto: `¿En qué impacta dentro de una organización?\nEl manual de marca impacta más allá del área de diseño: mejora la experiencia del cliente, optimiza procesos internos y potencia la reputación corporativa.`
    },
    {
        id: 'impact-marketing-sales',
        span: 1,
        icono: '✅',
        texto: `Optimiza el marketing y mejora las ventas`
    },
    {
        id: 'impact-employees',
        span: 1,
        icono: '✅',
        texto: `Fortalece el compromiso de los colaboradores`
    },
    {
        id: 'impact-internal-external',
        span: 1,
        icono: '✅',
        texto: `Unifica la comunicación interna y externa`
    },
    {
        id: 'impact-employer-branding',
        span: 1,
        icono: '✅',
        texto: `Mejora el employer branding y atrae talento`
    },
    {
        id: 'challenge',
        span: 3,
        dobleCol: true,
        icono: '🌍',
        texto: `Desafío 2025\nIntegrar a los colaboradores como protagonistas de la comunicación\nLas marcas más fuertes no se construyen con campañas publicitarias, sino con el compromiso de quienes las conforman. En palabras de Simon Sinek: "Las marcas no son lo que decimos que son; son lo que otros dicen sobre nosotros".\nPor eso, un manual de marca actualizado no sólo fortalece la imagen externa, sino que también es una brújula interna para que cada colaborador se convierta en parte activa de la narrativa de la empresa.\n¿Tu empresa tiene un manual de marca alineado a su visión? En Fedes Consultora ayudamos a compañías a desarrollar manuales que organizan su identidad visual, potencian su posicionamiento, fortalecen su reputación y los preparan para liderar su sector.\n📩 Si querés que tu marca no sólo se vea bien, sino que comunique con impacto, hablemos.`
    }
];

export default function ManualMarca() {
    return (
        <ArticleLayout
            id={1}
            blocks={blocks.map((block) => ({
                ...block,
                icono: <span role="img" aria-label="icon">{block.icono}</span>
            }))}
            accent="#709cbb"
        />
    );
}
