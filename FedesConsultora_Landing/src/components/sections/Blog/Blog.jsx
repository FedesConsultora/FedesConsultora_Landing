import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import './Blog.scss';
import { getBlogPosts } from '../../../services/googleApi';

// Import background assets
import BlogDegr1 from '../../../assets/img/backgrounds/blog-degr (1).svg';
import BlogDegr2 from '../../../assets/img/backgrounds/blog-degr (2).svg';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

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
    const blogPosts = posts.slice(1);

    return (
        <section id="blog" className="blog-section">
            <div className="blog-background-top">
                <img src={BlogDegr1} className="bg-degr degr-top-right" alt="" />
                <img src={BlogDegr2} className="bg-degr degr-top-left" alt="" />
            </div>

            <div className="container">
                <div className="blog-header-main">
                    <h2 className="main-title">
                        Lo que aprendimos haciendo, <br />
                        <span className="gradient-text">lo compartimos acá.</span>
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
                    {blogPosts.map((post, index) => (
                        <BlogCard
                            key={index}
                            id={post.id}
                            category="Fedes consultora"
                            date={post.date}
                            title={post.title}
                            excerpt={post.description}
                            image={post.image}
                        />
                    ))}
                </div>
            </div>

            <div className="blog-background-bottom">
                <img src={BlogDegr2} className="bg-degr degr-bottom-center" alt="" />
            </div>
        </section>
    );
};

export default Blog;

