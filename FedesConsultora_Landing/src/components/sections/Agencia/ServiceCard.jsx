import React from 'react';
import './ServiceCard.scss';

const ServiceCard = ({ title, image, tag, variant }) => {
    const cardStyle = image
        ? { backgroundImage: `url(${image})` }
        : { backgroundColor: '#f4f4f4' }; // Lighter gray fallback

    return (
        <div className={`service-card ${!image ? 'no-image' : ''} ${variant ? `variant-${variant}` : ''}`} style={cardStyle}>
            <div className="card-overlay">
                <div className="card-content">
                    {tag && <span className="card-tag">{tag}</span>}
                    <h3 className="card-title">{title}</h3>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
