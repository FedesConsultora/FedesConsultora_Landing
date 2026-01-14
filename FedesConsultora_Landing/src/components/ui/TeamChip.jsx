import React from 'react';
import './TeamChip.scss';

const TeamChip = ({ name, role, photo }) => {
    return (
        <div className="team-chip">
            <div className="avatar-container">
                {photo ? (
                    <img src={photo} alt={name} className="avatar" />
                ) : (
                    <div className="avatar-placeholder" />
                )}
            </div>
            <div className="chip-info">
                <span className="chip-name">{name}</span>
                <span className="chip-role">{role}</span>
            </div>
        </div>
    );
};

export default TeamChip;
