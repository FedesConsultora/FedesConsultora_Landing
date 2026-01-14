import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import './Galeria.scss';

// Import images
import img1 from '../../../assets/img/galeria/img.webp';
import img2 from '../../../assets/img/galeria/img2.webp';
import img3 from '../../../assets/img/galeria/img3.webp';
import img4 from '../../../assets/img/galeria/img4.webp';
import img5 from '../../../assets/img/galeria/img5.webp';
import img6 from '../../../assets/img/galeria/img6.webp';
import img7 from '../../../assets/img/galeria/img7.webp';

const Galeria = () => {
    const sectionRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    // Row refs to calculate constraints
    const row1Ref = useRef(null);
    const row2Ref = useRef(null);

    // Check for mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    // Horizontal Parallax (Desktop) - Reduced intensity for better drag feel
    const x1ScrollRaw = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const x2ScrollRaw = useTransform(scrollYProgress, [0, 1], [-100, 100]);

    const x1Scroll = useSpring(x1ScrollRaw, { stiffness: 60, damping: 30 });
    const x2Scroll = useSpring(x2ScrollRaw, { stiffness: 60, damping: 30 });

    const yLeftRaw = useTransform(scrollYProgress, [0, 1], [0, -40]);
    const yRightRaw = useTransform(scrollYProgress, [0, 1], [0, -120]);

    const yLeft = useSpring(yLeftRaw, { stiffness: 40, damping: 30 });
    const yRight = useSpring(yRightRaw, { stiffness: 40, damping: 30 });

    // Separate rows for variation
    const row1Images = [img1, img2, img3, img4, img1, img2, img3, img4];
    const row2Images = [img5, img6, img7, img1, img5, img6, img7, img1];

    const colLeft = [img1, img3, img5, img7];
    const colRight = [img2, img4, img6, img1];

    if (isMobile) {
        return (
            <section ref={sectionRef} className="galeria-section mobile" id="galeria">
                <div className="galeria-mobile-grid">
                    <motion.div className="galeria-column left" style={{ y: yLeft }}>
                        {colLeft.map((img, i) => (
                            <motion.div
                                key={`colL-${i}`}
                                className="galeria-item"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <img src={img} alt={`Gallery ${i}`} className="galeria-img" draggable="false" />
                            </motion.div>
                        ))}
                    </motion.div>
                    <motion.div className="galeria-column right" style={{ y: yRight }}>
                        {colRight.map((img, i) => (
                            <motion.div
                                key={`colR-${i}`}
                                className="galeria-item"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                            >
                                <img src={img} alt={`Gallery ${i}`} className="galeria-img" draggable="false" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section ref={sectionRef} className="galeria-section" id="galeria">
            <div className="galeria-container">
                {/* Row 1 */}
                <div className="galeria-row">
                    {/* Parallax Wrapper */}
                    <motion.div style={{ x: x1Scroll }} className="parallax-row-wrapper">
                        {/* Drag Wrapper */}
                        <motion.div
                            ref={row1Ref}
                            className="row-inner"
                            drag="x"
                            dragConstraints={{ left: -1500, right: 1500 }}
                            dragElastic={0.05}
                            whileTap={{ cursor: "grabbing" }}
                        >
                            {row1Images.map((img, i) => (
                                <div key={`row1-${i}`} className="galeria-item">
                                    <img src={img} alt={`Gallery ${i}`} className="galeria-img" draggable="false" />
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Row 2 */}
                <div className="galeria-row">
                    <motion.div style={{ x: x2Scroll }} className="parallax-row-wrapper">
                        <motion.div
                            ref={row2Ref}
                            className="row-inner"
                            drag="x"
                            dragConstraints={{ left: -1500, right: 1500 }}
                            dragElastic={0.05}
                            whileTap={{ cursor: "grabbing" }}
                        >
                            {row2Images.map((img, i) => (
                                <div key={`row2-${i}`} className="galeria-item">
                                    <img src={img} alt={`Gallery ${i}`} className="galeria-img" draggable="false" />
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Galeria;
