import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingLogin from '../../components/Onboarding/OnboardingLogin';
import OnboardingStep0 from '../../components/Onboarding/OnboardingStep0';
import OnboardingStep1 from '../../components/Onboarding/OnboardingStep1';
import {
    enviarOnboardingStep0,
    enviarOnboardingStep1,
    saveOnboardingProgress,
    getOnboardingProgress,
} from '../../services/googleApi';
import { Player } from "@lottiefiles/react-lottie-player";
import lottieSuccess from "../../assets/lotties/coheteThankYou.json";
import "./OnboardingEmpresas.scss";

const OnboardingEmpresas = () => {
    const [currentStep, setCurrentStep] = useState(0); // 0 = Login, 1 = Legajo, 2 = Preguntas
    const [cuit, setCuit] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [errors, setErrors] = useState({});
    const autoSaveTimeoutRef = useRef(null);

    const [formData, setFormData] = useState({
        fantasyName: '',
        cuit: '',
        mainContactName: '',
        address: '',
        email: '',
        taxpayerType: '',
        facebookUrl: '',
        facebookAdminUser: '',
        instagramUser: '',
        instagramPassword: '',
        driveBrandFolderUrl: '',
        driveRawContentFolderUrl: '',
        q1: '', q2: '', q3: '', q4: '', q5: '', q8: '', q10: '', q18: '', q20: '',
    });

    const isDirty = useMemo(
        () => Object.values(formData).some((value) => value && String(value).trim() !== ''),
        [formData]
    );

    const autoSaveProgress = useCallback(async () => {
        if (!cuit || currentStep === 0 || isSubmitted) return;
        try {
            await saveOnboardingProgress(cuit, formData, currentStep);
            setProgressMessage('Progreso guardado automáticamente');
            setTimeout(() => setProgressMessage(''), 3000);
        } catch (error) {
            console.error('Error auto-guardando:', error);
        }
    }, [cuit, formData, currentStep, isSubmitted]);

    useEffect(() => {
        if (!cuit || currentStep === 0 || isSubmitted) return;
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = setTimeout(() => {
            autoSaveProgress();
        }, 5000);
        return () => {
            if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        };
    }, [formData, autoSaveProgress, cuit, currentStep, isSubmitted]);

    const handleCuitSubmit = async (submittedCuit) => {
        setIsLoadingProgress(true);
        setCuit(submittedCuit);
        try {
            const progress = await getOnboardingProgress(submittedCuit);
            if (progress && progress.formData && !progress.isCompleted) {
                setFormData(progress.formData);
                setCurrentStep(progress.currentStep || 1);
                setProgressMessage('✓ Progreso anterior recuperado');
                setTimeout(() => setProgressMessage(''), 3000);
            } else {
                setFormData((prev) => ({ ...prev, cuit: submittedCuit }));
                setCurrentStep(1);
            }
        } catch (error) {
            setFormData((prev) => ({ ...prev, cuit: submittedCuit }));
            setCurrentStep(1);
        } finally {
            setIsLoadingProgress(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validateStep0 = () => {
        const newErrors = {};
        if (!formData.fantasyName?.trim()) newErrors.fantasyName = 'Campo obligatorio';
        if (!formData.mainContactName?.trim()) newErrors.mainContactName = 'Campo obligatorio';
        if (!formData.email?.trim()) newErrors.email = 'Campo obligatorio';
        if (!formData.taxpayerType?.trim()) newErrors.taxpayerType = 'Seleccioná una opción';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (currentStep === 1) {
            if (!validateStep0()) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            try {
                await enviarOnboardingStep0(formData);
                await saveOnboardingProgress(cuit, formData, 2);
            } catch (error) {
                console.error('Error enviando STEP 0:', error);
            }
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStep === 2) setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await enviarOnboardingStep1(formData);
            await saveOnboardingProgress(cuit, formData, currentStep, true);
            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error enviando STEP 1:', error);
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                <header className="onboarding-header">
                    <span className="overline">Onboarding de Clientes</span>
                    <h1>Impulsamos tu Marca <span>desde la Raíz.</span></h1>
                    <p className="description">
                        Completá este proceso para que podamos entender tu negocio, configurar tus activos digitales y diseñar una estrategia de alto impacto.
                    </p>
                </header>

                <div className="onboarding-layout">
                    <aside className="onboarding-sidebar">
                        <div className="onboarding-steps">
                            <div className={`step-item ${currentStep === 0 ? 'active' : ''} ${currentStep > 0 ? 'completed' : ''}`}>
                                <div className="step-circle">0</div>
                                <div className="step-label">Acceso</div>
                            </div>
                            <div className={`step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                                <div className="step-circle">1</div>
                                <div className="step-label">Legajo</div>
                            </div>
                            <div className={`step-item ${currentStep === 2 ? 'active' : ''} ${isSubmitted ? 'completed' : ''}`}>
                                <div className="step-circle">2</div>
                                <div className="step-label">Estrategia</div>
                            </div>
                        </div>

                        <div className="sidebar-card">
                            <h3>¿Por qué estos datos?</h3>
                            <p>Tu información nos permite:</p>
                            <ul>
                                <li>Auditar correctamente tus redes.</li>
                                <li>Conocer tus valores diferenciales.</li>
                                <li>Optimizar la inversión en pauta.</li>
                            </ul>
                        </div>
                    </aside>

                    <main className="onboarding-form">
                        <AnimatePresence mode="wait">
                            {currentStep === 0 && (
                                <OnboardingLogin key="login" onCuitSubmit={handleCuitSubmit} isLoading={isLoadingProgress} />
                            )}
                            {currentStep === 1 && (
                                <OnboardingStep0 key="step0" formData={formData} errors={errors} onChange={handleChange} />
                            )}
                            {currentStep === 2 && !isSubmitted && (
                                <OnboardingStep1 key="step1" formData={formData} onChange={handleChange} />
                            )}
                            {isSubmitted && (
                                <motion.div
                                    key="success"
                                    className="step-content text-center"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Player
                                        autoplay
                                        loop={false}
                                        keepLastFrame
                                        src={lottieSuccess}
                                        style={{ height: "200px", width: "200px", margin: "0 auto" }}
                                    />
                                    <h2 className="step-title">¡Onboarding Completado!</h2>
                                    <p className="step-subtitle">Tu información ha sido recibida correctamente. Ya podemos empezar a trabajar en tu estrategia.</p>
                                    <a href="/" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Ir al Inicio</a>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isSubmitted && currentStep > 0 && (
                            <div className="onboarding-actions">
                                {currentStep === 2 && (
                                    <button type="button" className="btn-secondary" onClick={handleBack}>
                                        Paso Anterior
                                    </button>
                                )}

                                {currentStep === 1 ? (
                                    <button type="button" className="btn-primary" onClick={handleNext}>
                                        Siguiente: Estrategia
                                    </button>
                                ) : (
                                    <button type="button" className="btn-primary" onClick={handleSubmit}>
                                        Finalizar Onboarding
                                    </button>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <AnimatePresence>
                {progressMessage && (
                    <motion.div
                        className="progress-notif"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        {progressMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OnboardingEmpresas;
