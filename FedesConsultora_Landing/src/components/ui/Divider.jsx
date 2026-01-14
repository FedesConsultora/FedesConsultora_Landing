import React from 'react';
import './Divider.scss';
import logo from '../../assets/img/FedesLogo.webp';

const Divider = ({ variant = 'blue', data }) => {
    const defaultStats = [
        { number: '+ 150', label: 'PROYECTOS ESCALADOS' },
        { number: '300%', label: 'ROI PROMEDIO EN ADS' },
        { number: '+5 AÑOS', label: 'TRANSFORMANDO PYMES' },
        { number: '2', label: 'PREMIOS MERCURIO' }
    ];

    const stats = data || defaultStats;

    return (
        <div className={`divider-accent ${variant}`}>
            <div className="container divider-content">
                {variant === 'blue' && (
                    <div className="stats-container">
                        {stats.map((item, index) => (
                            <div key={index} className="stat-item">
                                <span className="stat-number">{item.number}</span>
                                <span className="stat-label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {variant === 'dark' && (
                    <div className="logo-container">
                        <img src={logo} alt="Fedes Logo" className="divider-logo" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Divider;
