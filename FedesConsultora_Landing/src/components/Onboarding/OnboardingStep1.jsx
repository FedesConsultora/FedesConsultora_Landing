import React from 'react';
import { motion } from 'framer-motion';

const OnboardingStep1 = ({ formData, onChange }) => {
    return (
        <motion.div
            className="step-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h2 className="step-title">Paso 2: Profundidad Estratégica</h2>
            <p className="step-subtitle">
                Entendamos tu historia, tus objetivos y los desafíos que tenemos por delante.
            </p>

            <div className="onboarding-block glass-block">
                <h3>Identidad y Propósito</h3>
                <div className="questions-list">
                    <Question
                        label="1. ¿Quién soy y qué hago? Detallá tus unidades de negocio."
                        name="q1"
                        value={formData.q1}
                        onChange={onChange}
                    />
                    <Question
                        label="2. ¿Cuál es tu historia? (Origen, equipo, hitos)."
                        name="q2"
                        value={formData.q2}
                        onChange={onChange}
                    />
                    <Question
                        label="3. ¿Cómo te perciben tus clientes actualmente?"
                        name="q3"
                        value={formData.q3}
                        onChange={onChange}
                    />
                    <Question
                        label="4. Objetivos principales (Comerciales, Imagen, Internos)."
                        name="q4"
                        value={formData.q4}
                        onChange={onChange}
                    />
                </div>
            </div>

            <div className="onboarding-block glass-block">
                <h3>Análisis Competitivo</h3>
                <div className="questions-list">
                    <Question
                        label="5. Fortalezas principales de tu propuesta de valor."
                        name="q5"
                        value={formData.q5}
                        onChange={onChange}
                    />
                    <Question
                        label="6. ¿Quiénes son tus principales competidores?"
                        name="q10"
                        value={formData.q10}
                        onChange={onChange}
                    />
                    <Question
                        label="7. ¿Cuál es tu público objetivo o cliente ideal?"
                        name="q8"
                        value={formData.q8}
                        onChange={onChange}
                    />
                </div>
            </div>

            <div className="onboarding-block glass-block">
                <h3>Comunicación y Presupuesto</h3>
                <div className="questions-list">
                    <Question
                        label="8. ¿Cuál es tu presupuesto estimado para marketing?"
                        name="q18"
                        value={formData.q18}
                        onChange={onChange}
                    />
                    <Question
                        label="9. ¿Quién toma las decisiones finales de marketing?"
                        name="q20"
                        value={formData.q20}
                        onChange={onChange}
                    />
                </div>
            </div>
        </motion.div>
    );
};

const Question = ({ label, name, value, onChange }) => (
    <div className="field-group full-width mb-6">
        <label>{label}</label>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={3}
            placeholder="Tu respuesta detallada aquí..."
        />
    </div>
);

export default OnboardingStep1;
