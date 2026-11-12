import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/products/${id}`)
            .then((response) => response.json())
            .then((jsonData) => {
                if (!jsonData.success) {
                    throw new Error(jsonData.message);
                }
                setProduct(jsonData.data);
            })
            .catch((err) => setError(err.message));
    }, [id]);

    if (error) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger">{error}</div>
                <div className="d-flex gap-2">
                    <Link to="/" className="btn btn-outline-secondary">Back to the catalog</Link>
                    <Link to="/chat" className="btn btn-primary d-inline-flex align-items-center gap-2">
                        <span>💬</span> Ask AI about this product
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return <div className="container py-4"><p>Loading...</p></div>;
    }

    return (
        <div className="container py-4">
            <div className="card mb-3">
                {product.image && <img src={product.image} alt={product.name} className="card-img-top" />}
                <div className="card-body">
                    <h1 className="h2">{product.name}</h1>
                    <h5 className="text-primary">€ {Number(product.price).toFixed(2)}</h5>
                    <p>
                        Category: {product.categories.map((category) => category.name).join(', ') || 'none'}
                    </p>
                    <p>{product.description}</p>
                </div>
            </div>
            <div className="d-flex gap-2">
                <Link to="/" className="btn btn-outline-secondary">Back to the catalog</Link>
                <Link to="/chat" className="btn btn-primary d-inline-flex align-items-center gap-2">
                    <span>💬</span> Ask AI about this product
                </Link>
            </div>
        </div>
    );
}

export default ProductDetail;