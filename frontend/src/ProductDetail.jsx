import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';

const API_URL = 'http://localhost:3000';

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
                <Link to="/" className="btn btn-outline-secondary">Back to the catalog</Link>
            </div>
        );
    }

    if (!product) {
        return <div className="container py-4"><p>Loading...</p></div>;
    }

    return (
        <div className="container py-4">
            <div className="card mb-3">
                <div className="card-body">
                    <h1 className="h2">{product.name}</h1>
                    <h5 className="text-primary">€ {product.price.toFixed(2)}</h5>
                    <p>{product.description}</p>
                </div>
            </div>
            <Link to="/" className="btn btn-outline-secondary">Back to the catalog</Link>
        </div>
    );
}

export default ProductDetail;