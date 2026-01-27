// src/pages/BlogPages/CRMIntegradoECommerce.jsx
import React from 'react';
import {
    FaShoppingCart,
    FaDatabase,
    FaEnvelopeOpenText,
    FaBullseye,
    FaArrowCircleUp,
} from 'react-icons/fa';
import ArticleLayout from '../../components/layout/ArticleLayout';

const bloques = [
    {
        id: 'intro',
        span: 3,
        icono: <FaShoppingCart />,
        texto: `¿Tu eCommerce está perdiendo ventas? 
Por qué un CRM integrado es clave para crecer (y cómo hacerlo bien)

Tener un e-commerce con tráfico, pero con una tasa de abandono elevada, es frustrante. Y más cuando invertís tiempo, esfuerzo y dinero en marketing digital. 

Si, además, los datos de tus clientes están dispersos entre tu plataforma de ventas, WhatsApp y un CRM poco aprovechado, escalar se vuelve imposible.`
    },
    {
        id: 'problema',
        span: 3,
        dobleCol: true,
        icono: <FaBullseye />,
        texto: `En Fedes, recibimos una empresa con exactamente este problema: un e-commerce con un 78% de abandono de carrito, información fragmentada y campañas de email marketing genéricas que no conectaban con nadie. La pregunta no era “cómo vender más”, sino “cómo dejar de perder ventas todos los días”.
    
    ¿Qué encontramos en nuestro diagnóstico?
    • Proceso de compra confuso: demasiados pasos, fricciones innecesarias y una experiencia poco intuitiva.
    • CRM y datos dispersos: los clientes interactuaban por WhatsApp, redes sociales y e-commerce, pero esos datos vivían aislados,sin ninguna conexión real.

    • Email marketing sin foco: correos genéricos enviados sin considerar el comportamiento o la etapa del cliente en el proceso de compra.
    
    En síntesis: la estrategia estaba rota. La marca tenía audiencia, pero no entendía cómo hablarle.`
    },
    {
        id: 'soluciones-titulo',
        span: 3,
        destacado: true,
        icono: <FaArrowCircleUp />,
        texto: `¿Qué hicimos para transformar el problema en solución?`
    },
    {
        id: 'buyer-journey',
        span: 1,
        icono: <FaShoppingCart />,
        texto: `1. Rediseño estratégico del buyer journey
Simplificamos la experiencia de compra. 

Menos pasos, menos fricción, menos excusas para abandonar el carrito. 

Hoy, un cliente pasa del interés a la compra en pocos clics.`
    },
    {
        id: 'integracion',
        span: 1,
        icono: <FaDatabase />,
        texto: `2. Integración total: CRM + e-commerce + WhatsApp Business
Consolidamos los datos de todas las interacciones (web, Instagram, WhatsApp) en una sola plataforma integrada. 

Al tener la información en un CRM único y bien segmentado, cada acción de marketing se volvió más precisa y personalizada.`
    },
    {
        id: 'email-automation',
        span: 1,
        icono: <FaEnvelopeOpenText />,
        texto: `3. Automatización inteligente del email marketing
Ya no enviamos emails masivos sin criterio. 

Diseñamos flujos automatizados basados en comportamientos reales: correos post-abandono, promociones personalizadas y nurturing específico para quienes todavía no estaban listos para comprar.`
    },
    {
        id: 'cierre',
        span: 3,
        icono: <FaBullseye />,
        texto: `¿Tu eCommerce está aprovechando realmente el potencial de un CRM integrado?

Si todavía tenés dudas, hablemos de cómo hacer que tu e-commerce no sólo exista, sino que escale.`
    }
];

export default function CRMIntegradoECommerce() {
    return (
        <ArticleLayout
            id={22}
            blocks={bloques}
            accent="#44718D"
        />
    );
}
