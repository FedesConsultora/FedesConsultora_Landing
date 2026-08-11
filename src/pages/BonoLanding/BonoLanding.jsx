import { useEffect, useMemo, useState } from 'react'
import Logo from '../../assets/img/Logo.svg'
import {
  completeGaliciaLead,
  createLeadId,
  getAttribution,
  getGaliciaCampaign,
  getLeadStatus,
  markGaliciaMeetingClick,
  startGaliciaLead,
} from '../../services/galiciaApi'
import './BonoLanding.scss'

const STORAGE_KEY = 'fedes_galicia_2026_lead'

const QUESTIONS = [
  {
    key: 'q1',
    eyebrow: 'Estructura interna',
    question: '¿Cómo está estructurado actualmente el equipo interno que ejecutará las estrategias comerciales y operativas en tu empresa?',
    options: {
      A: 'No tenemos un equipo dedicado y buscamos delegar la ejecución táctica diaria en un tercero.',
      B: 'Contamos con un equipo de ejecución interno, pero carecemos de dirección estratégica y optimización de procesos de negocio.',
      C: 'Tenemos áreas de gerencia estructuradas (Marketing, Operaciones, Ventas) y buscamos profesionalizar, integrar tecnologías o automatizar flujos de trabajo a escala.',
    },
  },
  {
    key: 'q2',
    eyebrow: 'Horizonte de planificación',
    question: 'Al iniciar un proceso de consultoría de negocios, ¿con qué horizonte de tiempo planifican ver consolidados los resultados estratégicos?',
    options: {
      A: 'Necesitamos implementar acciones comerciales o de pauta inmediatas para ver retornos en los próximos 30 días.',
      B: 'Nos movemos bajo objetivos trimestrales, pero buscamos una planificación de negocio coordinada con una visión anual.',
      C: 'Diseñamos planes estratégicos y de profesionalización a mediano/largo plazo (12 a 24 meses) y requerimos un socio consultor continuo.',
    },
  },
  {
    key: 'q3',
    eyebrow: 'Desafío prioritario',
    question: '¿Cuál es el principal desafío estratégico que tu negocio necesita resolver prioritariamente en este momento?',
    options: {
      A: 'Generar visibilidad inmediata en redes sociales o diseñar piezas de comunicación puntuales.',
      B: 'Realizar una auditoría integral del negocio, mapear nuestros procesos internos y diseñar una estrategia comercial robusta.',
      C: 'Automatizar operaciones complejas, integrar herramientas de gestión (CRM/ERP), capacitar a nuestro equipo o estructurar el crecimiento por industrias.',
    },
  },
  {
    key: 'q4',
    eyebrow: 'Experiencia previa',
    question: '¿Qué tipo de servicios externos de soporte al crecimiento ha contratado tu empresa anteriormente?',
    options: {
      A: 'Solo hemos trabajado con diseñadores independientes o agencias de marketing digital tradicionales.',
      B: 'Hemos trabajado con agencias, pero sentimos que nos falta una dirección de negocios profunda y un orden metodológico en los procesos.',
      C: 'Hemos contratado previamente consultorías de procesos, tecnología, finanzas o desarrollo de negocios.',
    },
  },
]

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.com.ar', 'outlook.com',
  'live.com', 'yahoo.com', 'yahoo.com.ar', 'icloud.com', 'me.com', 'aol.com',
])

function normalizeWebsite(value) {
  const clean = value.trim()
  if (!clean) return ''
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`
}

function validateWebsite(value) {
  try {
    const url = new URL(normalizeWebsite(value))
    return Boolean(url.hostname && url.hostname.includes('.'))
  } catch {
    return false
  }
}

function validateCorporateEmail(value) {
  const email = value.trim().toLowerCase()
  const match = email.match(/^[^\s@]+@([^\s@]+\.[^\s@]+)$/)
  if (!match) return 'Ingresá un correo electrónico válido.'
  if (FREE_EMAIL_DOMAINS.has(match[1])) return 'Para continuar, usá el correo corporativo de tu empresa.'
  return ''
}

function readStoredLead() {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

function ResultView({ result, campaign, leadId, source }) {
  const classification = result?.classification
  const meetingUrl = campaign?.meeting_url || ''

  if (classification === 'CALIFICADO') {
    return (
      <div className="bono-result bono-result--qualified">
        <span className="bono-result__icon">✓</span>
        <p className="bono-kicker">Registro completado</p>
        <h1>¡Listo! Podés avanzar con <strong>tu beneficio.</strong></h1>
        <p>
          Tu empresa puede continuar con uno de los cupos del beneficio de
          <strong> 50% de bonificación en el primer mes</strong> del Onboarding estratégico.
        </p>
        <div className="bono-result__note">
          El proceso comienza con una auditoría integral y se integra a un roadmap de crecimiento anual.
          La bonificación queda sujeta a disponibilidad de cupo y validación final del alcance.
        </div>
        {meetingUrl ? (
          <a
            className="bono-button bono-button--primary"
            href={meetingUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => markGaliciaMeetingClick(leadId, source)}
          >
            Agendar diagnóstico de 15 minutos
          </a>
        ) : (
          <p className="bono-result__pending">Nuestro equipo va a contactarte para coordinar el siguiente paso.</p>
        )}
      </div>
    )
  }

  if (classification === 'EN_EVALUACION') {
    return (
      <div className="bono-result">
        <span className="bono-result__icon">✓</span>
        <p className="bono-kicker">Registro completado</p>
        <h1>¡Listo! Ya tenemos <strong>la información de tu empresa.</strong></h1>
        <p>
          Gracias por compartirnos tu contexto. Nuestro equipo va a revisar la información y se pondrá
          en contacto para indicarte el próximo paso y conversar sobre el beneficio.
        </p>
        <div className="bono-result__note">
          En Fedes trabajamos con cada organización a partir de su estructura, sus procesos y sus objetivos de crecimiento.
        </div>
      </div>
    )
  }

  return (
    <div className="bono-result">
      <span className="bono-result__icon">✓</span>
      <p className="bono-kicker">Registro completado</p>
      <h1>¡Gracias! Ya conocemos un poco más <strong>sobre tu empresa.</strong></h1>
      <p>
        Con la información que nos compartiste podemos acercarte contenidos y próximos pasos más útiles
        para el momento actual de tu negocio.
      </p>
      <a className="bono-button bono-button--secondary" href="/blog">Ver recursos estratégicos de Fedes</a>
    </div>
  )
}

export default function BonoLanding() {
  const attribution = useMemo(() => getAttribution(), [])
  const [step, setStep] = useState(1)
  const [leadId, setLeadId] = useState('')
  const [campaign, setCampaign] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ fullName: '', email: '', company: '', website: '' })
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' })

  useEffect(() => {
    document.title = 'Beneficio Banco Galicia 2026 | Fedes'
    getGaliciaCampaign().then(setCampaign)

    const stored = readStoredLead()
    if (!stored?.leadId) return

    setLeadId(stored.leadId)
    if (stored.form) setForm(stored.form)
    if (stored.answers) setAnswers(stored.answers)

    getLeadStatus(stored.leadId)
      .then((status) => {
        if (!status?.found) return
        if (status.status === 'complete') {
          setResult(status)
          setStep(3)
        } else {
          setStep(2)
        }
      })
      .catch(() => {})
  }, [])

  const persist = (next) => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const handleStepOne = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.fullName.trim()) return setError('Ingresá tu nombre completo.')
    const emailError = validateCorporateEmail(form.email)
    if (emailError) return setError(emailError)
    if (!form.company.trim()) return setError('Ingresá el nombre de tu empresa.')

    const id = leadId || createLeadId()
    const cleanForm = {
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      company: form.company.trim(),
    }
    setLeadId(id)
    setLoading(true)

    try {
      const status = await startGaliciaLead({
        leadId: id,
        ...cleanForm,
        website: '',
        source: attribution.source,
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
        referrer: attribution.referrer,
        pagePath: '/bono',
        userAgent: navigator.userAgent,
        client: 'fedes_landing_bono',
      })

      persist({ leadId: id, form: cleanForm, answers })

      if (status.status === 'complete') {
        setResult(status)
        setStep(3)
      } else {
        setForm(cleanForm)
        setStep(2)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (requestError) {
      setError(requestError.message || 'No pudimos guardar tus datos. Intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (event) => {
    event.preventDefault()
    setError('')

    if (!validateWebsite(form.website)) return setError('Ingresá el sitio web de tu empresa, por ejemplo empresa.com.ar.')
    const unanswered = QUESTIONS.find(({ key }) => !answers[key])
    if (unanswered) return setError('Respondé las cuatro preguntas para completar el registro.')
    if (!leadId) return setError('No pudimos recuperar tu registro inicial. Volvé al primer paso.')

    const cleanForm = { ...form, website: normalizeWebsite(form.website) }
    setLoading(true)
    setForm(cleanForm)
    persist({ leadId, form: cleanForm, answers })

    try {
      const status = await completeGaliciaLead({
        leadId,
        website: cleanForm.website,
        ...answers,
        source: attribution.source,
        pagePath: '/bono',
      })
      setResult(status)
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (requestError) {
      setError(requestError.message || 'No pudimos completar el registro. Intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bono-page">
      <div className="bono-orb bono-orb--one" />
      <div className="bono-orb bono-orb--two" />

      <header className="bono-brand">
        <img src={Logo} alt="Fedes Consultora" />
        <span>Banco Galicia · Beneficio 2026</span>
      </header>

      <div className="bono-shell">
        {step !== 3 && (
          <section className="bono-intro">
            <div className="bono-badge">Beneficio exclusivo · cupos limitados</div>
            <p className="bono-kicker">Pymes que venden más</p>
            <h1>
              Gracias por compartir este espacio en Banco Galicia.
              <strong> Activá tu beneficio con Fedes.</strong>
            </h1>
            <p className="bono-intro__copy">
              Registrá tu empresa para acceder a un <strong>50% de bonificación en el primer mes</strong>
              de nuestro Onboarding estratégico. Primero entendemos tu negocio; después diseñamos el camino.
            </p>

            <div className="bono-value-grid">
              <div><b>01</b><span>Auditoría integral</span></div>
              <div><b>02</b><span>Mapeo de procesos</span></div>
              <div><b>03</b><span>Estrategia inicial</span></div>
              <div><b>04</b><span>Setup de herramientas</span></div>
            </div>

            <p className="bono-method-note">
              El Onboarding comienza con una etapa de diagnóstico y auditoría profunda que puede extenderse
              hasta 60 días y se integra a un roadmap de crecimiento anual.
            </p>
          </section>
        )}

        <section className={`bono-card ${step === 3 ? 'bono-card--result' : ''}`}>
          {step !== 3 && (
            <div className="bono-progress" aria-label={`Paso ${step} de 2`}>
              <div className={`bono-progress__item ${step >= 1 ? 'is-active' : ''}`}><span>1</span> Tus datos</div>
              <div className="bono-progress__line"><i style={{ width: step === 1 ? '0%' : '100%' }} /></div>
              <div className={`bono-progress__item ${step >= 2 ? 'is-active' : ''}`}><span>2</span> Tu empresa</div>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStepOne} className="bono-form">
              <div className="bono-card__heading">
                <p className="bono-kicker">Paso 1 de 2</p>
                <h2>Empecemos por tus datos.</h2>
                <p>Son tres datos rápidos. Los guardamos ahora para que no pierdas tu registro si necesitás continuar después.</p>
              </div>

              <label>
                <span>Nombre completo</span>
                <input
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Tu nombre y apellido"
                />
              </label>

              <label>
                <span>Correo corporativo</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="nombre@empresa.com"
                />
                <small>Usá el correo de tu empresa para continuar.</small>
              </label>

              <label>
                <span>Empresa</span>
                <input
                  autoComplete="organization"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Nombre de la empresa"
                />
              </label>

              {error && <div className="bono-error" role="alert">{error}</div>}

              <button className="bono-button bono-button--primary" type="submit" disabled={loading}>
                {loading ? 'Guardando…' : 'Reservar mi beneficio y continuar'}
              </button>
              <p className="bono-privacy">Tus datos se utilizan para gestionar el beneficio y continuar el contacto comercial.</p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleComplete} className="bono-form bono-form--questions">
              <div className="bono-card__heading">
                <p className="bono-kicker">Paso 2 de 2</p>
                <h2>Contanos un poco más sobre tu empresa.</h2>
                <p>Completá el sitio web y cuatro preguntas rápidas para que podamos entender mejor tu contexto.</p>
              </div>

              <label>
                <span>Sitio web</span>
                <input
                  inputMode="url"
                  autoComplete="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="empresa.com.ar"
                />
              </label>

              {QUESTIONS.map(({ key, eyebrow, question, options }, questionIndex) => (
                <fieldset className="bono-question" key={key}>
                  <legend>
                    <span>{String(questionIndex + 1).padStart(2, '0')} · {eyebrow}</span>
                    {question}
                  </legend>
                  <div className="bono-options">
                    {Object.entries(options).map(([optionKey, label]) => (
                      <label className={`bono-option ${answers[key] === optionKey ? 'is-selected' : ''}`} key={optionKey}>
                        <input
                          type="radio"
                          name={key}
                          value={optionKey}
                          checked={answers[key] === optionKey}
                          onChange={() => setAnswers({ ...answers, [key]: optionKey })}
                        />
                        <span className="bono-option__mark" aria-hidden="true">•</span>
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              {error && <div className="bono-error" role="alert">{error}</div>}

              <button className="bono-button bono-button--primary" type="submit" disabled={loading}>
                {loading ? 'Guardando…' : 'Completar mi registro'}
              </button>
            </form>
          )}

          {step === 3 && (
            <ResultView
              result={result}
              campaign={campaign}
              leadId={leadId}
              source={attribution.source}
            />
          )}
        </section>
      </div>

      <footer className="bono-footer">
        <span>Fedes Consultora</span>
        <span>Consultora de Estrategia y Desarrollo Comercial</span>
      </footer>
    </main>
  )
}
