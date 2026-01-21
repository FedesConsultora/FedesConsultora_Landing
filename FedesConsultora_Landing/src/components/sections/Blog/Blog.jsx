import React from 'react';
import { Link } from 'react-router-dom';
import SectionPill from '../../ui/SectionPill';
import BlogCard from './BlogCard';
import Blog1 from './subsections/Blog1';
import './Blog.scss';

// Temporary placeholder image - you can replace these with actual files in src/assets/img/blog/
const placeholderImg = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800";

const Blog = () => {
    const blogPosts = [
        {
            category: "Fedes consultora",
            date: "25/08/2025",
            title: "El experimento que tu negocio necesita",
            excerpt: "Probar, medir, ajustar. Esa es la lógica del growth. Una estrategia que no se queda en la teoría, sino que se convierte en resultados medibles.",
            image: placeholderImg
        },
        {
            category: "Fedes consultora",
            date: "05/11/2025",
            title: "El experimento que tu negocio necesita",
            excerpt: "Probar, medir, ajustar. Esa es la lógica del growth. Una estrategia que no se queda en la teoría, sino que se convierte en resultados medibles.",
            image: placeholderImg
        },
        {
            category: "Fedes consultora",
            date: "17/09/2024",
            title: "El experimento que tu negocio necesita",
            excerpt: "Probar, medir, ajustar. Esa es la lógica del growth. Una estrategia que no se queda en la teoría, sino que se convierte en resultados medibles.",
            image: placeholderImg
        },
    ];

    return (
        <>
            <section id="blog" className="blog-section">
                <div className="container">
                    <div className="blog-header">
                        <div className="header-info">
                            <SectionPill text="Blog" />
                            <h2>
                                <span className="dark">LO QUE APRENDEMOS,</span>{" "}
                                <span className="blue">LO COMPARTIMOS.</span>
                            </h2>
                        </div>
                        <Link to="/blog" className="btn-blog-top">
                            Ir al blog
                        </Link>
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

            <section>
                <Blog1 />
            </section>
        </>
    );
};

export default Blog;
