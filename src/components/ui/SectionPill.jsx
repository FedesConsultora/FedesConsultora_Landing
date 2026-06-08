import React from 'react';
import './SectionPill.scss';

const SectionPill = ({ text }) => {
    return (
        <div className="section-pill">
            <span>{text}</span>
        </div>
    );
};

export default SectionPill;
