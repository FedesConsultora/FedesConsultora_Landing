import React from 'react';
import { motion } from 'framer-motion';

const OnboardingStep0 = ({ formData, errors, onChange }) => {
    return (
        <motion.div
            className="step-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h2 className="step-title">Paso 1: Legajo de Cliente</h2>
            <p className="step-subtitle">
                Completá la información técnica y comercial para configurar tus activos digitales.
            </p>

            <div className="onboarding-block glass-block">
                <h3>Información Fiscal</h3>
                <div className="onboarding-grid">
                    <div className="field-group full-width">
                        <label>Condición frente al IVA *</label>
                        <select
                            name="taxpayerType"
                            value={formData.taxpayerType}
                            onChange={onChange}
                            className={errors.taxpayerType ? 'has-error' : ''}
                        >
                            <option value="">Seleccioná una opción</option>
                            <option value="responsable_inscripto">Responsable Inscripto</option>
                            <option value="monotributo">Monotributo</option>
                            <option value="consumidor_final">Consumidor Final</option>
                            <option value="exento">Exento</option>
                        </select>
                        {errors.taxpayerType && <span className="error-text">{errors.taxpayerType}</span>}
                    </div>

                    <div className="field-group">
                        <label>Nombre de Fantasía / Marca *</label>
                        <input
                            type="text"
                            name="fantasyName"
                            value={formData.fantasyName}
                            onChange={onChange}
                            placeholder="Ej: AgroFedes SA"
                            className={errors.fantasyName ? 'has-error' : ''}
                        />
                        {errors.fantasyName && <span className="error-text">{errors.fantasyName}</span>}
                    </div>

                    <div className="field-group">
                        <label>CUIT de la Empresa *</label>
                        <input
                            type="text"
                            name="cuit"
                            value={formData.cuit}
                            readOnly
                            className="readonly-field"
                        />
                    </div>

                    <div className="field-group">
                        <label>Contacto Principal (Nombre y Apellido) *</label>
                        <input
                            type="text"
                            name="mainContactName"
                            value={formData.mainContactName}
                            onChange={onChange}
                            className={errors.mainContactName ? 'has-error' : ''}
                        />
                        {errors.mainContactName && <span className="error-text">{errors.mainContactName}</span>}
                    </div>

                    <div className="field-group">
                        <label>Email Corporativo *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            className={errors.email ? 'has-error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                </div>
            </div>

            <div className="onboarding-block glass-block">
                <h3>Ecosistema Digital (Meta)</h3>
                <div className="info-badge">
                    Agreganos como socio en Meta Business Suite ID: <strong>629423051411438</strong>
                </div>

                <div className="sub-section">
                    <h4>Facebook</h4>
                    <div className="onboarding-grid">
                        <div className="field-group">
                            <label>URL Fanpage</label>
                            <input type="text" name="facebookUrl" value={formData.facebookUrl} onChange={onChange} />
                        </div>
                        <div className="field-group">
                            <label>Usuario Admin</label>
                            <input type="text" name="facebookAdminUser" value={formData.facebookAdminUser} onChange={onChange} />
                        </div>
                    </div>
                </div>

                <div className="sub-section mt-4">
                    <h4>Instagram</h4>
                    <div className="onboarding-grid">
                        <div className="field-group">
                            <label>Usuario @</label>
                            <input type="text" name="instagramUser" value={formData.instagramUser} onChange={onChange} />
                        </div>
                        <div className="field-group">
                            <label>Contraseña</label>
                            <input type="password" name="instagramPassword" value={formData.instagramPassword} onChange={onChange} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="onboarding-block glass-block">
                <h3>Activos en la Nube (Google Drive)</h3>
                <div className="onboarding-grid">
                    <div className="field-group">
                        <label>Carpeta de Marca (Logos, Manuales)</label>
                        <input type="text" name="driveBrandFolderUrl" value={formData.driveBrandFolderUrl} onChange={onChange} placeholder="Link de Drive" />
                    </div>
                    <div className="field-group">
                        <label>Carpeta Contenido Crudo</label>
                        <input type="text" name="driveRawContentFolderUrl" value={formData.driveRawContentFolderUrl} onChange={onChange} placeholder="Link de Drive" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default OnboardingStep0;
