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

export default function TerminosCondiciones() {
  return (
    <div className="legal-page-wrapper">
      {/* Background decorations matching site style */}
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
          <span className="legal-badge">📄 Documento Legal</span>
          <h1>Términos y Condiciones de Uso</h1>
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
          {/* 1 ─ Aceptación */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">✅</span>
              <h2>1. Aceptación de los Términos</h2>
            </div>
            <p>
              Al acceder y utilizar el sitio web <strong>www.fedes.ai</strong>, las aplicaciones
              asociadas y los servicios digitales de <strong>FEDES Consultora</strong> (en
              adelante, "el Servicio", "Nosotros" o "la Empresa"), usted declara haber leído,
              comprendido y aceptado en su totalidad los presentes Términos y Condiciones de
              Uso. Si no está de acuerdo con alguna de sus disposiciones, le solicitamos que
              se abstenga de utilizar nuestros servicios.
            </p>
            <p>
              El uso continuado del Servicio constituye la aceptación tácita de cualquier
              modificación futura que se realice sobre estos términos.
            </p>
          </section>

          {/* 2 ─ Descripción del Servicio */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🏢</span>
              <h2>2. Descripción del Servicio</h2>
            </div>
            <p>
              FEDES Consultora es una empresa de consultoría y agencia digital que ofrece,
              entre otros, los siguientes servicios:
            </p>
            <ul>
              <li>Consultoría financiera, administrativa y comercial para empresas.</li>
              <li>Servicios de marketing digital, branding, identidad corporativa y gestión de redes sociales.</li>
              <li>Desarrollo web, e-commerce y soluciones tecnológicas a medida.</li>
              <li>
                <strong>Análisis de métricas y rendimiento de páginas en plataformas de terceros</strong>,
                incluyendo la integración con la API de Meta/Facebook (Graph API) para obtener
                estadísticas públicas de páginas de las cuales usted es administrador o ha otorgado permiso.
              </li>
              <li>Implementación de herramientas de gestión empresarial (ERP, CRM) como Odoo.</li>
            </ul>
          </section>

          {/* 3 ─ Registro y Cuentas de Usuario */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">👤</span>
              <h2>3. Registro y Cuentas de Usuario</h2>
            </div>
            <p>
              Determinados servicios o funcionalidades pueden requerir que usted cree una
              cuenta, se identifique o autorice el acceso a sus perfiles en plataformas de
              terceros (como Meta/Facebook). En tales casos:
            </p>
            <ul>
              <li>Usted es responsable de proporcionar información veraz y actualizada.</li>
              <li>Usted se compromete a mantener la confidencialidad de sus credenciales de acceso.</li>
              <li>
                Toda actividad que se realice bajo su cuenta será de su exclusiva
                responsabilidad, debiendo notificarnos de inmediato cualquier uso no
                autorizado.
              </li>
              <li>
                Nos reservamos el derecho de suspender o cancelar cuentas que infrinjan
                estos términos o que permanezcan inactivas por un período prolongado.
              </li>
            </ul>
          </section>

          {/* 4 ─ Uso de APIs de Meta / Facebook */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">📊</span>
              <h2>4. Uso de APIs y Datos de Meta / Facebook</h2>
            </div>
            <p>
              Nuestra aplicación se conecta con la plataforma de Meta (Facebook, Instagram)
              mediante las APIs oficiales (Graph API) con el fin exclusivo de obtener métricas
              de rendimiento de las páginas que usted administra. Al autorizar esta conexión,
              usted acepta que:
            </p>
            <ul>
              <li>
                <strong>Autorización explícita:</strong> El acceso se solicita únicamente a
                través de los diálogos oficiales de autorización de Meta (OAuth). Nunca
                solicitaremos credenciales directamente.
              </li>
              <li>
                <strong>Alcance limitado:</strong> Únicamente solicitamos los permisos
                estrictamente necesarios para la lectura de métricas públicas de las páginas
                (impresiones, alcance, interacciones, seguidores, datos demográficos
                agregados, etc.).
              </li>
              <li>
                <strong>Tokens de acceso:</strong> Almacenamos de forma segura los tokens de
                acceso otorgados por Meta exclusivamente para realizar consultas
                automatizadas. Estos tokens están cifrados en reposo y en tránsito.
              </li>
              <li>
                <strong>Sin acceso a mensajes privados:</strong> Nuestra aplicación NO accede
                a mensajes privados, contenido de conversaciones de Messenger, datos de
                grupos privados ni información personal de terceros usuarios.
              </li>
              <li>
                <strong>Revocación:</strong> Usted puede revocar el acceso de nuestra
                aplicación en cualquier momento desde la configuración de su cuenta de
                Facebook (<em>Configuración → Aplicaciones y sitios web</em>) o
                contactándonos directamente.
              </li>
              <li>
                <strong>Cumplimiento de Políticas de Meta:</strong> Nuestra aplicación cumple
                con las{' '}
                <a
                  href="https://developers.facebook.com/terms/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Condiciones de la Plataforma de Meta
                </a>{' '}
                y las{' '}
                <a
                  href="https://developers.facebook.com/policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Políticas para Desarrolladores de Meta
                </a>.
              </li>
            </ul>
          </section>

          {/* 5 ─ Uso Aceptable */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">⚖️</span>
              <h2>5. Uso Aceptable del Servicio</h2>
            </div>
            <p>
              El usuario se compromete a utilizar el Servicio de forma lícita, ética y conforme
              a estos Términos. Queda expresamente prohibido:
            </p>
            <ul>
              <li>Utilizar el Servicio para fines ilegales, fraudulentos o no autorizados.</li>
              <li>
                Intentar acceder a datos de otros usuarios o a áreas restringidas del sistema
                sin la debida autorización.
              </li>
              <li>
                Reproducir, distribuir, modificar o crear trabajos derivados de los contenidos
                del Servicio sin autorización escrita previa.
              </li>
              <li>
                Introducir software malicioso, realizar ingeniería inversa o interferir con
                el funcionamiento del Servicio o sus servidores.
              </li>
              <li>
                Utilizar bots, scrapers o sistemas automatizados para acceder al Servicio de
                manera masiva o no autorizada.
              </li>
            </ul>
          </section>

          {/* 6 ─ Propiedad Intelectual */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">©️</span>
              <h2>6. Propiedad Intelectual</h2>
            </div>
            <p>
              El diseño, la estructura, el código fuente, los gráficos, logotipos, textos,
              imágenes, videos, marcas registradas y demás contenidos publicados en el sitio
              web y aplicaciones de FEDES Consultora son propiedad exclusiva de la Empresa o
              de sus licenciantes, y están protegidos por las leyes de propiedad intelectual e
              industrial de la República Argentina y tratados internacionales aplicables.
            </p>
            <p>
              Queda prohibida su reproducción, distribución, comunicación pública o
              transformación total o parcial sin la autorización expresa y por escrito de
              FEDES Consultora.
            </p>
          </section>

          {/* 7 ─ Limitación de Responsabilidad */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🛡️</span>
              <h2>7. Limitación de Responsabilidad</h2>
            </div>
            <p>
              FEDES Consultora se esfuerza por mantener la disponibilidad, precisión y
              seguridad de sus servicios. Sin embargo, no garantizamos que:
            </p>
            <ul>
              <li>El Servicio sea ininterrumpido, libre de errores o completamente seguro.</li>
              <li>
                Los datos obtenidos de APIs de terceros (como Meta) sean exactos en todo
                momento, dado que dependen de la disponibilidad y precisión de dichas
                plataformas externas.
              </li>
              <li>
                Los resultados derivados del análisis de métricas garanticen resultados
                comerciales específicos.
              </li>
            </ul>
            <p>
              En ningún caso FEDES Consultora será responsable por daños directos, indirectos,
              incidentales, consecuentes o punitivos derivados del uso o la imposibilidad de
              uso del Servicio, incluyendo pero no limitado a pérdidas de datos, lucro cesante,
              interrupciones del servicio de terceros o decisiones comerciales basadas en los
              reportes generados.
            </p>
          </section>

          {/* 8 ─ Enlaces a Terceros */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🔗</span>
              <h2>8. Enlaces a Sitios de Terceros</h2>
            </div>
            <p>
              Nuestro Servicio puede contener enlaces o integraciones con sitios web y
              plataformas de terceros (Meta, Google, Odoo, entre otros). Estos enlaces se
              proporcionan únicamente para su comodidad y no implican respaldo, aprobación o
              responsabilidad alguna sobre el contenido, las políticas de privacidad o las
              prácticas de dichos sitios. Le recomendamos revisar los términos y políticas de
              cada sitio que visite.
            </p>
          </section>

          {/* 9 ─ Indemnización */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">📋</span>
              <h2>9. Indemnización</h2>
            </div>
            <p>
              El usuario acepta indemnizar, defender y mantener indemne a FEDES Consultora,
              sus directores, empleados, socios y agentes frente a cualquier reclamación,
              responsabilidad, daño, pérdida y gasto (incluidos honorarios legales razonables)
              que surjan del incumplimiento de estos Términos o del uso indebido del Servicio
              por parte del usuario.
            </p>
          </section>

          {/* 10 ─ Modificaciones */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🔄</span>
              <h2>10. Modificaciones de los Términos</h2>
            </div>
            <p>
              Nos reservamos el derecho de actualizar o modificar estos Términos y Condiciones
              en cualquier momento y sin previo aviso. Las modificaciones entrarán en vigor
              desde el momento de su publicación en esta misma URL
              (<strong>www.fedes.ai/terminos-y-condiciones</strong>). Se recomienda al usuario
              revisar periódicamente esta página.
            </p>
            <p>
              En caso de cambios sustanciales que afecten significativamente sus derechos u
              obligaciones, realizaremos esfuerzos razonables para notificarle mediante correo
              electrónico o mediante un aviso destacado en nuestro sitio web.
            </p>
          </section>

          {/* 11 ─ Ley Aplicable y Jurisdicción */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">🏛️</span>
              <h2>11. Ley Aplicable y Jurisdicción</h2>
            </div>
            <p>
              Estos Términos se regirán e interpretarán de conformidad con las leyes de la
              República Argentina. Cualquier controversia que surja en relación con el uso del
              Servicio será sometida a los Tribunales Ordinarios de la Ciudad de Rosario,
              Provincia de Santa Fe, República Argentina, renunciando las partes a cualquier
              otro fuero que pudiera corresponderles.
            </p>
          </section>

          {/* 12 ─ Contacto */}
          <section className="legal-section">
            <div className="section-header">
              <span className="section-icon">✉️</span>
              <h2>12. Contacto</h2>
            </div>
            <p>
              Si tiene alguna pregunta, consulta o solicitud relacionada con estos Términos y
              Condiciones, puede comunicarse con nosotros a través de los siguientes medios:
            </p>

            <div className="contact-card">
              <div className="contact-info">
                <h4>FEDES Consultora</h4>
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
              Consulte también nuestra{' '}
              <Link to="/privacidad" style={{ color: '#1B5EBF', fontWeight: 600 }}>
                Política de Privacidad
              </Link>{' '}
              para conocer cómo recopilamos, usamos y protegemos su información personal.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
