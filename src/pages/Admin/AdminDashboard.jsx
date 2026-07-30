import React, { useState, useEffect, useMemo } from 'react';
import { getAllOnboardings, getAllContacts, getAnalyticsTracking } from '../../services/googleApi';
import './AdminDashboard.scss';

const ADMIN_PIN = "fedes2026";

// Labels legibles para los campos del formulario de onboarding
const FIELD_LABELS = {
    fantasyName: 'Nombre de Fantasía / Marca',
    cuit: 'CUIT',
    mainContactName: 'Contacto Principal',
    address: 'Dirección',
    email: 'Email Corporativo',
    taxpayerType: 'Condición frente al IVA',
    facebookUrl: 'URL Fanpage Facebook',
    facebookAdminUser: 'Admin Facebook',
    facebookGrantPermission: 'Permiso Meta',
    facebookBMId: 'Meta Business ID',
    instagramUser: 'Usuario Instagram',
    instagramPassword: 'Contraseña Instagram',
    instagramFollowers: 'Seguidores Instagram',
    tiktokUser: 'Usuario TikTok',
    tiktokPassword: 'Contraseña TikTok',
    tiktokFollowers: 'Seguidores TikTok',
    youtubeUrl: 'URL YouTube',
    youtubeAddAdmin: 'Admin YouTube',
    linkedinUrl: 'URL LinkedIn',
    linkedinAddFede: 'Admin LinkedIn',
    usesOtherChannels: '¿Usa otros canales?',
    otherChannelsDetail: 'Detalle otros canales',
    driveBrandFolderUrl: 'Carpeta Marca (Drive)',
    driveRawContentFolderUrl: 'Carpeta Contenido Crudo (Drive)',
};

const QUESTION_LABELS = {
    q1: '1. ¿Quién soy y qué hago? Unidades de negocio.',
    q2: '2. ¿Cuál es tu historia? (Origen, equipo, hitos)',
    q3: '3. ¿Cómo te perciben tus clientes actualmente?',
    q4: '4. Objetivos principales (Comerciales, Imagen, Internos)',
    q5: '5. Fortalezas principales de tu propuesta de valor',
    q6: '6. Debilidades o limitaciones actuales',
    q7: '7. Propuesta de valor diferencial',
    q8: '8. Público objetivo o cliente ideal',
    q9: '9. Buyer persona principal',
    q10: '10. Principales competidores (Fortalezas y Debilidades)',
    q11: '11. Oportunidades de crecimiento detectadas',
    q12: '12. Amenazas o riesgos del entorno',
    q13: '13. ¿Cómo me siento cómodo comunicando?',
    q14: '14. Contactos y bases de datos actuales',
    q15: '15. Claims o frases de marca',
    q16: '16. Acciones de marketing realizadas hasta ahora',
    q17: '17. Objetivos de marketing a corto y largo plazo',
    q18: '18. Presupuesto estimado de marketing',
    q19: '19. Calendario / Agenda de activaciones',
    q20: '20. ¿Quién toma las decisiones de marketing?',
};

const TAXPAYER_LABELS = {
    responsable_inscripto: 'Responsable Inscripto',
    monotributo: 'Monotributo',
    consumidor_final: 'Consumidor Final',
    exento: 'Exento',
};

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [authError, setAuthError] = useState('');

    const [activeTab, setActiveTab] = useState('onboardings'); // 'onboardings' | 'contactos' | 'analytics'
    const [onboardings, setOnboardings] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [trackingEvents, setTrackingEvents] = useState([]);

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOnboarding, setSelectedOnboarding] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [showRawJson, setShowRawJson] = useState(false);

    // Filtro temporal para Analytics
    const [timeFilter, setTimeFilter] = useState('all'); // 'today' | 'week' | 'month' | 'all'

    useEffect(() => {
        const savedAuth = sessionStorage.getItem('fedes_admin_auth');
        if (savedAuth === 'true') setIsAuthenticated(true);
    }, []);

    useEffect(() => {
        if (isAuthenticated) loadAllData();
    }, [isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (pinInput === ADMIN_PIN) {
            setIsAuthenticated(true);
            sessionStorage.setItem('fedes_admin_auth', 'true');
            setAuthError('');
        } else {
            setAuthError('PIN incorrecto. Intente nuevamente.');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('fedes_admin_auth');
    };

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [onbData, cntData, trkData] = await Promise.all([
                getAllOnboardings(),
                getAllContacts(),
                getAnalyticsTracking()
            ]);
            setOnboardings(onbData);
            setContacts(cntData);
            setTrackingEvents(trkData);
        } catch (err) {
            console.error("Error cargando datos:", err);
        } finally {
            setLoading(false);
        }
    };

    // =============================================
    // PROCESAMIENTO DE ANALÍTICAS / METRICAS
    // =============================================
    const filteredTracking = useMemo(() => {
        if (timeFilter === 'all') return trackingEvents;
        const now = new Date();
        return trackingEvents.filter(event => {
            const evDate = new Date(event.timestamp || event["Fecha/Hora"] || event.date);
            if (isNaN(evDate.getTime())) return true;
            const diffDays = (now - evDate) / (1000 * 60 * 60 * 24);
            if (timeFilter === 'today') return diffDays < 1;
            if (timeFilter === 'week') return diffDays < 7;
            if (timeFilter === 'month') return diffDays < 30;
            return true;
        });
    }, [trackingEvents, timeFilter]);

    const analyticsStats = useMemo(() => {
        const stats = {
            totalClicks: filteredTracking.length,
            viewsByPage: {},
            clicksByCategory: {},
            topLabels: {}
        };

        filteredTracking.forEach(ev => {
            const category = ev.category || ev["Categoría"] || ev.categoria || 'Otros';
            const label = ev.label || ev["Etiqueta"] || ev.etiqueta || 'General';
            const url = ev.url || ev["URL"] || '/';

            stats.viewsByPage[url] = (stats.viewsByPage[url] || 0) + 1;
            stats.clicksByCategory[category] = (stats.clicksByCategory[category] || 0) + 1;
            
            const key = `${category} → ${label}`;
            stats.topLabels[key] = (stats.topLabels[key] || 0) + 1;
        });

        // Convertir a arrays ordenados
        const topPages = Object.entries(stats.viewsByPage)
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count);

        const topCategories = Object.entries(stats.clicksByCategory)
            .map(([cat, count]) => ({ cat, count }))
            .sort((a, b) => b.count - a.count);

        const topInteractions = Object.entries(stats.topLabels)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        return { total: stats.totalClicks, topPages, topCategories, topInteractions };
    }, [filteredTracking]);

    // Filtros de tabla Onboarding
    const filteredOnboardings = onboardings.filter((item) => {
        const query = searchTerm.toLowerCase();
        return (
            String(item.cuit || '').toLowerCase().includes(query) ||
            String(item.formData?.fantasyName || '').toLowerCase().includes(query) ||
            String(item.formData?.mainContactName || '').toLowerCase().includes(query) ||
            String(item.formData?.email || '').toLowerCase().includes(query)
        );
    });

    // Filtros de tabla Contactos
    const filteredContacts = contacts.filter((c) => {
        const query = searchTerm.toLowerCase();
        const nombre = c.nombre || c["Nombre"] || '';
        const email = c.email || c["Email"] || '';
        const empresa = c.empresa || c["Empresa"] || '';
        const servicio = c.servicio || c["Servicio"] || '';
        return (
            nombre.toLowerCase().includes(query) ||
            email.toLowerCase().includes(query) ||
            empresa.toLowerCase().includes(query) ||
            servicio.toLowerCase().includes(query)
        );
    });

    const completedOnboardings = onboardings.filter(o => o.isCompleted).length;
    const inProgressOnboardings = onboardings.filter(o => !o.isCompleted).length;

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch { return String(dateStr); }
    };

    const displayValue = (val) => {
        if (!val || String(val).trim() === '') return null;
        return String(val);
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-page">
                <div className="admin-auth-card">
                    <span className="admin-badge">🔒 Acceso Reservado</span>
                    <div className="auth-icon">🛡️</div>
                    <h2>Panel de Administración</h2>
                    <p>Ingresá la clave de acceso de Fedes Consultora para continuar al panel de gestión.</p>
                    <form onSubmit={handleLogin} className="auth-form">
                        <input
                            type="password"
                            placeholder="Ingrese PIN"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            autoFocus
                        />
                        {authError && <span className="error-msg">{authError}</span>}
                        <button type="submit" className="btn-admin">Acceder al Panel</button>
                    </form>
                </div>
            </div>
        );
    }

    // =============================================
    // MODAL DETALLE ONBOARDING
    // =============================================
    const renderOnboardingModal = () => {
        if (!selectedOnboarding) return null;
        const fd = selectedOnboarding.formData || {};

        const questionEntries = Object.entries(fd)
            .filter(([key]) => /^q\d+$/.test(key) && fd[key] && String(fd[key]).trim() !== '')
            .sort(([a], [b]) => parseInt(a.replace('q', '')) - parseInt(b.replace('q', '')));

        const infoFields = ['fantasyName', 'cuit', 'mainContactName', 'address', 'email', 'taxpayerType'];
        const socialFields = [
            'facebookUrl', 'facebookAdminUser', 'facebookGrantPermission', 'facebookBMId',
            'instagramUser', 'instagramPassword', 'instagramFollowers',
            'tiktokUser', 'tiktokPassword', 'tiktokFollowers',
            'youtubeUrl', 'youtubeAddAdmin',
            'linkedinUrl', 'linkedinAddFede',
            'usesOtherChannels', 'otherChannelsDetail',
        ];
        const driveFields = ['driveBrandFolderUrl', 'driveRawContentFolderUrl'];

        return (
            <div className="modal-overlay" onClick={() => { setSelectedOnboarding(null); setShowRawJson(false); }}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="modal-header-left">
                            <h3>{fd.fantasyName || `CUIT ${selectedOnboarding.cuit}`}</h3>
                            <span className={`modal-status ${selectedOnboarding.isCompleted ? 'completed' : 'in-progress'}`}>
                                {selectedOnboarding.isCompleted ? 'Completado' : 'En Progreso'}
                            </span>
                        </div>
                        <button className="close-btn" onClick={() => { setSelectedOnboarding(null); setShowRawJson(false); }}>×</button>
                    </div>

                    <div className="modal-body">
                        <div className="detail-section">
                            <div className="detail-section-title">📋 Información Fiscal y Contacto</div>
                            <div className="detail-grid">
                                {infoFields.map(key => {
                                    let val = fd[key];
                                    if (key === 'taxpayerType') val = TAXPAYER_LABELS[val] || val;
                                    return (
                                        <div className="detail-item" key={key}>
                                            <label>{FIELD_LABELS[key] || key}</label>
                                            <p className={!displayValue(val) ? 'empty' : ''}>
                                                {displayValue(val) || 'Sin completar'}
                                            </p>
                                        </div>
                                    );
                                })}
                                <div className="detail-item">
                                    <label>Paso Actual</label>
                                    <p>Paso {selectedOnboarding.currentStep}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Última Actualización</label>
                                    <p>{formatDate(selectedOnboarding.lastUpdated)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <div className="detail-section-title">🌐 Ecosistema Digital (Redes y Meta)</div>
                            <div className="detail-grid">
                                {socialFields.map(key => {
                                    const val = displayValue(fd[key]);
                                    if (!val) return null;
                                    return (
                                        <div className="detail-item" key={key}>
                                            <label>{FIELD_LABELS[key] || key}</label>
                                            <p>{val}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="detail-section">
                            <div className="detail-section-title">☁️ Activos en la Nube (Google Drive)</div>
                            <div className="detail-grid">
                                {driveFields.map(key => (
                                    <div className="detail-item" key={key}>
                                        <label>{FIELD_LABELS[key] || key}</label>
                                        <p className={!displayValue(fd[key]) ? 'empty' : ''}>
                                            {displayValue(fd[key]) || 'Sin completar'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {questionEntries.length > 0 && (
                            <div className="detail-section">
                                <div className="detail-section-title">🎯 Profundidad Estratégica (Respuestas)</div>
                                <div className="detail-grid">
                                    {questionEntries.map(([key, val]) => (
                                        <div className="detail-item full-width" key={key}>
                                            <label>{QUESTION_LABELS[key] || key}</label>
                                            <div className="answer-text">{val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="json-toggle">
                            <button
                                className="json-toggle-btn"
                                onClick={() => setShowRawJson(!showRawJson)}
                            >
                                {showRawJson ? '▾ Ocultar' : '▸ Mostrar'} datos JSON completos
                            </button>
                            {showRawJson && (
                                <pre className="json-preview">
                                    {JSON.stringify(fd, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // =============================================
    // MODAL DETALLE CONTACTO
    // =============================================
    const renderContactModal = () => {
        if (!selectedContact) return null;
        const c = selectedContact;
        const nombre = c.nombre || c["Nombre"] || 'Sin Nombre';
        const email = c.email || c["Email"] || '-';
        const telefono = c.telefono || c["Teléfono"] || c["Telefono"] || '-';
        const empresa = c.empresa || c["Empresa"] || '-';
        const servicio = c.servicio || c["Servicio"] || '-';
        const mensaje = c.mensaje || c["Mensaje"] || '-';
        const fecha = c.timestamp || c["Fecha"] || c["Timestamp"] || '';

        return (
            <div className="modal-overlay" onClick={() => setSelectedContact(null)}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="modal-header-left">
                            <h3>Consulta de {nombre}</h3>
                            <span className="modal-status completed">{servicio}</span>
                        </div>
                        <button className="close-btn" onClick={() => setSelectedContact(null)}>×</button>
                    </div>

                    <div className="modal-body">
                        <div className="detail-section">
                            <div className="detail-section-title">👤 Datos del Contacto</div>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Nombre y Apellido</label>
                                    <p>{nombre}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Email</label>
                                    <p><a href={`mailto:${email}`} style={{ color: '#38bdf8' }}>{email}</a></p>
                                </div>
                                <div className="detail-item">
                                    <label>Teléfono / WhatsApp</label>
                                    <p>{telefono}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Empresa</label>
                                    <p>{empresa}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Fecha de Consulta</label>
                                    <p>{formatDate(fecha)}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Servicio de Interés</label>
                                    <p>{servicio}</p>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <div className="detail-section-title">💬 Mensaje / Consulta</div>
                            <div className="detail-item full-width">
                                <div className="answer-text">{mensaje}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-page">
            <div className="admin-container">
                <header className="admin-header">
                    <div className="header-title">
                        <h1>Panel Admin — <span>Fedes</span></h1>
                        <p>Gestión centralizada de Onboardings, Consultas y Métricas de Analítica</p>
                    </div>
                    <div className="admin-nav">
                        <button
                            className={`nav-btn ${activeTab === 'onboardings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('onboardings')}
                        >
                            📋 Onboardings ({onboardings.length})
                        </button>
                        <button
                            className={`nav-btn ${activeTab === 'contactos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contactos')}
                        >
                            📬 Consultas ({contacts.length})
                        </button>
                        <button
                            className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            📈 Analítica ({trackingEvents.length})
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>Salir</button>
                    </div>
                </header>

                {/* STATS GENERALES DE BARRA */}
                <div className="stats-bar">
                    <div className="stat-card">
                        <div className="stat-icon blue">📊</div>
                        <div className="stat-info">
                            <div className="stat-value">{onboardings.length}</div>
                            <div className="stat-label">Legajos Onboarding</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">📬</div>
                        <div className="stat-info">
                            <div className="stat-value">{contacts.length}</div>
                            <div className="stat-label">Consultas Recibidas</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple">👁️</div>
                        <div className="stat-info">
                            <div className="stat-value">{trackingEvents.length}</div>
                            <div className="stat-label">Clicks & Cargas Totales</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon amber">⏳</div>
                        <div className="stat-info">
                            <div className="stat-value">{inProgressOnboardings}</div>
                            <div className="stat-label">Onboardings en Progreso</div>
                        </div>
                    </div>
                </div>

                {/* TAB 1: ONBOARDINGS */}
                {activeTab === 'onboardings' && (
                    <section className="admin-section">
                        <div className="section-header">
                            <h2>Legajos de Onboarding ({filteredOnboardings.length})</h2>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Buscar por CUIT, Nombre, Email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner" />
                                <span>Cargando registros...</span>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>CUIT</th>
                                            <th>Empresa / Marca</th>
                                            <th>Contacto</th>
                                            <th>Email</th>
                                            <th>Paso</th>
                                            <th>Actualización</th>
                                            <th>Estado</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOnboardings.map((item, idx) => (
                                            <tr key={idx} className={item.isCompleted ? 'completed' : ''}>
                                                <td className="cuit-cell">{item.cuit}</td>
                                                <td>{item.formData?.fantasyName || <span style={{ color: '#7a8599' }}>—</span>}</td>
                                                <td>{item.formData?.mainContactName || <span style={{ color: '#7a8599' }}>—</span>}</td>
                                                <td>{item.formData?.email || <span style={{ color: '#7a8599' }}>—</span>}</td>
                                                <td>Paso {item.currentStep}</td>
                                                <td>{formatDate(item.lastUpdated)}</td>
                                                <td>
                                                    <span className={`status-tag ${item.isCompleted ? 'completed' : 'in-progress'}`}>
                                                        {item.isCompleted ? 'Completado' : 'En Progreso'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn-view" onClick={() => setSelectedOnboarding(item)}>
                                                        Ver Detalle
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredOnboardings.length === 0 && (
                                            <tr className="empty-row">
                                                <td colSpan="8">No se encontraron registros de onboarding.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* TAB 2: CONSULTAS Y CONTACTO */}
                {activeTab === 'contactos' && (
                    <section className="admin-section">
                        <div className="section-header">
                            <h2>Formularios de Contacto Recibidos ({filteredContacts.length})</h2>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Buscar por Nombre, Email, Empresa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner" />
                                <span>Cargando consultas...</span>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Empresa</th>
                                            <th>Email</th>
                                            <th>Teléfono</th>
                                            <th>Servicio Interés</th>
                                            <th>Fecha</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredContacts.map((c, idx) => {
                                            const nombre = c.nombre || c["Nombre"] || 'Sin Nombre';
                                            const empresa = c.empresa || c["Empresa"] || '—';
                                            const email = c.email || c["Email"] || '—';
                                            const telefono = c.telefono || c["Teléfono"] || c["Telefono"] || '—';
                                            const servicio = c.servicio || c["Servicio"] || 'General';
                                            const fecha = c.timestamp || c["Fecha"] || c["Timestamp"] || '';

                                            return (
                                                <tr key={idx}>
                                                    <td className="cuit-cell">{nombre}</td>
                                                    <td>{empresa}</td>
                                                    <td>{email}</td>
                                                    <td>{telefono}</td>
                                                    <td>
                                                        <span className="status-tag completed">
                                                            {servicio}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(fecha)}</td>
                                                    <td>
                                                        <button className="btn-view" onClick={() => setSelectedContact(c)}>
                                                            Ver Consulta
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredContacts.length === 0 && (
                                            <tr className="empty-row">
                                                <td colSpan="7">No se encontraron consultas registradas.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* TAB 3: ANALÍTICA Y TRACKING DE CLICKS VISUAL */}
                {activeTab === 'analytics' && (
                    <section className="admin-section">
                        <div className="section-header">
                            <div>
                                <h2>Analítica de Clicks e Interacciones</h2>
                                <p style={{ fontSize: '0.8rem', color: '#7a8599', marginTop: '0.2rem' }}>
                                    Resumen visual de las páginas más visitadas y los botones más cliqueados.
                                </p>
                            </div>
                            <div className="time-filter-buttons">
                                <button
                                    className={`filter-chip ${timeFilter === 'today' ? 'active' : ''}`}
                                    onClick={() => setTimeFilter('today')}
                                >
                                    Hoy
                                </button>
                                <button
                                    className={`filter-chip ${timeFilter === 'week' ? 'active' : ''}`}
                                    onClick={() => setTimeFilter('week')}
                                >
                                    Última Semana
                                </button>
                                <button
                                    className={`filter-chip ${timeFilter === 'month' ? 'active' : ''}`}
                                    onClick={() => setTimeFilter('month')}
                                >
                                    Último Mes
                                </button>
                                <button
                                    className={`filter-chip ${timeFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setTimeFilter('all')}
                                >
                                    Histórico Completo
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner" />
                                <span>Cargando datos de analítica...</span>
                            </div>
                        ) : (
                            <div className="analytics-dashboard">
                                {/* METRICAS PRINCIPALES */}
                                <div className="analytics-grid">
                                    {/* SECCIÓN 1: PÁGINAS MÁS VISITADAS */}
                                    <div className="analytics-card">
                                        <div className="card-title">
                                            <span>🌐</span> Páginas más Vistas
                                        </div>
                                        <div className="bars-list">
                                            {analyticsStats.topPages.map(({ path, count }) => {
                                                const percentage = Math.round((count / (analyticsStats.total || 1)) * 100);
                                                return (
                                                    <div key={path} className="bar-item">
                                                        <div className="bar-labels">
                                                            <span className="bar-name">{path}</span>
                                                            <span className="bar-val">{count} vistas ({percentage}%)</span>
                                                        </div>
                                                        <div className="bar-track">
                                                            <div className="bar-fill blue" style={{ width: `${Math.max(percentage, 6)}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {analyticsStats.topPages.length === 0 && (
                                                <p className="empty-text">Sin datos de vistas en este período.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* SECCIÓN 2: INTERACCIONES DESTACADAS */}
                                    <div className="analytics-card">
                                        <div className="card-title">
                                            <span>🔥</span> Botones & Clics más Populares
                                        </div>
                                        <div className="bars-list">
                                            {analyticsStats.topInteractions.map(({ name, count }) => {
                                                const percentage = Math.round((count / (analyticsStats.total || 1)) * 100);
                                                return (
                                                    <div key={name} className="bar-item">
                                                        <div className="bar-labels">
                                                            <span className="bar-name">{name}</span>
                                                            <span className="bar-val">{count} clics</span>
                                                        </div>
                                                        <div className="bar-track">
                                                            <div className="bar-fill purple" style={{ width: `${Math.max(percentage, 6)}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {analyticsStats.topInteractions.length === 0 && (
                                                <p className="empty-text">Sin datos de clics en este período.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* LISTADO DE EVENTOS RECIENTES */}
                                <div className="analytics-timeline">
                                    <div className="card-title" style={{ marginBottom: '1.25rem' }}>
                                        <span>⏱️</span> Línea de Tiempo de Interacciones Recientes
                                    </div>
                                    <div className="timeline-list">
                                        {filteredTracking.slice(0, 15).map((ev, idx) => {
                                            const category = ev.category || ev["Categoría"] || ev.categoria || 'Evento';
                                            const label = ev.label || ev["Etiqueta"] || ev.etiqueta || '-';
                                            const value = ev.value || ev["Valor"] || ev.valor || '';
                                            const url = ev.url || ev["URL"] || '/';
                                            const date = ev.timestamp || ev["Fecha/Hora"] || ev.date;

                                            return (
                                                <div key={idx} className="timeline-item">
                                                    <div className="timeline-dot" />
                                                    <div className="timeline-content">
                                                        <div className="timeline-header">
                                                            <span className="ev-category">{category}</span>
                                                            <span className="ev-time">{formatDate(date)}</span>
                                                        </div>
                                                        <div className="ev-body">
                                                            <strong>{label}</strong> {value && `— ${value}`} en <code className="ev-url">{url}</code>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredTracking.length === 0 && (
                                            <p className="empty-text">No hay eventos registrados en la línea de tiempo.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* MODALES DE DETALLE */}
                {renderOnboardingModal()}
                {renderContactModal()}
            </div>
        </div>
    );
};

export default AdminDashboard;
