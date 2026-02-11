import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import FediAvatar from '../../../assets/img/fedi/avatar.png';
import './FediWidget.scss';

const FediWidget = () => {
    const [isRocketVisible, setIsRocketVisible] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');
    const [userInput, setUserInput] = useState('');
    const iframeRef = useRef(null);

    const BASE_URL = 'https://bot.fedes.ai';

    const isChatOpenRef = useRef(false);
    const isReadyRef = useRef(false);
    const pendingMessageRef = useRef(null);

    useEffect(() => {
        isChatOpenRef.current = isChatOpen;
    }, [isChatOpen]);

    useEffect(() => {
        const handleIframeMessage = (event) => {
            if (event.origin !== BASE_URL) return;
            const { type, action, url, message } = event.data;

            if (type === 'fedi:ready') {
                console.log('Fedi Robot is ready');
                isReadyRef.current = true;

                if (pendingMessageRef.current) {
                    iframeRef.current?.contentWindow?.postMessage({
                        type: 'fedi:send_message',
                        payload: pendingMessageRef.current
                    }, '*');
                    pendingMessageRef.current = null;
                }
            }

            if (type === 'fedi:user_message') console.log("Fedi User Input:", message);
            if (type === 'fedi:action' && action === 'whatsapp_open') {
                console.log('Fedi Lead Captured! WhatsApp:', url);
            }
        };

        const handleOpenRequest = (e) => {
            const message = e.detail?.message || '';
            if (!message) return;

            setIsRocketVisible(true);
            setIsChatOpen(true);

            if (isChatOpenRef.current && isReadyRef.current) {
                iframeRef.current?.contentWindow?.postMessage({
                    type: 'fedi:send_message',
                    payload: message
                }, '*');
            } else {
                pendingMessageRef.current = message;
                setCurrentMessage(message);
            }
        };

        const handleToggle = () => {
            if (!isRocketVisible) {
                setIsRocketVisible(true);
            } else {
                setIsChatOpen(prev => !prev);
            }
        };

        window.addEventListener('message', handleIframeMessage);
        window.addEventListener('open-fedi', handleOpenRequest);
        window.addEventListener('toggle-fedi', handleToggle);

        return () => {
            window.removeEventListener('message', handleIframeMessage);
            window.removeEventListener('open-fedi', handleOpenRequest);
            window.removeEventListener('toggle-fedi', handleToggle);
        };
    }, [isRocketVisible]);

    const toggleToRocket = (e) => {
        e.stopPropagation();
        setIsRocketVisible(true);
    };


    const [showNotification, setShowNotification] = useState(true);
    const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);

    useEffect(() => {
        // Hide welcome bubble after a while or if chat opened
        const timer = setTimeout(() => setShowWelcomeBubble(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    const toggleChat = (e) => {
        e.stopPropagation();
        setIsChatOpen(!isChatOpen);
        setShowNotification(false);
        setShowWelcomeBubble(false);
        if (isChatOpen) setCurrentMessage('');
    };

    const closeEverything = (e) => {
        if (e) e.stopPropagation();
        setIsChatOpen(false);
        setIsRocketVisible(false);
        setCurrentMessage('');
        setUserInput('');
        isReadyRef.current = false;
        pendingMessageRef.current = null;
    };

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!userInput.trim()) return;

        iframeRef.current?.contentWindow?.postMessage({
            type: 'fedi:send_message',
            payload: userInput
        }, '*');

        setUserInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        iframeRef.current?.contentWindow?.postMessage({
            type: 'fedi:send_message',
            payload: suggestion
        }, '*');
    };

    const iframeSrc = `${BASE_URL}/?widget=true&theme=light`;

    return (
        <div className={`fedi-main-wrapper ${isRocketVisible ? 'rocket-visible' : ''} ${isChatOpen ? 'chat-open' : ''}`}>
            <AnimatePresence>
                {!isRocketVisible && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fedi-menu-btn"
                        onClick={toggleToRocket}
                        aria-label="Abrir asistente de Fedi"
                    >
                        {showNotification && <span className="notification-badge" />}
                        <Sparkles className="ai-menu-icon" size={28} />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isRocketVisible && !isChatOpen && (
                    <div className="fedi-rocket-outer">
                        <AnimatePresence>
                            {showWelcomeBubble && (
                                <motion.div
                                    className="fedi-welcome-bubble"
                                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    ¡Hola! Soy Fedi, <br /> ¿en qué puedo ayudarte?
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                            className="fedi-rocket-trigger-wrapper"
                            onClick={toggleChat}
                        >
                            {showNotification && <span className="notification-badge big" />}
                            <div className="circular-text">
                                <svg viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                                    <path d="M 10,50 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" id="circle" fill="transparent" />
                                    <text fill="#19222B" fontSize="11" fontWeight="900">
                                        <textPath xlinkHref="#circle" startOffset="0%">
                                            FEDI TE AYUDA A ESCALAR
                                        </textPath>
                                    </text>

                                    <g className="rocket-icon rocket-1" fill="#19222B">
                                        <path d="M0-100c10 20 30 60 30 120 0 15-5 30-10 40H-20c-5-10-10-25-10-40 0-60 20-100 30-120z" />
                                        <path d="M-30 20l-30 40h30V20zM30 20l30 40h-30V20z" />
                                        <circle cx="0" cy="-20" r="8" fill="white" opacity="0.8" />
                                    </g>

                                    <g className="rocket-icon rocket-2" fill="#19222B">
                                        <path d="M0-100c10 20 30 60 30 120 0 15-5 30-10 40H-20c-5-10-10-25-10-40 0-60 20-100 30-120z" />
                                        <path d="M-30 20l-30 40h30V20zM30 20l30 40h-30V20z" />
                                        <circle cx="0" cy="-20" r="8" fill="white" opacity="0.8" />
                                    </g>

                                    <g className="rocket-icon rocket-3" fill="#19222B">
                                        <path d="M0-100c10 20 30 60 30 120 0 15-5 30-10 40H-20c-5-10-10-25-10-40 0-60 20-100 30-120z" />
                                        <path d="M-30 20l-30 40h30V20zM30 20l30 40h-30V20z" />
                                        <circle cx="0" cy="-20" r="8" fill="white" opacity="0.8" />
                                    </g>
                                </svg>
                            </div>

                            <button className="fedi-rocket-btn">
                                <img src={FediAvatar} alt="Fedi Robot" className="inner-robot-avatar" />
                            </button>

                            <div className="close-rocket" onClick={closeEverything} title="Volver al menú">
                                ✕
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        className="fedi-chat-container light-theme"
                        drag
                        dragMomentum={false}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className="chat-header drag-handle">
                            <div className="header-info">
                                <div className="header-avatar">
                                    <img src={FediAvatar} alt="Fedi Bot" />
                                    <span className="status-dot"></span>
                                </div>
                                <div className="header-text">
                                    <span className="name">Fedi</span>
                                    <span className="role">Asistente Virtual ✨</span>
                                </div>
                            </div>
                            <button className="close-chat-btn" onClick={closeEverything} aria-label="Cerrar chat">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="chat-iframe-wrapper">
                            <iframe
                                ref={iframeRef}
                                key={currentMessage}
                                src={iframeSrc}
                                title="Fedi AI Assistant"
                                frameBorder="0"
                                className="fedi-iframe"
                                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            ></iframe>
                        </div>

                        <div className="fedi-input-area">
                            <input
                                type="text"
                                placeholder="Escribí tu mensaje..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="chat-input"
                            />
                            <button
                                className="send-btn"
                                onClick={handleSendMessage}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FediWidget;
