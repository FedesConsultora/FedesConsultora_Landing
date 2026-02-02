import React, { useState, useEffect, useRef } from 'react';
import './FediWidget.scss';

const FediWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isReady, setIsReady] = useState(false);
    const iframeRef = useRef(null);

    const BASE_URL = 'https://fedi.fedes.ai';

    useEffect(() => {
        // Listen for messages from Fedi (inside the iframe)
        const handleIframeMessage = (event) => {
            // Security check: only allow messages from our trusted subdomain
            if (event.origin !== BASE_URL) return;

            const { type, action, url } = event.data;

            if (type === 'fedi:ready') {
                console.log('Fedi Widget is ready at fedi.fedes.ai');
                setIsReady(true);
            }

            if (type === 'fedi:action' && action === 'whatsapp_open') {
                console.log('Fedi triggered WhatsApp open:', url);
                // You could trigger a Google Analytics event here
            }
        };

        // Listen for global landing events (triggered by clicking "pill" phrases)
        const handleOpenRequest = (e) => {
            const message = e.detail?.message || '';

            if (isOpen && isReady && message) {
                // If already open and ready, send message via postMessage for instant response
                iframeRef.current?.contentWindow?.postMessage({
                    type: 'fedi:send_message',
                    payload: message
                }, '*');
            } else {
                // If not open, set message for the initial URL parameter 'q'
                setCurrentMessage(message);
                setIsOpen(true);
            }
        };

        const handleToggle = () => {
            setIsOpen(prev => !prev);
        };

        window.addEventListener('message', handleIframeMessage);
        window.addEventListener('open-fedi', handleOpenRequest);
        window.addEventListener('toggle-fedi', handleToggle);

        return () => {
            window.removeEventListener('message', handleIframeMessage);
            window.removeEventListener('open-fedi', handleOpenRequest);
            window.removeEventListener('toggle-fedi', handleToggle);
        };
    }, [isOpen, isReady]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Reset ready state when opening fresh
            // isReady will be set back to true by the 'fedi:ready' message
        } else {
            setCurrentMessage('');
        }
    };

    // URL setup: using 'q' as specified in the production contract
    const iframeSrc = currentMessage
        ? `${BASE_URL}/?widget=true&q=${encodeURIComponent(currentMessage)}`
        : `${BASE_URL}/?widget=true`;

    return (
        <div className={`fedi-widget ${isOpen ? 'is-open' : ''}`}>
            <div className="fedi-trigger-wrapper">
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

                <button
                    className="fedi-trigger"
                    onClick={toggleChat}
                    aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
                >
                    <span className="icon">
                        {isOpen ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        ) : (
                            <span className="emoji">✨</span>
                        )}
                    </span>
                </button>
            </div>

            <div className="fedi-chat-container">
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
        </div>
    );
};

export default FediWidget;
