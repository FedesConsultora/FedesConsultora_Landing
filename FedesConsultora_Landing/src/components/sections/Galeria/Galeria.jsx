import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
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
    const [virtualIndex, setVirtualIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [imageAspects, setImageAspects] = useState({});
    const [lastX, setLastX] = useState(0); // For snap detection
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const carouselX = useMotionValue(0);

    // Detect image aspect ratios
    useEffect(() => {
        allImagesData.forEach((img) => {
            const i = new Image();
            i.onload = () => {
                setImageAspects(prev => ({
                    ...prev,
                    [img.src]: i.height > i.width
                }));
            };
            i.src = img.src;
        });
    }, []);

    // Update container width for alignment
    useEffect(() => {
        const updateWidth = () => {
            if (carouselRef.current) setContainerWidth(carouselRef.current.offsetWidth);
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Higher repetition buffer for safer seamless looping
    const reversedFilteredImages = useMemo(() => {
        const filtered = activeCategory === 'todo'
            ? allImagesData
            : allImagesData.filter(img => img.category === activeCategory);
        const reversed = [...filtered].reverse();
        // 10x repetition ensures we are almost never near the real edges during normal use
        return Array(10).fill(reversed).flat();
    }, [activeCategory]);

    const filteredImages = useMemo(() => {
        return activeCategory === 'todo'
            ? allImagesData
            : allImagesData.filter(img => img.category === activeCategory);
    }, [activeCategory]);

    // Reset index when category changes
    useEffect(() => {
        const len = filteredImages.length;
        if (len > 0) {
            setCurrentIndex(0);
            // Start roughly in the middle of the 10x buffer
            setVirtualIndex(len * 5);
        }
    }, [activeCategory, filteredImages.length]);

    // Auto-rotate main image every 5 seconds
    useEffect(() => {
        if (filteredImages.length === 0 || !isAutoPlaying) return;
        const timer = setInterval(() => {
            setVirtualIndex(prev => prev + 1);
        }, 5000);
        return () => clearInterval(timer);
    }, [filteredImages.length, isAutoPlaying]);

    // Synchronize currentIndex
    useEffect(() => {
        if (filteredImages.length === 0) return;
        setCurrentIndex(virtualIndex % filteredImages.length);
    }, [virtualIndex, filteredImages.length]);

    // Handle virtual index loop reset silently
    const handleTransitionEnd = () => {
        const len = filteredImages.length;
        if (virtualIndex >= len * 7 || virtualIndex < len * 3) {
            const offset = virtualIndex % len;
            setVirtualIndex(len * 5 + offset);
        }
    };

    // Calculate drag constraints for the carousel
    useEffect(() => {
        if (carouselInnerRef.current && carouselRef.current) {
            const innerWidth = carouselInnerRef.current.scrollWidth;
            const outerWidth = carouselRef.current.offsetWidth;
            setDragConstraints({ left: -(innerWidth - outerWidth), right: 0 });
        }
    }, [reversedFilteredImages]);

    const handleThumbnailClick = (originalIndex) => {
        const len = filteredImages.length;
        const currentBase = Math.floor(virtualIndex / len) * len;
        setVirtualIndex(currentBase + originalIndex);
        setIsAutoPlaying(true);
    };

    const targetX = useMemo(() => {
        if (containerWidth === 0) return 0;

        // Use a larger offset on large screens to keep items away from the left header
        const extraOffset = containerWidth <= 1400 ? 100 : 280;

        // 520 (item width) + 16 (gap) = 536
        return containerWidth - 520 - extraOffset - ((reversedFilteredImages.length - 1 - virtualIndex) * 536);
    }, [containerWidth, reversedFilteredImages.length, virtualIndex]);

    const isSnap = Math.abs(targetX - lastX) > 1000;

    useEffect(() => {
        setLastX(targetX);
    }, [targetX]);

    const handleDragStart = () => {
        setIsAutoPlaying(false);
    };

    const handleDragEnd = () => {
        const extraOffset = containerWidth <= 1400 ? 100 : 280;
        const deltaItems = (containerWidth - 520 - extraOffset - currentX) / 536;
        const newVirtualIndex = Math.round(reversedFilteredImages.length - 1 - deltaItems);
        setVirtualIndex(newVirtualIndex);
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

                {/* Right Side: Main Display (Hidden on Mobile) */}
                <div className={`galeria-main-display v-hidden`}>
                    <AnimatePresence mode="wait">
                        {false && (
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
                        style={{ x: carouselX }}
                        whileTap={{ cursor: 'grabbing' }}
                        animate={{ x: targetX }}
                        transition={isSnap ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20, restDelta: 0.01 }}
                        onAnimationComplete={handleTransitionEnd}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        {reversedFilteredImages.map((img, index) => {
                            const originalIndex = filteredImages.findIndex(fi => fi.src === img.src);
                            const isActive = (reversedFilteredImages.length - 1 - index) === virtualIndex;
                            const isVertical = true; // Forced to true for testing
                            return (
                                <motion.div
                                    key={`${img.src}-${index}`}
                                    className={`thumbnail-item ${isActive ? 'active' : ''} ${isVertical ? 'is-portrait' : 'is-landscape'}`}
                                    onClick={() => handleThumbnailClick(originalIndex)}
                                    animate={{
                                        height: (isActive && isVertical) ? '84vh' : '300px',
                                    }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    style={{ transformOrigin: 'bottom' }}
                                >
                                    <img src={img.src} alt={`Thumbnail ${index}`} className="thumb-img" draggable="false" />
                                </motion.div>
                            );
                        })}
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
