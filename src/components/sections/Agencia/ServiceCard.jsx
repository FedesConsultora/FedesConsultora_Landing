import React from 'react';
import './ServiceCard.scss';

const ServiceCard = ({ title, image, tag, variant }) => {
    return (
        <div
            className={`service-card ${!image ? 'no-image' : ''} ${variant ? `variant-${variant}` : ''}`}
            style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
            <div className="card-overlay">
                <div className="card-content">
                    <h3 className="card-title">{title}</h3>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
