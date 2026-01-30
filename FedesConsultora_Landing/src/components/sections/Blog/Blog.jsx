import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import './Blog.scss';
import { getBlogPosts } from '../../../services/googleApi';
import { motion } from 'framer-motion';

// Import background assets
import BlogDegr1 from '../../../assets/img/backgrounds/blog-degr (1).svg';
import BlogDegr2 from '../../../assets/img/backgrounds/blog-degr (2).svg';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 9;

    const dropVariants = {
        hidden: {
            opacity: 0,
            y: -30
        },
        visible: (i = 0) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 1, 0.5, 1],
                delay: i * 0.15
            }
        })
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const allPosts = await getBlogPosts();

                if (allPosts.length > 0) {
                    const firstBatch = allPosts.slice(0, postsPerPage + 1);
                    setPosts(firstBatch);
                    setLoading(false);

                    if (allPosts.length > (postsPerPage + 1)) {
                        setTimeout(() => {
                            setPosts(allPosts);
                        }, 100);
                    }
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error loading posts:", error);
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const featuredPost = posts[0];
    const allOtherPosts = posts.slice(1);

    // Pagination logic
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = allOtherPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(allOtherPosts.length / postsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        const gridElement = document.querySelector('.blog-grid');
        if (gridElement) {
            const offset = 120; // Margin to avoid being too close to the header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = gridElement.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section id="blog" className="blog-section">
            <div className="blog-background-top">
                <img src={BlogDegr1} className="bg-degr degr-top-right" alt="" />
                <img src={BlogDegr2} className="bg-degr degr-top-left" alt="" />
            </div>

            <div className="container">
                <div className="blog-header-main">
                    <h2 className="main-title">
                        <motion.span
                            className="dark-gradient-text"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0 }}
                            custom={0}
                            variants={dropVariants}
                            style={{ display: 'block' }}
                        >
                            Lo que aprendimos haciendo,
                        </motion.span>
                        <motion.span
                            className="white-text"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0 }}
                            custom={1}
                            variants={dropVariants}
                            style={{ display: 'block' }}
                        >
                            lo compartimos acá.
                        </motion.span>
                    </h2>
                </div>

                {loading ? (
                    <div className="loader-container">
                        <div className="circular-loader">
                            <div className="inner-circle"></div>
                        </div>
                        <p className="loading-text">Cargando artículos...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <p>No se encontraron artículos.</p>
                    </div>
                ) : (
                    <>
                        <div className="blog-featured">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                            >
                                <Link
                                    to={`/blog/${featuredPost.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="featured-card-link"
                                >
                                    <div className="featured-card">
                                        <div className="featured-image">
                                            <img src={featuredPost.image} alt={featuredPost.title} />
                                        </div>
                                        <div className="featured-content">
                                            <h2 className="featured-title">{featuredPost.title}</h2>
                                            <p className="featured-excerpt">{featuredPost.description}</p>
                                            <div className="featured-meta">
                                                <span className="badge-category">Fedes consultora</span>
                                                <span className="badge-date">{featuredPost.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        </div>

                        <div className="blog-grid">
                            {currentPosts.map((post, index) => (
                                <motion.div
                                    key={`${post.id}-${index}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.8,
                                        ease: [0.16, 1, 0.3, 1],
                                        delay: (index % 3) * 0.1 // Stagger by row for better feel
                                    }}
                                    viewport={{ once: true, margin: "-50px" }}
                                >
                                    <BlogCard
                                        id={post.id}
                                        category="Fedes consultora"
                                        date={post.date}
                                        title={post.title}
                                        excerpt={post.description}
                                        image={post.image}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="blog-pagination">
                                <button
                                    className={`pagination-btn prev ${currentPage === 1 ? 'disabled' : ''}`}
                                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </button>

                                <div className="pagination-numbers">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                                            onClick={() => handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className={`pagination-btn next ${currentPage === totalPages ? 'disabled' : ''}`}
                                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="blog-background-bottom">
                <img src={BlogDegr2} className="bg-degr degr-bottom-1" alt="" />
                <img src={BlogDegr1} className="bg-degr degr-bottom-2" alt="" />
                <div className="floating-blob blob-1"></div>
                <div className="floating-blob blob-2"></div>
            </div>
        </section>
    );
};

export default Blog;
