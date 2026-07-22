import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './LegalPages.scss';

import ConsultoraDegr1 from '../../assets/img/backgrounds/consultora-degr (1).svg';
import ConsultoraDegr2 from '../../assets/img/backgrounds/consultora-degr (2).svg';
import ConsultoraGrid from '../../assets/img/backgrounds/consultora-grilla (3).svg';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.08, ease: [0.26, 1, 0.36, 1] },
  }),
};

export default function Privacidad() {
  return (
    <div className="legal-page-wrapper">
      {/* Background decorations */}
      <div className="legal-bg-decor">
        <img src={ConsultoraDegr1} className="bg-degr degr-1" alt="" />
        <img src={ConsultoraDegr2} className="bg-degr degr-2" alt="" />
        <img src={ConsultoraGrid} className="bg-grid" alt="" />
      </div>

      <div className="legal-container">
        {/* Hero */}
        <motion.div
          className="legal-hero"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <span className="legal-badge">🔒 Documento Legal</span>
          <h1>Política de Privacidad</h1>
          <p className="last-updated">Última actualización: 22 de julio de 2026</p>
        </motion.div>

        {/* Content Card */}
        <motion.div
          className="legal-card"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
        >
          {/* 1 ─ Introducción */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">📌</span>
              <h2>1. Introducción y Ámbito de Aplicación</h2>
            </div>
            <p>
              En <strong>FEDES Consultora</strong> (en adelante, "Nosotros", "la Empresa" o
              "FEDES") estamos comprometidos con la protección de su privacidad y el tratamiento
              responsable de sus datos personales. La presente Política de Privacidad tiene
              como finalidad informarle de manera clara y transparente sobre:
            </p>
            <ul>
              <li>Qué datos personales recopilamos y por qué.</li>
              <li>Cómo utilizamos, almacenamos y protegemos su información.</li>
              <li>Sus derechos como titular de los datos.</li>
              <li>
                Cómo tratamos los datos obtenidos a través de integraciones con plataformas
                de terceros, en particular <strong>Meta/Facebook</strong>.
              </li>
            </ul>
            <p>
              Esta Política aplica a todos los usuarios que visiten nuestro sitio web{' '}
              <strong>www.fedes.ai</strong>, utilicen nuestras aplicaciones o contraten
              nuestros servicios de consultoría y marketing digital.
            </p>
          </section>

          {/* 2 ─ Responsable del Tratamiento */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🏢</span>
              <h2>2. Responsable del Tratamiento de Datos</h2>
            </div>
            <p>El responsable del tratamiento de sus datos personales es:</p>
            <ul>
              <li><strong>Razón Social:</strong> FEDES Consultora</li>
              <li><strong>Sitio Web:</strong> www.fedes.ai</li>
              <li><strong>Correo de contacto:</strong> soporte@fedes.ai</li>
              <li><strong>País:</strong> República Argentina</li>
            </ul>
          </section>

          {/* 3 ─ Información que Recopilamos */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">📋</span>
              <h2>3. Información que Recopilamos</h2>
            </div>
            <p>
              Dependiendo de cómo interactúe con nuestros servicios, podemos recopilar las
              siguientes categorías de datos:
            </p>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginTop: 24, marginBottom: 10 }}>
              3.1. Datos proporcionados directamente por usted
            </h3>
            <ul>
              <li>Nombre y apellido.</li>
              <li>Dirección de correo electrónico.</li>
              <li>Número de teléfono.</li>
              <li>Nombre de la empresa u organización.</li>
              <li>Cualquier otra información que nos envíe voluntariamente a través de formularios de contacto, encuestas o comunicaciones directas.</li>
            </ul>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginTop: 24, marginBottom: 10 }}>
              3.2. Datos recopilados automáticamente
            </h3>
            <ul>
              <li>Dirección IP y ubicación geográfica aproximada.</li>
              <li>Tipo de navegador, sistema operativo y dispositivo utilizado.</li>
              <li>Páginas visitadas, tiempo de navegación y URLs de referencia.</li>
              <li>Datos obtenidos mediante cookies y tecnologías similares (ver sección 7).</li>
            </ul>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginTop: 24, marginBottom: 10 }}>
              3.3. Datos obtenidos de la plataforma Meta / Facebook
            </h3>
            <p>
              Cuando usted autoriza la conexión de su cuenta de Meta con nuestra aplicación
              para la obtención de métricas, recopilamos:
            </p>
            <ul>
              <li>
                <strong>Información de perfil público:</strong> Nombre del usuario, correo
                electrónico asociado a la cuenta de Meta (si fue autorizado), e identificador
                de usuario.
              </li>
              <li>
                <strong>Tokens de acceso (Access Tokens):</strong> Credenciales temporales
                otorgadas por Meta para realizar consultas en su nombre. Estos tokens se
                almacenan de forma cifrada y se utilizan exclusivamente para consultar
                métricas.
              </li>
              <li>
                <strong>Métricas de páginas administradas:</strong> Impresiones, alcance,
                interacciones, clics, datos demográficos de la audiencia (agregados),
                crecimiento de seguidores, rendimiento de publicaciones y cualquier otra
                estadística pública accesible mediante los permisos otorgados.
              </li>
              <li>
                <strong>Información de páginas:</strong> Nombre de la página, categoría,
                URL y foto de perfil de las páginas conectadas.
              </li>
            </ul>
            <p>
              <strong>No recopilamos</strong> contenido de mensajes privados de Messenger,
              publicaciones de perfil personal, información de amigos, datos de pagos ni
              ningún dato que exceda los permisos expresamente autorizados por usted.
            </p>
          </section>

          {/* 4 ─ Uso de la Información */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">⚙️</span>
              <h2>4. Cómo Utilizamos su Información</h2>
            </div>
            <p>
              Los datos recopilados se utilizan exclusivamente para los siguientes fines:
            </p>
            <ul>
              <li>
                <strong>Prestación del servicio:</strong> Generar reportes de métricas,
                dashboards de rendimiento y análisis de datos de sus páginas de Meta.
              </li>
              <li>
                <strong>Comunicación:</strong> Responder a sus consultas, enviar información
                relevante sobre nuestros servicios o cambios en las condiciones de uso.
              </li>
              <li>
                <strong>Mejora del servicio:</strong> Analizar patrones de uso de forma
                agregada y anónima para mejorar la experiencia del usuario y la calidad de
                nuestras herramientas.
              </li>
              <li>
                <strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales,
                regulatorias o requerimientos de autoridades competentes.
              </li>
            </ul>
            <p>
              <strong>Nunca vendemos, alquilamos ni compartimos sus datos personales o los
              datos obtenidos de Meta con terceros para fines de marketing o publicidad.</strong>
            </p>
          </section>

          {/* 5 ─ Compartición de Datos */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🤝</span>
              <h2>5. Compartición de Datos con Terceros</h2>
            </div>
            <p>
              Únicamente podemos compartir su información en los siguientes supuestos
              limitados:
            </p>
            <ul>
              <li>
                <strong>Proveedores de servicios:</strong> Empresas que nos prestan servicios
                técnicos esenciales (hosting, infraestructura en la nube, seguridad) y que
                están contractualmente obligadas a proteger sus datos con estándares
                equivalentes a los nuestros.
              </li>
              <li>
                <strong>Obligación legal:</strong> Cuando sea requerido por ley, orden
                judicial o solicitud de una autoridad gubernamental competente.
              </li>
              <li>
                <strong>Consentimiento explícito:</strong> Cuando usted nos autorice
                expresamente a compartir información con un tercero determinado.
              </li>
              <li>
                <strong>Protección de derechos:</strong> Para proteger los derechos, la
                seguridad o la propiedad de FEDES Consultora, de nuestros usuarios o del
                público general.
              </li>
            </ul>
          </section>

          {/* 6 ─ Almacenamiento y Seguridad */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🔐</span>
              <h2>6. Almacenamiento y Seguridad de los Datos</h2>
            </div>
            <p>
              Implementamos medidas técnicas y organizativas diseñadas para proteger sus datos
              personales frente a accesos no autorizados, alteración, divulgación o
              destrucción. Entre las medidas adoptadas se incluyen:
            </p>
            <ul>
              <li>
                <strong>Cifrado:</strong> Los tokens de acceso de Meta y datos sensibles se
                almacenan cifrados en reposo (AES-256) y se transmiten mediante conexiones
                HTTPS/TLS.
              </li>
              <li>
                <strong>Control de acceso:</strong> Acceso restringido a los datos personales
                únicamente al personal autorizado que lo necesite para el desempeño de sus
                funciones.
              </li>
              <li>
                <strong>Monitoreo:</strong> Sistemas de monitoreo y detección de intrusiones
                para identificar y responder ante posibles incidentes de seguridad.
              </li>
              <li>
                <strong>Copias de seguridad:</strong> Respaldos periódicos y cifrados para
                garantizar la recuperación de la información ante eventos imprevistos.
              </li>
            </ul>
            <p>
              Si bien adoptamos todas las precauciones razonables, ningún método de
              transmisión por Internet o de almacenamiento electrónico es 100% seguro. En
              caso de una brecha de seguridad que afecte sus datos personales, le
              notificaremos de acuerdo con la legislación aplicable.
            </p>
          </section>

          {/* 7 ─ Cookies */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🍪</span>
              <h2>7. Cookies y Tecnologías de Seguimiento</h2>
            </div>
            <p>
              Nuestro sitio web utiliza cookies y tecnologías similares con los siguientes
              fines:
            </p>
            <ul>
              <li>
                <strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico
                del sitio web (sesión, autenticación, seguridad).
              </li>
              <li>
                <strong>Cookies analíticas:</strong> Nos permiten entender cómo los visitantes
                interactúan con nuestro sitio mediante herramientas como Google Analytics,
                recopilando datos de forma anónima y agregada.
              </li>
              <li>
                <strong>Cookies de preferencias:</strong> Recuerdan sus preferencias de
                navegación (idioma, región, configuración de la interfaz).
              </li>
            </ul>
            <p>
              Puede gestionar o deshabilitar las cookies desde la configuración de su
              navegador. Tenga en cuenta que la deshabilitación de ciertas cookies puede
              afectar la funcionalidad del sitio web.
            </p>
          </section>

          {/* 8 ─ Retención */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🗓️</span>
              <h2>8. Retención de Datos</h2>
            </div>
            <p>
              Conservamos sus datos personales únicamente durante el tiempo que sea necesario
              para cumplir con las finalidades descritas en esta Política, o según lo exijan
              las obligaciones legales y contractuales aplicables. Los criterios para
              determinar los períodos de retención incluyen:
            </p>
            <ul>
              <li>La duración de la relación comercial o contractual con usted.</li>
              <li>Mientras la conexión con nuestra aplicación de Meta permanezca activa.</li>
              <li>Las obligaciones legales de conservación de registros contables y fiscales.</li>
              <li>La necesidad de defender o ejercer derechos legales.</li>
            </ul>
            <p>
              Una vez que los datos dejen de ser necesarios, serán eliminados o anonimizados
              de forma segura.
            </p>
          </section>

          {/* 9 ─ ELIMINACIÓN DE DATOS — Clave para Meta */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🗑️</span>
              <h2>9. Eliminación de Datos (Data Deletion)</h2>
            </div>
            <p>
              En cumplimiento de las políticas de Meta para Desarrolladores y de la normativa
              de protección de datos, usted tiene derecho a solicitar la eliminación completa
              de toda la información que hayamos recopilado en relación con su cuenta de Meta
              y las métricas de sus páginas.
            </p>

            <div className="deletion-box">
              <div className="deletion-title">
                🚨 Instrucciones para la Eliminación de Datos (Data Deletion Instructions)
              </div>
              <p>
                Usted puede solicitar la eliminación total de sus datos en cualquier momento
                siguiendo estos pasos:
              </p>
              <ol>
                <li>
                  <strong>Revoque el acceso de nuestra aplicación</strong> desde la
                  configuración de su cuenta de Facebook:
                  <em> Configuración → Configuración y privacidad → Configuración →
                  Aplicaciones y sitios web</em>. Localice "FEDES Consultora" y seleccione
                  "Eliminar".
                </li>
                <li>
                  <strong>Envíe un correo electrónico</strong> a{' '}
                  <strong>soporte@fedes.ai</strong> con el asunto:{' '}
                  <strong>"Solicitud de Eliminación de Datos — Meta App"</strong>.
                </li>
                <li>
                  En el cuerpo del correo, incluya:
                  <ul style={{ marginTop: 8 }}>
                    <li>Su nombre completo.</li>
                    <li>El correo electrónico asociado a su cuenta de Meta.</li>
                    <li>El nombre de la(s) página(s) de Meta conectadas a nuestro servicio.</li>
                    <li>Su identificador de usuario de Facebook (opcional, pero acelera el proceso).</li>
                  </ul>
                </li>
                <li>
                  Nuestro equipo de soporte técnico procesará su solicitud en un plazo
                  máximo de <strong>5 (cinco) días hábiles</strong> y procederá a:
                  <ul style={{ marginTop: 8 }}>
                    <li>Eliminar de forma permanente todos los tokens de acceso almacenados.</li>
                    <li>Borrar todo el historial de métricas y datos analíticos asociados a sus páginas.</li>
                    <li>Eliminar cualquier dato de perfil vinculado a su cuenta.</li>
                  </ul>
                </li>
                <li>
                  Le enviaremos una <strong>confirmación por correo electrónico</strong> una
                  vez que el proceso de eliminación se haya completado exitosamente, junto
                  con un código de referencia para su registro.
                </li>
              </ol>
            </div>

            <p>
              Tras la eliminación de sus datos, ya no podrá acceder a los reportes y métricas
              previamente generados. Si desea volver a utilizar nuestros servicios en el
              futuro, deberá realizar una nueva autorización.
            </p>
          </section>

          {/* 10 ─ Derechos del Usuario */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🛡️</span>
              <h2>10. Sus Derechos como Titular de los Datos</h2>
            </div>
            <p>
              De acuerdo con la legislación vigente en materia de protección de datos
              personales (Ley 25.326 de la República Argentina y normativa complementaria),
              usted tiene los siguientes derechos:
            </p>
            <ul>
              <li>
                <strong>Derecho de acceso:</strong> Solicitar información sobre los datos
                personales que tenemos almacenados sobre usted.
              </li>
              <li>
                <strong>Derecho de rectificación:</strong> Solicitar la corrección de datos
                personales inexactos o incompletos.
              </li>
              <li>
                <strong>Derecho de supresión:</strong> Solicitar la eliminación de sus datos
                personales cuando ya no sean necesarios para los fines para los que fueron
                recopilados (ver sección 9).
              </li>
              <li>
                <strong>Derecho de oposición:</strong> Oponerse al tratamiento de sus datos
                personales en determinadas circunstancias.
              </li>
              <li>
                <strong>Derecho de revocación:</strong> Retirar su consentimiento en
                cualquier momento sin que ello afecte la licitud del tratamiento previo.
              </li>
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, envíe un correo electrónico a{' '}
              <strong>soporte@fedes.ai</strong> indicando su solicitud y adjuntando una
              copia de su documento de identidad para verificación.
            </p>
          </section>

          {/* 11 ─ Menores */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">👶</span>
              <h2>11. Protección de Menores</h2>
            </div>
            <p>
              Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos
              intencionalmente información personal de menores. Si tomamos conocimiento de
              que hemos recopilado datos de un menor, procederemos a eliminar dicha
              información de inmediato. Si usted es padre, madre o tutor legal y cree que un
              menor ha proporcionado datos personales a FEDES Consultora, contáctenos a{' '}
              <strong>soporte@fedes.ai</strong>.
            </p>
          </section>

          {/* 12 ─ Transferencias Internacionales */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🌍</span>
              <h2>12. Transferencias Internacionales de Datos</h2>
            </div>
            <p>
              Sus datos pueden ser almacenados y procesados en servidores ubicados fuera de
              la República Argentina (por ejemplo, servicios de computación en la nube con
              centros de datos en otros países). En tales casos, nos aseguramos de que los
              proveedores ofrezcan un nivel de protección adecuado conforme a la normativa
              argentina y estándares internacionales de seguridad de la información.
            </p>
          </section>

          {/* 13 ─ Modificaciones */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🔄</span>
              <h2>13. Modificaciones de esta Política</h2>
            </div>
            <p>
              Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier
              momento para reflejar cambios en nuestras prácticas de tratamiento de datos,
              actualizaciones normativas o requerimientos de plataformas externas como Meta.
              La versión actualizada será siempre accesible en{' '}
              <strong>www.fedes.ai/privacidad</strong>.
            </p>
            <p>
              En caso de cambios significativos, le notificaremos mediante un aviso visible
              en nuestro sitio web o por correo electrónico.
            </p>
          </section>

          {/* 14 ─ Contacto */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">✉️</span>
              <h2>14. Contacto</h2>
            </div>
            <p>
              Para consultas, solicitudes o reclamos relacionados con esta Política de
              Privacidad o el tratamiento de sus datos personales, puede comunicarse con
              nuestro equipo:
            </p>

            <div className="contact-card">
              <div className="contact-info">
                <h4>FEDES Consultora — Protección de Datos</h4>
                <p>soporte@fedes.ai</p>
              </div>
              <a href="mailto:soporte@fedes.ai" className="contact-btn">
                Enviar correo →
              </a>
            </div>
          </section>

          {/* Cross-link */}
          <section className="legal-section" style={{ textAlign: 'center', marginTop: 40 }}>
            <p>
              Consulte también nuestros{' '}
              <Link to="/terminos-y-condiciones" style={{ color: '#1B5EBF', fontWeight: 600 }}>
                Términos y Condiciones de Uso
              </Link>{' '}
              para conocer las reglas que rigen el uso de nuestros servicios.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
