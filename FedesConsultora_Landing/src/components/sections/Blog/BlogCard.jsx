import { Link } from 'react-router-dom';
import './BlogCard.scss';

const BlogCard = ({ id, category, date, title, excerpt, image }) => {
    return (
        <Link
            to={`/blog/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="blog-card-link"
        >
            <div className="blog-card">
                <div className="card-image-container">
                    <img src={image} alt={title} className="card-image" />
                    <div className="card-badges">
                        <span className="badge category-badge">{category}</span>
                        <span className="badge date-badge">{date}</span>
                    </div>
                </div>
                <div className="card-body">
                    <h3 className="card-title">{title}</h3>
                    <p className="card-excerpt">{excerpt}</p>
                </div>
            </div>
        </Link>
    );
};

export default BlogCard;

