import React from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import './Blog.scss';

// Use a consistent placeholder image for now to match design
const blogImg = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800";

const Blog = () => {
    const blogPosts = [
        {
            category: "Fedes consultora",
            date: "25/08/2025",
            title: "El experimento que tu negocio necesita",
            excerpt: "Probar, medir, ajustar. Esa es la lógica del growth. Una estrategia que no se queda en la teoría, sino que se convierte en resultados medibles.",
            image: blogImg
        },
        {
            category: "Fedes consultora",
            date: "25/08/2025",
            title: "El experimento que tu negocio necesita",
            excerpt: "Probar, medir, ajustar. Esa es la lógica del growth. Una estrategia que no se queda en la teoría, sino que se convierte en resultados medibles.",
            image: blogImg
        },
        {
            category: "Fedes consultora",
            date: "25/08/2025",
            title: "El experimento que tu negocio necesita",
            excerpt: "Probar, medir, ajustar. Esa es la lógica del growth. Una estrategia que no se queda en la teoría, sino que se convierte en resultados medibles.",
            image: blogImg
        },
        {
            category: "Fedes consultora",
            date: "25/08/2025",
            title: "El experimento que tu negocio necesita",
            excerpt: "Probar, medir, ajustar. Esa es la lógica del growth. Una estrategia que no se queda en la teoría, sino que se convierte en resultados medibles.",
            image: blogImg
        },
        {
            category: "Fedes consultora",
            date: "25/08/2025",
            title: "El experimento que tu negocio necesita",
            excerpt: "Probar, medir, ajustar. Esa es la lógica del growth. Una estrategia que no se queda en la teoría, sino que se convierte en resultados medibles.",
            image: blogImg
        },
        {
            category: "Fedes consultora",
            date: "25/08/2025",
            title: "El experimento que tu negocio necesita",
            excerpt: "Probar, medir, ajustar. Esa es la lógica del growth. Una estrategia que no se queda en la teoría, sino que se convierte en resultados medibles.",
            image: blogImg
        },
    ];

    const featuredPost = {
        category: "Fedes consultora",
        date: "25/08/2025",
        title: "El experimento que tu negocio necesita",
        excerpt: "Probar, medir, ajustar. Esa es la lógica del growth. Una estrategia que no se queda en la teoría, sino que se convierte en resultados medibles. Una estrategia que no se queda en la teoría, sino que se convierte en resultados medibles.",
        image: blogImg
    };

    return (
        <section id="blog" className="blog-section">
            <div className="container">
                <div className="blog-header-main">
                    <h2 className="main-title">
                        Lo que aprendemos en la trinchera, <br />
                        <span className="gradient-text">lo compartimos acá.</span>
                    </h2>
                </div>

                <div className="blog-featured">
                    <div className="featured-card">
                        <div className="featured-image">
                            <img src={featuredPost.image} alt={featuredPost.title} />
                        </div>
                        <div className="featured-content">
                            <div className="content-inner">
                                <h2 style={{ fontWeight: 400 }} className="featured-title">{featuredPost.title}</h2>
                                <p className="featured-excerpt">{featuredPost.excerpt}</p>
                            </div>
                            <div className="featured-meta">
                                <span className="badge-category">{featuredPost.category}</span>
                                <span className="badge-date">{featuredPost.date}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="blog-grid">
                    {blogPosts.map((post, index) => (
                        <BlogCard
                            key={index}
                            category={post.category}
                            date={post.date}
                            title={post.title}
                            excerpt={post.excerpt}
                            image={post.image}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Blog;

