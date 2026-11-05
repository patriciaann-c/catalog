import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router';

const API_URL = 'http://localhost:3000';

const emptyForm = { name: '', description: '', price: '' };

function App() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [form, setForm] = useState(emptyForm);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function createProduct() {
        const product = {
            name: 'Monitor Opale 27',
            description: 'Monitor with 27 pollici',
            price: 199.9
        };

        fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        })
            .then((response) => response.json())
            .then((jsonData) => {
                if (!jsonData.success) {
                    throw new Error(jsonData.message);
                }
                setProducts([jsonData.data, ...products]);
            })
            .catch((err) => setError(err.message));
    };

    function loadProducts() {
        fetch(`${API_URL}/products`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Can't load the products");
                }
                return response.json();
            })
            .then((jsonData) => {
                if (!jsonData.success) {
                    throw new Error(jsonData.message);
                }
                setProducts(jsonData.data);
            })
            .catch((err) => {
                console.error(`Error: ${err.message}`);
                setError(err.message);
            });
    }

    useEffect(() => {
        loadProducts()
    },
        []);

    function handleSubmit(e) {
        e.preventDefault();

        fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, price: Number(form.price) }),
        })
            .then((response) => response.json())
            .then((jsonData) => {
                if (!jsonData.success) {
                    throw new Error(jsonData.message);
                }
                setProducts([jsonData.data, ...products]);
                setForm(emptyForm);
                setError('');
            })
            .catch((err) => setError(err.message));
    };

    function deleteProduct(id) {
        fetch(`${API_URL}/products/${id}`, { method: 'DELETE' })
            .then((response) => response.json())
            .then((jsonData) => {
                if (!jsonData.success) {
                    throw new Error(jsonData.message);
                }
                setProducts(products.filter((product) => product.id !== id));
            })
            .catch((err) => setError(err.message));
    }

    return (
        <div className="container py-4">
            <h1 className="h2 mb-4">My Store</h1>

            <form onSubmit={handleSubmit} className="card card-body mb-4">
                <div className="row g-2 mb-3">
                    <div className="col-md-4">
                        <input name="name" className="form-control" value={form.name}
                            onChange={handleChange} placeholder="Name" />
                    </div>
                    <div className="col-md-5">
                        <input name="description" className="form-control" value={form.description}
                            onChange={handleChange} placeholder="Description" />
                    </div>
                    <div className="col-md-3">
                        <input name="price" type="number" step="0.01" className="form-control"
                            value={form.price} onChange={handleChange} placeholder="Price" />
                    </div>
                </div>
                <div>
                    <button type="submit" className="btn btn-primary">Add product</button>
                </div>
            </form>

            <button className="btn btn-outline-secondary mb-3" onClick={loadProducts}>Reload products</button>

            {error && <div className="alert alert-danger">{error}</div>}

            <h3 className="h5">
                <Link to={`/products/${products.id}`}>{products.name}</Link>
            </h3>

            {products.map((product) => (
                <Fragment key={product.id}>
                    <h3 className="h5">{product.name}</h3>
                    <p>{product.description}</p>
                    <p>€ {Number(product.price).toFixed(2)}</p>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteProduct(product.id)}>Delete</button>
                </Fragment>
            ))}
        </div>
    )
}

export default App;
