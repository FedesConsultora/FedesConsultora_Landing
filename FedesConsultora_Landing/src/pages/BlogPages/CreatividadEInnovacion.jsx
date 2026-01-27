// src/pages/BlogPages/CreatividadEInnovacion.jsx
import React from 'react';
import {
    FaQuestionCircle,
    FaLightbulb,
    FaFlask,
    FaBullseye,
    FaExclamationTriangle
} from 'react-icons/fa';
import ArticleLayout from '../../components/layout/ArticleLayout';

const bloques = [
    {
        id: 'intro',
        span: 3,
        icono: <FaQuestionCircle />,
        texto: `¿Qué pasa entre pedir creatividad e innovación en un brief y conseguir resultados reales? ¿Cuándo esas palabras que tanto se repiten pierden sentido y dejan de significar algo?`
    },
    {
        id: 'creatividad',
        span: 3,
        dobleCol: true,
        icono: <FaLightbulb />,
        texto: `Creatividad
La creatividad no es sólo pensar distinto por el gusto de ser diferente ni llamar la atención por el ruido que genera. Es pensar mejor. Es encontrar soluciones valiosas para desafíos concretos, conectando con lo que realmente le importa a una audiencia específica. No aparece de repente: se trabaja, se nutre de observación, análisis y criterio. Una idea verdaderamente creativa no se reconoce por ser original, sino por ser relevante.`
    },
    {
        id: 'innovacion',
        span: 3,
        dobleCol: true,
        icono: <FaFlask />,
        texto: `Innovación
Con la innovación pasa algo parecido. Innovar no es sólo presentar algo nuevo. Es transformar lo existente en algo mejor: mejorar procesos, optimizar formas de comunicarse, cambiar la manera en la que una marca se vincula con su público. No siempre lo innovador es visible a primera vista ni provoca ruido inmediato, pero si es auténtico genera cambios profundos y sostenibles. Lo demás es efímero.`
    },
    {
        id: 'brief',
        span: 3,
        icono: <FaBullseye />,
        texto: `Desafío del brief
Es fácil poner creatividad e innovación en un brief. Lo realmente desafiante es llenarlas de contenido real y estratégico. Se pueden hacer campañas visualmente impactantes, conceptos originales y piezas disruptivas, pero, si no están alineadas a objetivos claros y necesidades genuinas, pierden valor. Se vuelven entretenimiento superficial, no estrategias sólidas.`
    },
    {
        id: 'manifiesto',
        span: 3,
        destacado: true,
        icono: <FaExclamationTriangle />,
        texto: `La creatividad sin estrategia es sólo decoración. La innovación sin foco es asumir riesgos innecesarios.`
    },
    {
        id: 'cierre',
        span: 3,
        icono: <FaLightbulb />,
        texto: `Conclusión
En Fedes, sabemos que creatividad e innovación no son accesorios, sino piezas fundamentales para lograr resultados. Pero ninguna funciona por sí misma: ambas necesitan método, propósito y medición. Cuando se trabajan con claridad y consistencia, estas palabras dejan de ser clichés en un brief y se convierten en resultados concretos, relevantes y tangibles.`
    }
];

export default function CreatividadEInnovacion() {
    return (
        <ArticleLayout
            id={20}
            blocks={bloques}
            accent="#709cbb"
        />
    );
}
