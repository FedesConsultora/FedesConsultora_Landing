import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBlogPosts } from '../../services/googleApi';
import { HiArrowLeft } from 'react-icons/hi';
import './BlogPostDetail.scss';

import ManualMarca from '../BlogPages/ManualMarca';
import ServiciosFedes from '../BlogPages/ServiciosFedes';
import ViajeroEternidad from '../BlogPages/ViajeroEternidad';
import KickOff2025 from '../BlogPages/KickOff2025';
import TresC from '../BlogPages/TresC';
import CreatividadEInnovacion from '../BlogPages/CreatividadEInnovacion';
import PosicionamientoEstrategico from '../BlogPages/PosicionamientoEstrategico';
import CRMIntegradoECommerce from '../BlogPages/CRMIntegradoECommerce';
import SEOECommerce from '../BlogPages/SEOECommerce';
import GrowthMarketing from '../BlogPages/GrowthMarketing';

const BLOG_COMPONENTS = {
    "1": ManualMarca,
    "16": ServiciosFedes,
    "17": ViajeroEternidad,
    "18": KickOff2025,
    "19": TresC,
    "20": CreatividadEInnovacion,
    "21": PosicionamientoEstrategico,
    "22": CRMIntegradoECommerce,
    "23": SEOECommerce,
    "24": GrowthMarketing
};

const BlogPostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const CustomContent = BLOG_COMPONENTS[id];

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const posts = await getBlogPosts();
                const foundPost = posts.find(p => String(p.id) === id);
                setPost(foundPost);
            } catch (error) {
                console.error("Error loading post:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        // Scroll to top when post changes
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="blog-detail-loading">
                <div className="loader"></div>
                <p>Cargando artículo...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="blog-detail-error">
                <h2>Artículo no encontrado</h2>
                <Link to="/" className="back-link">
                    <HiArrowLeft /> Volver al Inicio
                </Link>
            </div>
        );
    }

    return (
        <motion.main
            className="blog-post-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="detail-header">
                <div className="container">
                    <Link to="/#blog" className="back-button">
                        <HiArrowLeft /> Volver al Blog
                    </Link>

                    <motion.div
                        className="header-content"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="post-category">Fedes consultora</span>
                        <h1 className="post-title">{post.title}</h1>
                        <div className="post-meta">
                            <span className="post-date">{post.date}</span>
                            <span className="separator">•</span>
                            <span className="post-author">{post.author}</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {!CustomContent && (
                <div className="detail-image-container container">
                    <motion.div
                        className="image-wrapper"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <img src={post.image} alt={post.title} className="main-image" />
                    </motion.div>
                </div>
            )}

            <div className="detail-content container">
                <div className="content-body">
                    {CustomContent ? (
                        <CustomContent />
                    ) : post.content ? (
                        <div
                            className="full-content"
                            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                        />
                    ) : (
                        <p className="description-lead">{post.description}</p>
                    )}
                </div>

                {!CustomContent && (
                    <aside className="post-sidebar">
                        <div className="author-card">
                            {post.authorImg && (
                                <img src={post.authorImg} alt={post.author} className="author-avatar" />
                            )}
                            <div className="author-info">
                                <span className="written-by">Escrito por</span>
                                <h3 className="author-name">{post.author}</h3>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </motion.main>
    );
};

export default BlogPostDetail;
