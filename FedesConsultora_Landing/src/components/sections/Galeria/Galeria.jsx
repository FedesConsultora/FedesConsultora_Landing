import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import './Galeria.scss';

// Import background assets
import DegrNosotros1 from '../../../assets/img/backgrounds/galeria-degr (3).svg';
import DegrNosotros2 from '../../../assets/img/backgrounds/galeria-degr (2).svg';
import GaleriaGrilla from '../../../assets/img/backgrounds/galeria-grilla.svg';

import { allMediaData, categories } from '../../../data/mediaData';

const renderMedia = (media, className = "thumb-img", isActive = false) => {
    if (media.type === 'video') {
        return (
            <video
                className={className}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={media.poster || ""}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            >
                <source src={media.webm} type="video/webm" />
                <source src={media.src} type="video/mp4" />
            </video>
        );
    }
    return <img src={media.src} alt="" className={className} draggable="false" />;
};

const MobileCarouselRow = ({ images, direction = 1, speed = 40, onMediaClick }) => {
    const containerRef = useRef(null);

    // Speed is in pixels per frame ideally, but we'll use a CSS-like animation approach
    // for much smoother results than setInterval + springs on mobile.

    const infiniteImages = useMemo(() => {
        if (images.length === 0) return [];
        // Triple to ensure coverage for seamless loop
        return [...images, ...images, ...images];
    }, [images]);

    if (images.length === 0) return null;

    return (
        <div className="mobile-carousel-row" ref={containerRef}>
            <motion.div
                className="mobile-carousel-inner"
                animate={{
                    x: direction > 0 ? [-260 * images.length, 0] : [0, -260 * images.length]
                }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: speed,
                        ease: "linear",
                    },
                }}
            >
                {infiniteImages.map((media, i) => (
                    <div
                        key={`${media.src}-${i}`}
                        className="mobile-item"
                        onClick={() => onMediaClick(media)}
                    >
                        {renderMedia(media, "mobile-media")}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

const Galeria = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState('todo');
    const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
    const carouselRef = useRef(null);
    const carouselInnerRef = useRef(null);
    const [virtualIndex, setVirtualIndex] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0); // Real-time index for expansion
    const [containerWidth, setContainerWidth] = useState(0);
    const [imageAspects, setImageAspects] = useState({});
    const [lastX, setLastX] = useState(0); // For snap detection
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [isClosingForNext, setIsClosingForNext] = useState(false); // To close card before moving
    const [fullScreenMedia, setFullScreenMedia] = useState(null); // For mobile expansion
    const carouselX = useMotionValue(0);

    // Track active index in real-time during any movement (drag or animation)
    useEffect(() => {
        const unsubscribe = carouselX.on("change", (x) => {
            if (containerWidth === 0) return;
            const focusOffset = containerWidth * 0.22; // Adjusted left slightly
            const centerPadding = (containerWidth - 520) / 2 + focusOffset;
            const realTimeIndex = Math.round(-(x - centerPadding) / 540);
            if (realTimeIndex !== activeIndex) {
                setActiveIndex(realTimeIndex);
            }
        });
        return () => unsubscribe();
    }, [containerWidth, activeIndex, carouselX]);

    // Detect image aspect ratios (Wait for global preloader or perform locally)
    useEffect(() => {
        allMediaData.forEach((media) => {
            if (media.type === 'video') {
                setImageAspects(prev => ({ ...prev, [media.src]: false }));
                return;
            }
            const i = new Image();
            i.onload = () => {
                setImageAspects(prev => ({
                    ...prev,
                    [media.src]: i.height > i.width
                }));
            };
            i.src = media.src;
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
    const reversedFilteredMedia = useMemo(() => {
        const filtered = activeCategory === 'todo'
            ? allMediaData
            : allMediaData.filter(m => m.category === activeCategory);
        const reversed = [...filtered].reverse();
        // Skip repetition if empty (Próximamente cases)
        if (filtered.length === 0) return [];
        return Array(10).fill(reversed).flat();
    }, [activeCategory]);

    const filteredMedia = useMemo(() => {
        return activeCategory === 'todo'
            ? allMediaData
            : allMediaData.filter(m => m.category === activeCategory);
    }, [activeCategory]);

    // Reset index when category changes
    useEffect(() => {
        const len = filteredMedia.length;
        if (len > 0) {
            setCurrentIndex(0);
            const startIdx = len * 5;
            setVirtualIndex(startIdx);
            setActiveIndex(startIdx);
        }
    }, [activeCategory, filteredMedia.length]);

    // Auto-rotate main image every 5 seconds with "Close -> Advance -> Open" sequence
    useEffect(() => {
        if (filteredMedia.length === 0 || !isAutoPlaying) return;
        const timer = setInterval(() => {
            // 1. Close current card
            setIsClosingForNext(true);

            // 2. Wait for shrink animation, then move
            setTimeout(() => {
                setVirtualIndex(prev => prev + 1);
                setIsClosingForNext(false);
            }, 600);
        }, 5000);
        return () => clearInterval(timer);
    }, [filteredMedia.length, isAutoPlaying]);

    // Synchronize currentIndex
    useEffect(() => {
        if (filteredMedia.length === 0) return;
        setCurrentIndex(virtualIndex % filteredMedia.length);
    }, [virtualIndex, filteredMedia.length]);

    // Handle virtual index loop reset silently
    const handleTransitionEnd = () => {
        const len = filteredMedia.length;
        if (virtualIndex >= len * 7 || virtualIndex < len * 3) {
            const offset = virtualIndex % len;
            const resetVal = len * 5 + offset;
            setVirtualIndex(resetVal);
            setActiveIndex(resetVal); // Keep them in sync during teleport
        }
    };

    // Calculate drag constraints for the carousel
    useEffect(() => {
        if (carouselInnerRef.current && carouselRef.current) {
            const innerWidth = carouselInnerRef.current.scrollWidth;
            const outerWidth = carouselRef.current.offsetWidth;
            setDragConstraints({ left: -(innerWidth - outerWidth), right: 0 });
        }
    }, [reversedFilteredMedia]);

    const handleThumbnailClick = (clickedIndex) => {
        if (clickedIndex === virtualIndex || isClosingForNext) return;

        setIsAutoPlaying(false); // Stop autoplay immediately to prevent conflicts
        setIsClosingForNext(true); // Shrink current

        setTimeout(() => {
            setVirtualIndex(clickedIndex);
            setIsClosingForNext(false); // Allow expansion of new one when it arrives

            // Resume autoplay after a delay to ensure it starts from the new position
            setTimeout(() => {
                setIsAutoPlaying(true);
            }, 200);
        }, 500);
    };

    const targetX = useMemo(() => {
        if (containerWidth === 0) return 0;

        // Balanced offset to the right
        const focusOffset = containerWidth * 0.22;
        const centerPadding = (containerWidth - 520) / 2 + focusOffset;

        // 520 (item width) + 20 (gap) = 540
        return -((virtualIndex) * 540) + centerPadding;
    }, [containerWidth, virtualIndex]);

    const isSnap = Math.abs(targetX - lastX) > 1000;

    useEffect(() => {
        setLastX(targetX);
    }, [targetX]);

    const handleDragStart = () => {
        setIsAutoPlaying(false);
        setIsDragging(true);
    };

    const handleDragEnd = (_, info) => {
        const x = carouselX.get();
        const focusOffset = containerWidth * 0.22;
        const centerPadding = (containerWidth - 520) / 2 + focusOffset;

        // Final snap calculation matching real-time center
        const finalVirtualIndex = Math.round(-(x - centerPadding) / 540);
        setVirtualIndex(finalVirtualIndex);

        // Release dragging state after a tiny delay to ensure transition starts
        setTimeout(() => {
            setIsDragging(false);
            setIsAutoPlaying(true);
        }, 50);
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
                    <h2 className="galeria-title">
                        <motion.div
                            className="title-inner"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            viewport={{ once: true }}
                        >
                            Nuestro trabajo
                        </motion.div>
                        <motion.div
                            className="title-inner highlight"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            viewport={{ once: true }}
                        >
                            habla por nosotros.
                        </motion.div>
                    </h2>

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
                                    src={filteredMedia[currentIndex].src}
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
                        transition={isSnap ? { duration: 0 } : { type: "spring", stiffness: 50, damping: 20, restDelta: 0.01 }}
                        onAnimationComplete={handleTransitionEnd}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        {reversedFilteredMedia.length > 0 ? reversedFilteredMedia.map((media, index) => {
                            const isActive = index === activeIndex && (isDragging || index === virtualIndex) && !isClosingForNext;
                            const isVertical = imageAspects[media.src] || false;
                            return (
                                <motion.div
                                    key={`${media.src}-${index}`}
                                    className={`thumbnail-item ${isActive ? 'active' : ''} ${isVertical ? 'is-portrait' : 'is-landscape'}`}
                                    onClick={() => handleThumbnailClick(index)}
                                    animate={{
                                        height: isActive ? (isVertical ? '84vh' : '65vh') : '300px',
                                    }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    style={{ transformOrigin: 'bottom' }}
                                >
                                    {renderMedia(media, isVertical ? "thumb-img vertical" : "thumb-img horizontal", isActive)}
                                </motion.div>
                            );
                        }) : (
                            <div className="coming-soon-message">
                                <h3>Próximamente</h3>
                                <p>Estamos preparando contenido increible para esta sección.</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Mobile Specific: Bidirectional Dual Rows (< 1080px) */}
                <div className="galeria-mobile-grid">
                    <MobileCarouselRow
                        images={filteredMedia.filter((_, i) => i % 2 === 0)}
                        direction={1}
                        speed={35} // Duration in seconds for full loop
                        onMediaClick={setFullScreenMedia}
                    />
                    <MobileCarouselRow
                        images={filteredMedia.filter((_, i) => i % 2 !== 0)}
                        direction={-1}
                        speed={45} // Slower second row
                        onMediaClick={setFullScreenMedia}
                    />
                </div>

                {/* Mobile Fullscreen Overlay */}
                <AnimatePresence>
                    {fullScreenMedia && (
                        <motion.div
                            className="galeria-mobile-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setFullScreenMedia(null)}
                        >
                            <motion.div
                                className="overlay-content"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button className="close-overlay" onClick={() => setFullScreenMedia(null)}>×</button>
                                {renderMedia(fullScreenMedia, "full-media")}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default Galeria;
