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
                const data = await getBlogPosts();
                setPosts(data);
            } catch (error) {
                console.error("Error loading posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <section id="blog" className="blog-section">
                <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <p>Cargando artículos...</p>
                </div>
            </section>
        );
    }

    if (posts.length === 0) {
        return (
            <section id="blog" className="blog-section">
                <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <p>No se encontraron artículos.</p>
                </div>
            </section>
        );
    }

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
                            className="gradient-text"
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

                <div className="blog-featured">
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
                                <div className="content-inner">
                                    <h2 style={{ fontWeight: 400 }} className="featured-title">{featuredPost.title}</h2>
                                    <p className="featured-excerpt">{featuredPost.description}</p>
                                </div>
                                <div className="featured-meta">
                                    <span className="badge-category">Fedes consultora</span>
                                    <span className="badge-date">{featuredPost.date}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="blog-grid">
                    {currentPosts.map((post, index) => (
                        <BlogCard
                            key={`${post.id}-${index}`}
                            id={post.id}
                            category="Fedes consultora"
                            date={post.date}
                            title={post.title}
                            excerpt={post.description}
                            image={post.image}
                        />
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
            </div>

            <div className="blog-background-bottom">
                <img src={BlogDegr2} className="bg-degr degr-bottom-center" alt="" />
            </div>
        </section>
    );
};

export default Blog;

