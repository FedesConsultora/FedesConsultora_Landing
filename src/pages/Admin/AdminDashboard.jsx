import React, { useState, useEffect } from 'react';
import { getAllOnboardings } from '../../services/googleApi';
import './AdminDashboard.scss';

const ADMIN_PIN = "fedes2026";

// Labels legibles para los campos del formulario
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

    const [onboardings, setOnboardings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOnboarding, setSelectedOnboarding] = useState(null);
    const [showRawJson, setShowRawJson] = useState(false);

    useEffect(() => {
        const savedAuth = sessionStorage.getItem('fedes_admin_auth');
        if (savedAuth === 'true') setIsAuthenticated(true);
    }, []);

    useEffect(() => {
        if (isAuthenticated) loadData();
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

    const loadData = async () => {
        setLoading(true);
        const data = await getAllOnboardings();
        setOnboardings(data);
        setLoading(false);
    };

    const filteredOnboardings = onboardings.filter((item) => {
        const query = searchTerm.toLowerCase();
        return (
            String(item.cuit || '').toLowerCase().includes(query) ||
            String(item.formData?.fantasyName || '').toLowerCase().includes(query) ||
            String(item.formData?.mainContactName || '').toLowerCase().includes(query) ||
            String(item.formData?.email || '').toLowerCase().includes(query)
        );
    });

    const completedCount = onboardings.filter(o => o.isCompleted).length;
    const inProgressCount = onboardings.filter(o => !o.isCompleted).length;

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

    const renderDetailModal = () => {
        if (!selectedOnboarding) return null;
        const fd = selectedOnboarding.formData || {};

        const questionEntries = Object.entries(fd)
            .filter(([key]) => /^q\d+$/.test(key) && fd[key] && String(fd[key]).trim() !== '')
            .sort(([a], [b]) => parseInt(a.replace('q', '')) - parseInt(b.replace('q', '')));

        const infoFields = [
            'fantasyName', 'cuit', 'mainContactName', 'address', 'email', 'taxpayerType',
        ];
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
                        {/* INFORMACIÓN FISCAL */}
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

                        {/* REDES SOCIALES */}
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
                                {socialFields.every(key => !displayValue(fd[key])) && (
                                    <div className="detail-item full-width">
                                        <label>Estado</label>
                                        <p className="empty">Sin datos de redes sociales cargados</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* GOOGLE DRIVE */}
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

                        {/* PREGUNTAS ESTRATÉGICAS */}
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

                        {/* JSON RAW */}
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

    return (
        <div className="admin-page">
            <div className="admin-container">
                <header className="admin-header">
                    <div className="header-title">
                        <h1>Panel Admin — <span>Fedes</span></h1>
                        <p>Gestión centralizada de Legajos de Onboarding de Empresas</p>
                    </div>
                    <div className="admin-nav">
                        <button className="logout-btn" onClick={handleLogout}>Salir</button>
                    </div>
                </header>

                {/* STATS BAR */}
                <div className="stats-bar">
                    <div className="stat-card">
                        <div className="stat-icon blue">📊</div>
                        <div className="stat-info">
                            <div className="stat-value">{onboardings.length}</div>
                            <div className="stat-label">Total Registrados</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">✅</div>
                        <div className="stat-info">
                            <div className="stat-value">{completedCount}</div>
                            <div className="stat-label">Completados</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon amber">⏳</div>
                        <div className="stat-info">
                            <div className="stat-value">{inProgressCount}</div>
                            <div className="stat-label">En Progreso</div>
                        </div>
                    </div>
                </div>

                {/* TABLE ONBOARDINGS */}
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

                {renderDetailModal()}
            </div>
        </div>
    );
};

export default AdminDashboard;
