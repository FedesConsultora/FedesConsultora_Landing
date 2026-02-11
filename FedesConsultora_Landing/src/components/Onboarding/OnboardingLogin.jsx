import React, { useState } from 'react';
import { motion } from 'framer-motion';

const OnboardingLogin = ({ onCuitSubmit, isLoading }) => {
    const [cuit, setCuit] = useState('');
    const [error, setError] = useState('');

    const validateCuit = (value) => {
        const cleanCuit = value.replace(/[-\s]/g, '');
        if (cleanCuit.length !== 11) {
            return 'El CUIT debe tener 11 dígitos';
        }
        if (!/^\d+$/.test(cleanCuit)) {
            return 'El CUIT debe contener solo números';
        }
        return null;
    };

    const formatCuit = (value) => {
        const cleaned = value.replace(/\D/g, '');
        const limited = cleaned.slice(0, 11);
        if (limited.length <= 2) return limited;
        if (limited.length <= 10) return `${limited.slice(0, 2)}-${limited.slice(2)}`;
        return `${limited.slice(0, 2)}-${limited.slice(2, 10)}-${limited.slice(10)}`;
    };

    const handleChange = (e) => {
        const formatted = formatCuit(e.target.value);
        setCuit(formatted);
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationError = validateCuit(cuit);
        if (validationError) {
            setError(validationError);
            return;
        }
        const cleanCuit = cuit.replace(/[-\s]/g, '');
        onCuitSubmit(cleanCuit);
    };

    return (
        <motion.div
            className="step-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h2 className="step-title">Bienvenido al Ecosistema Fedes</h2>
            <p className="step-subtitle">
                Para comenzar o retomar tu proceso, ingresá el CUIT de tu empresa.
                Guardaremos tu progreso automáticamente.
            </p>

            <div className="onboarding-block login-block">
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="field-group">
                        <label>Identificación de Empresa (CUIT)</label>
                        <input
                            type="text"
                            name="cuit"
                            value={cuit}
                            onChange={handleChange}
                            placeholder="XX-XXXXXXXX-X"
                            className={error ? 'has-error' : ''}
                            disabled={isLoading}
                            autoFocus
                        />
                        {error && <span className="error-text">{error}</span>}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-full"
                        disabled={isLoading || !cuit}
                    >
                        {isLoading ? 'Verificando...' : 'Acceder al Onboarding'}
                    </button>

                    <p className="login-note">
                        ¿Primera vez? Ingresá tu CUIT y hacé click en continuar para registrar tu legajo.
                    </p>
                </form>
            </div>
        </motion.div>
    );
};

export default OnboardingLogin;
