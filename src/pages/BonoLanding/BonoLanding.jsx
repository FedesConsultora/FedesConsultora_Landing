import { useEffect, useMemo, useRef, useState } from 'react'
import Logo from '../../assets/img/Logo.svg'
import {
  completeGaliciaLead,
  createLeadId,
  getAttribution,
  getGaliciaResume,
  getLeadProgress,
  getLeadStatus,
  markGaliciaMeetingClick,
  saveGaliciaProgress,
  startGaliciaLead,
} from '../../services/galiciaApi'
import './BonoLanding.scss'

const EMPTY_FORM = { fullName: '', email: '', company: '', website: '' }
const EMPTY_ANSWERS = { q1: '', q2: '', q3: '', q4: '' }

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

function storageKeys(landingKey) {
  const key = String(landingKey || 'default').replace(/[^a-z0-9_-]/gi, '_')
  return {
    session: `fedes_galicia_2026_session:${key}`,
    local: `fedes_galicia_2026_lead:${key}`,
  }
}

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

function readStorage(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) || 'null')
  } catch {
    return null
  }
}

function readStoredLead(landingKey) {
  const keys = storageKeys(landingKey)
  const local = readStorage(window.localStorage, keys.local)
  const session = readStorage(window.sessionStorage, keys.session)
  const leadId = session?.leadId || local?.leadId || ''
  if (leadId) window.localStorage.setItem(keys.local, JSON.stringify({ leadId }))
  return { leadId, session }
}

function persistLead(landingKey, leadId, form, answers) {
  if (!leadId) return
  const keys = storageKeys(landingKey)
  window.localStorage.setItem(keys.local, JSON.stringify({ leadId }))
  window.sessionStorage.setItem(keys.session, JSON.stringify({ leadId, form, answers }))
}

function persistLeadIdOnly(landingKey, leadId) {
  if (!leadId) return
  const keys = storageKeys(landingKey)
  window.localStorage.setItem(keys.local, JSON.stringify({ leadId }))
  window.sessionStorage.removeItem(keys.session)
}

function clearStoredLead(landingKey) {
  const keys = storageKeys(landingKey)
  window.localStorage.removeItem(keys.local)
  window.sessionStorage.removeItem(keys.session)
}

function stripResumeTokenFromUrl() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('resume')) return
  url.searchParams.delete('resume')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

function highestAnsweredKey(answers) {
  for (let index = 4; index >= 1; index -= 1) {
    if (answers[`q${index}`]) return `q${index}`
  }
  return ''
}

function setPageMetadata(landing) {
  document.title = landing?.seo_title || 'Beneficio Galicia | Fedes'

  let description = document.querySelector('meta[name="description"]')
  if (!description) {
    description = document.createElement('meta')
    description.setAttribute('name', 'description')
    document.head.appendChild(description)
  }
  description.setAttribute('content', landing?.seo_description || landing?.description || 'Beneficio Galicia con Fedes.')

  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', `${window.location.origin}${landing?.path || window.location.pathname}`)
}

function LandingDescription({ landing }) {
  const text = landing?.description || ''
  const benefit = landing?.benefit_label || ''
  if (!benefit || !text.includes(benefit)) return <>{text}</>
  const [before, ...afterParts] = text.split(benefit)
  return <>{before}<strong>{benefit}</strong>{afterParts.join(benefit)}</>
}

function ResultView({ result, landing, leadId, source }) {
  const classification = result?.classification
  const meetingUrl = landing?.campaign?.meeting_url || result?.meetingUrl || ''
  const benefitLabel = result?.benefitLabel || landing?.benefit_label || 'tu beneficio Galicia'
  const resultNote = landing?.meta?.resultNote || 'La bonificación queda sujeta a validación final del alcance y a las condiciones vigentes del beneficio.'

  if (classification === 'CALIFICADO') {
    return (
      <div className="bono-result bono-result--qualified">
        <span className="bono-result__icon">✓</span>
        <p className="bono-kicker">Registro completado</p>
        <h1>¡Listo! Podés avanzar con <strong>tu beneficio.</strong></h1>
        <p>
          Tu empresa puede continuar con el beneficio de <strong>{benefitLabel}</strong> del Onboarding estratégico.
        </p>
        <div className="bono-result__note">
          El proceso comienza con una auditoría integral y se integra a un roadmap de crecimiento anual. {resultNote}
        </div>
        {meetingUrl ? (
          <a
            className="bono-button bono-button--primary"
            href={meetingUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => markGaliciaMeetingClick(leadId, source, { landingKey: landing?.landing_key, pagePath: landing?.path })}
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

export default function BonoLanding({ landing }) {
  const landingKey = landing?.landing_key || 'charla-pymes'
  const pagePath = landing?.path || window.location.pathname
  const attribution = useMemo(() => getAttribution(landing), [landing])
  const autosaveSequence = useRef(0)
  const [step, setStep] = useState(1)
  const [leadId, setLeadId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState(true)
  const [autosaveState, setAutosaveState] = useState('idle')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [answers, setAnswers] = useState(EMPTY_ANSWERS)

  useEffect(() => {
    let cancelled = false
    setPageMetadata(landing)

    async function restore() {
      const params = new URLSearchParams(window.location.search)
      const resumeToken = params.get('resume') || ''

      try {
        if (resumeToken) {
          try {
            const state = await getGaliciaResume(resumeToken)
            stripResumeTokenFromUrl()

            if (!state?.found) {
              setNotice('El enlace de recuperación ya no es válido. Ingresá nuevamente tus datos para continuar.')
              return
            }

            const restoredForm = { ...EMPTY_FORM, ...(state.form || {}) }
            const restoredAnswers = { ...EMPTY_ANSWERS, ...(state.answers || {}) }
            setLeadId(state.leadId)
            setForm(restoredForm)
            setAnswers(restoredAnswers)

            if (state.status === 'complete') {
              setResult(state)
              setStep(3)
              persistLeadIdOnly(landingKey, state.leadId)
            } else {
              setStep(2)
              persistLead(landingKey, state.leadId, restoredForm, restoredAnswers)
              setNotice('Recuperamos tu registro. Podés continuar desde donde lo dejaste.')
            }
            return
          } catch {
            stripResumeTokenFromUrl()
            setNotice('No pudimos abrir el enlace de recuperación. Ingresá nuevamente tus datos para continuar.')
            return
          }
        }

        const stored = readStoredLead(landingKey)
        if (!stored.leadId) return

        setLeadId(stored.leadId)
        if (stored.session?.form) setForm({ ...EMPTY_FORM, ...stored.session.form })
        if (stored.session?.answers) setAnswers({ ...EMPTY_ANSWERS, ...stored.session.answers })

        try {
          const state = await getLeadProgress(stored.leadId)
          if (!state?.found) {
            clearStoredLead(landingKey)
            setLeadId('')
            return
          }

          const restoredForm = {
            ...EMPTY_FORM,
            ...(stored.session?.form || {}),
            website: state.website || stored.session?.form?.website || '',
          }
          const restoredAnswers = {
            ...EMPTY_ANSWERS,
            ...(stored.session?.answers || {}),
            ...(state.answers || {}),
          }

          setLeadId(stored.leadId)
          setForm(restoredForm)
          setAnswers(restoredAnswers)

          if (state.status === 'complete') {
            setResult(state)
            setStep(3)
            persistLeadIdOnly(landingKey, stored.leadId)
          } else {
            setStep(2)
            persistLead(landingKey, stored.leadId, restoredForm, restoredAnswers)
          }
        } catch {
          try {
            const status = await getLeadStatus(stored.leadId)
            if (!status?.found) {
              clearStoredLead(landingKey)
              setLeadId('')
            } else if (status.status === 'complete') {
              setResult(status)
              setStep(3)
              persistLeadIdOnly(landingKey, stored.leadId)
            } else {
              setStep(2)
            }
          } catch {
            // Si el CMS está temporalmente frío, conservamos la sesión local sin bloquear el formulario.
          }
        }
      } finally {
        if (!cancelled) setRestoring(false)
      }
    }

    restore()
    return () => { cancelled = true }
  }, [landing, landingKey])

  const autosave = (nextAnswers, nextWebsite, lastQuestionKey) => {
    if (!leadId) return

    const sequence = autosaveSequence.current + 1
    autosaveSequence.current = sequence
    setAutosaveState('saving')

    saveGaliciaProgress({
      leadId,
      landingKey,
      website: validateWebsite(nextWebsite) ? normalizeWebsite(nextWebsite) : '',
      ...nextAnswers,
      lastQuestionKey: lastQuestionKey || highestAnsweredKey(nextAnswers),
      source: attribution.source,
      pagePath,
    })
      .then(() => {
        if (autosaveSequence.current === sequence) setAutosaveState('saved')
      })
      .catch(() => {
        if (autosaveSequence.current === sequence) setAutosaveState('error')
      })
  }

  const handleStepOne = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

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
      await startGaliciaLead({
        leadId: id,
        landingKey,
        ...cleanForm,
        website: '',
        source: attribution.source,
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
        utmContent: attribution.utmContent,
        referrer: attribution.referrer,
        pagePath,
        userAgent: navigator.userAgent,
        client: landing?.meta?.client || `fedes_landing_${landingKey}`,
      })

      persistLead(landingKey, id, cleanForm, answers)
      setForm(cleanForm)
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      getLeadProgress(id)
        .then((state) => {
          if (!state?.found) return
          const restoredAnswers = { ...EMPTY_ANSWERS, ...(state.answers || {}) }
          const restoredForm = { ...cleanForm, website: state.website || cleanForm.website }
          setAnswers(restoredAnswers)
          setForm(restoredForm)

          if (state.status === 'complete') {
            setResult(state)
            setStep(3)
            persistLeadIdOnly(landingKey, id)
          } else {
            persistLead(landingKey, id, restoredForm, restoredAnswers)
            if (Object.values(restoredAnswers).some(Boolean)) {
              setNotice('Encontramos un registro anterior y recuperamos tus respuestas guardadas.')
            }
          }
        })
        .catch(() => {})
    } catch (requestError) {
      setError(requestError.message || 'No pudimos guardar tus datos. Intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionKey, optionKey) => {
    const nextAnswers = { ...answers, [questionKey]: optionKey }
    setAnswers(nextAnswers)
    persistLead(landingKey, leadId, form, nextAnswers)
    autosave(nextAnswers, form.website, questionKey)
  }

  const handleWebsiteChange = (value) => {
    const nextForm = { ...form, website: value }
    setForm(nextForm)
    persistLead(landingKey, leadId, nextForm, answers)
  }

  const handleWebsiteBlur = () => {
    if (!form.website.trim() || !validateWebsite(form.website)) return
    const normalized = normalizeWebsite(form.website)
    const nextForm = { ...form, website: normalized }
    setForm(nextForm)
    persistLead(landingKey, leadId, nextForm, answers)
    autosave(answers, normalized, highestAnsweredKey(answers))
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
    persistLead(landingKey, leadId, cleanForm, answers)

    try {
      const status = await completeGaliciaLead({
        leadId,
        landingKey,
        website: cleanForm.website,
        ...answers,
        source: attribution.source,
        pagePath,
      })
      setResult(status)
      setStep(3)
      persistLeadIdOnly(landingKey, leadId)
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
        <span>Galicia · Beneficio 2026</span>
      </header>

      <div className="bono-shell">
        {step !== 3 && (
          <section className="bono-intro">
            <div className="bono-badge">{landing?.badge || 'Beneficio exclusivo Galicia'}</div>
            {landing?.kicker && <p className="bono-kicker">{landing.kicker}</p>}
            <h1>
              {landing?.headline || 'Potenciá la estructura de tu empresa.'}
              <strong> {landing?.headline_accent || 'Activá tu beneficio con Fedes.'}</strong>
            </h1>
            <p className="bono-intro__copy"><LandingDescription landing={landing} /></p>

            <div className="bono-value-grid">
              <div><b>01</b><span>Auditoría integral</span></div>
              <div><b>02</b><span>Mapeo de procesos</span></div>
              <div><b>03</b><span>Estrategia inicial</span></div>
              <div><b>04</b><span>Setup de herramientas</span></div>
            </div>

            <p className="bono-method-note">
              {landing?.meta?.methodNote || 'El Onboarding comienza con una etapa de diagnóstico y auditoría profunda y se integra a un roadmap de crecimiento anual.'}
            </p>
          </section>
        )}

        <section className={`bono-card ${step === 3 ? 'bono-card--result' : ''}`}>
          {restoring ? (
            <div className="bono-restoring" role="status">
              <span className="bono-restoring__spinner" aria-hidden="true" />
              <p>Recuperando tu registro…</p>
            </div>
          ) : (
            <>
              {step !== 3 && (
                <div className="bono-progress" aria-label={`Paso ${step} de 2`}>
                  <div className={`bono-progress__item ${step >= 1 ? 'is-active' : ''}`}><span>1</span> Tus datos</div>
                  <div className="bono-progress__line"><i style={{ width: step === 1 ? '0%' : '100%' }} /></div>
                  <div className={`bono-progress__item ${step >= 2 ? 'is-active' : ''}`}><span>2</span> Tu empresa</div>
                </div>
              )}

              {notice && step !== 3 && <div className="bono-notice" role="status">{notice}</div>}

              {step === 1 && (
                <form onSubmit={handleStepOne} className="bono-form">
                  <div className="bono-card__heading">
                    <p className="bono-kicker">Paso 1 de 2</p>
                    <h2>Empecemos por tus datos.</h2>
                    <p>Son tres datos rápidos. Los guardamos ahora para que puedas continuar después si lo necesitás.</p>
                  </div>

                  <label>
                    <span>Nombre completo</span>
                    <input autoComplete="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Tu nombre y apellido" />
                  </label>

                  <label>
                    <span>Correo corporativo</span>
                    <input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nombre@empresa.com" />
                    <small>Usá el correo de tu empresa para continuar.</small>
                  </label>

                  <label>
                    <span>Empresa</span>
                    <input autoComplete="organization" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Nombre de la empresa" />
                  </label>

                  {error && <div className="bono-error" role="alert">{error}</div>}

                  <button className="bono-button bono-button--primary" type="submit" disabled={loading}>
                    {loading ? 'Guardando…' : 'Reservar mi beneficio y continuar'}
                  </button>
                  <p className="bono-privacy">
                    Tus datos se utilizan para gestionar el beneficio y continuar el contacto comercial.{' '}
                    <a href="/privacidad">Ver privacidad</a>.
                  </p>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleComplete} className="bono-form bono-form--questions">
                  <div className="bono-card__heading">
                    <p className="bono-kicker">Paso 2 de 2</p>
                    <h2>Contanos un poco más sobre tu empresa.</h2>
                    <p>Completá el sitio web y cuatro preguntas rápidas para que podamos entender mejor tu contexto.</p>
                  </div>

                  <div className={`bono-autosave bono-autosave--${autosaveState}`} aria-live="polite">
                    {autosaveState === 'saving' && 'Guardando avance…'}
                    {autosaveState === 'saved' && 'Avance guardado'}
                    {autosaveState === 'error' && 'Seguimos guardando tus cambios localmente. Reintentaremos con la próxima respuesta.'}
                    {autosaveState === 'idle' && 'Tus respuestas se guardan automáticamente.'}
                  </div>

                  <label>
                    <span>Sitio web</span>
                    <input inputMode="url" autoComplete="url" value={form.website} onChange={(e) => handleWebsiteChange(e.target.value)} onBlur={handleWebsiteBlur} placeholder="empresa.com.ar" />
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
                            <input type="radio" name={key} value={optionKey} checked={answers[key] === optionKey} onChange={() => handleAnswerChange(key, optionKey)} />
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
                <ResultView result={result} landing={landing} leadId={leadId} source={attribution.source} />
              )}
            </>
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
