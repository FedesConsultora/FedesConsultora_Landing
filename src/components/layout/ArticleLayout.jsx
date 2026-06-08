import React from 'react';
import { motion } from 'framer-motion';
import './ArticleLayout.scss';

const ArticleLayout = ({ blocks, accent }) => {
    return (
        <div className="article-layout" style={{ '--accent-color': accent }}>
            <div className="article-grid">
                {blocks.map((block, index) => (
                    <motion.div
                        key={block.id || index}
                        className={`article-block span-${block.span || 1} ${block.destacado ? 'destacado' : ''} ${block.dobleCol ? 'double-col' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                        <div className="block-content">
                            {block.icono && <div className="block-icon">{block.icono}</div>}
                            {block.paso && <div className="block-step">Paso {block.paso}</div>}
                            {block.titulo && <h3 className="block-title">{block.titulo}</h3>}
                            <p className="block-text" dangerouslySetInnerHTML={{ __html: block.texto.replace(/\n/g, '<br />') }} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ArticleLayout;
