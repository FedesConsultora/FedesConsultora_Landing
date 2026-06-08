import React from 'react';
import { trackEvent } from '../../services/googleApi';
import './TeamChip.scss';

const LinkedInIcon = () => (
    <svg className="linkedin-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a2.7 2.7 0 0 0-2.7-2.7c-1.1 0-2 .6-2.4 1.5h-.1V10.5h-2.9V18.5h3V13.8c0-.7.4-1.2 1.1-1.2.7 0 1.1.5 1.1 1.2v4.7h2.9M6.5 18.5h3V10.5h-3v8M8 9.2a1.6 1.6 0 0 0 1.6-1.6c0-.9-.7-1.6-1.6-1.6-1 0-1.7.7-1.7 1.6 0 .9.8 1.6 1.7 1.6Z" />
    </svg>
);

const TeamChip = ({ name, role, photo, linkedin }) => {
    const Content = () => (
        <>
            <div className="avatar-container">
                {photo ? (
                    <img src={photo} alt={name} className="avatar" draggable="false" />
                ) : (
                    <div className="avatar-placeholder" />
                )}
                {linkedin && (
                    <div className="linkedin-badge">
                        <LinkedInIcon />
                    </div>
                )}
            </div>
            <div className="chip-info">
                <span className="chip-name">{name}</span>
                <span className="chip-role">{role}</span>
            </div>
        </>
    );

    if (linkedin) {
        return (
            <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="team-chip is-link"
                draggable="false"
                onClick={() => trackEvent('Redes', 'Click LinkedIn Equipo', name)}
            >
                <Content />
            </a>
        );
    }

    return (
        <div className="team-chip">
            <Content />
        </div>
    );
};

export default TeamChip;
