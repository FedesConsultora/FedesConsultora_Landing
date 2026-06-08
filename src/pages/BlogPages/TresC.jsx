// src/pages/BlogPages/TresC.jsx
import React from 'react';
import {
    FaLightbulb, FaFingerprint, FaRedoAlt,
    FaLink, FaExclamationTriangle
} from 'react-icons/fa';
import ArticleLayout from '../../components/layout/ArticleLayout';

const blocks = [
    {
        id: 'intro',
        span: 3,
        icono: <FaLightbulb />,
        texto: `Las audiencias están cada vez más entrenadas y los formatos cambian a toda velocidad.
En ese contexto, lo que diferencia a una marca no es quién publica más, sino quién logra sostener una narrativa confiable, consistente y con sentido.
El contenido no es un truco. Es una forma de construir vínculos. Y para eso, hay tres pilares que no pueden faltar en ninguna estrategia: credibilidad, constancia y coherencia.`
    },
    {
        id: 'cred',
        span: 1,
        icono: <FaFingerprint />,
        texto: `Credibilidad
La base de todo. 
La confianza no se gana con promesas vacías, sino con contenidos que reflejan lo que la marca realmente es.
Credibilidad es decir lo que hacés y hacer lo que decís. Es mostrar sin exagerar. Es no subestimar a la audiencia. Y en redes, donde todo se expone, o sos creíble o sos descartable.`
    },
    {
        id: 'const',
        span: 1,
        icono: <FaRedoAlt />,
        texto: `Constancia
No alcanza con tener buenas ideas. Hay que sostenerlas.
La constancia es ese músculo silencioso que no se ve en la publicación viral, pero sí en la estrategia de fondo.
Es estar presente. Escuchar. Medir. Ajustar. Es entender que una marca no se construye en un día ni con una campaña, sino con cada pequeño paso que reafirma su identidad.`
    },
    {
        id: 'coher',
        span: 1,
        icono: <FaLink />,
        texto: `Coherencia
El gran diferenciador.
El contenido puede ser lindo, ingenioso o incluso viral, pero si no está alineado con los valores y el tono de la marca, pierde fuerza.
La coherencia es lo que permite que todo tenga un hilo: el posteo, la respuesta a un comentario, la campaña, el mail, el sitio web. Es lo que hace que una marca se sienta real, íntegra, confiable.`
    },
    {
        id: 'manif',
        span: 3,
        destacado: true,
        icono: <FaExclamationTriangle />,
        texto: `Credibilidad sin constancia es una promesa rota. Constancia sin coherencia es ruido. Coherencia sin credibilidad no conmueve.`
    },
    {
        id: 'cierre',
        span: 3,
        icono: <FaLightbulb />,
        texto: `Quienes crean contenido con estas tres C no sólo comunican: construyen marcas que importan.`
    }
];

export default function TresC() {
    return (
        <ArticleLayout
            id={19}
            blocks={blocks}
            accent="#706cbb"
        />
    );
}
