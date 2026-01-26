import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Galeria.scss';

// Import background assets
import DegrNosotros1 from '../../../assets/img/backgrounds/galeria-degr (3).svg';
import DegrNosotros2 from '../../../assets/img/backgrounds/galeria-degr (2).svg';
import GaleriaGrilla from '../../../assets/img/backgrounds/galeria-grilla.svg';

// Import images
import img1 from '../../../assets/img/galeria/img.webp';
import img2 from '../../../assets/img/galeria/img2.webp';
import img3 from '../../../assets/img/galeria/img3.webp';
import img4 from '../../../assets/img/galeria/img4.webp';
import img5 from '../../../assets/img/galeria/img5.webp';
import img6 from '../../../assets/img/galeria/img6.webp';
import img7 from '../../../assets/img/galeria/img7.webp';

const allImagesData = [
    { src: img1, category: 'exitos' },
    { src: img2, category: 'testimonios' },
    { src: img3, category: 'producciones' },
    { src: img4, category: 'exitos' },
    { src: img5, category: 'testimonios' },
    { src: img6, category: 'producciones' },
    { src: img7, category: 'testimonios' },
];

const categories = [
    { id: 'todo', label: 'Todo' },
    { id: 'testimonios', label: 'Testimonios' },
    { id: 'exitos', label: 'Casos de éxito' },
    { id: 'producciones', label: 'Producciones' }
];

const Galeria = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState('todo');
    const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
    const carouselRef = useRef(null);
    const carouselInnerRef = useRef(null);

    const filteredImages = useMemo(() => {
        return activeCategory === 'todo'
            ? allImagesData
            : allImagesData.filter(img => img.category === activeCategory);
    }, [activeCategory]);

    // Reset index when category changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [activeCategory]);

    // Auto-rotate main image every 5 seconds
    useEffect(() => {
        if (filteredImages.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [filteredImages.length]);

    // Calculate drag constraints for the carousel
    useEffect(() => {
        if (carouselInnerRef.current && carouselRef.current) {
            const innerWidth = carouselInnerRef.current.scrollWidth;
            const outerWidth = carouselRef.current.offsetWidth;
            setDragConstraints({ left: Math.min(0, -(innerWidth - outerWidth)), right: 0 });
        }
    }, [filteredImages]);

    const handleThumbnailClick = (index) => {
        setCurrentIndex(index);
    };

    return (
        <section className="galeria-section" id="galeria">
            <div className="galeria-background">
                <img src={DegrNosotros1} className="bg-degr degr-1" alt="" />
                <img src={DegrNosotros2} className="bg-degr degr-2" alt="" />
                <img src={GaleriaGrilla} className="bg-grid" alt="" />
            </div>

            <div className="galeria-grid">
                {/* Left Side: Text and Filters */}
                <div className="galeria-header">
                    <motion.h2
                        className="galeria-title"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Nuestro <br /> trabajo habla <br />por nosotros.
                    </motion.h2>

                    <div className="galeria-filters">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Main Image (Hidden on Mobile) */}
                <div className="galeria-main-display">
                    <AnimatePresence mode="wait">
                        {filteredImages.length > 0 && (
                            <motion.div
                                key={`${activeCategory}-${currentIndex}`}
                                className="main-image-wrapper"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <img
                                    src={filteredImages[currentIndex].src}
                                    alt="Fedes Gallery Main"
                                    className="main-img"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom: Draggable Carousel (Hidden on Mobile) */}
                <div className="galeria-carousel" ref={carouselRef}>
                    <motion.div
                        ref={carouselInnerRef}
                        className="carousel-inner"
                        drag="x"
                        dragConstraints={dragConstraints}
                        whileTap={{ cursor: 'grabbing' }}
                    >
                        {filteredImages.map((img, index) => (
                            <motion.div
                                key={index}
                                className={`thumbnail-item ${currentIndex === index ? 'active' : ''}`}
                                onClick={() => handleThumbnailClick(index)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <img src={img.src} alt={`Thumbnail ${index}`} className="thumb-img" draggable="false" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Mobile Specific: Staggered Grid */}
                <div className="galeria-mobile-grid">
                    <AnimatePresence mode="popLayout">
                        {filteredImages.map((img, index) => (
                            <motion.div
                                key={img.src}
                                className="mobile-grid-item"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                layout
                                transition={{ duration: 0.4 }}
                            >
                                <img src={img.src} alt={`Work ${index}`} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};


export default Galeria;
