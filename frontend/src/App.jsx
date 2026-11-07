import { useEffect, useState } from 'react';
import { Link } from 'react-router';

const API_URL = 'http://localhost:3000';

const emptyForm = { name: '', description: '', price: '' };

function App() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    function startEdit(product) {
        setEditingId(product.id);
        setForm({
            name: product.name,
            description: product.description,
            price: String(product.price)
        });
    }
    function cancelEdit() {
        setEditingId(null);
        setForm(emptyForm);
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSearch(e) {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
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

    function loadProducts(targetPage = page, targetSearch = search) {
        setIsLoading(true);
        const params = new URLSearchParams({ page: targetPage, limit: 20, search: targetSearch });
        fetch(`${API_URL}/products?${params}`)
            .then((response) => response.json())
            .then((jsonData) => {
                if (!jsonData.success) {
                    throw new Error(jsonData.message);
                }
                setProducts(jsonData.data);
                setTotalPages(jsonData.meta?.totalPages ?? 1);
                setError('');
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }

    function handleReload() {
        setSearchInput('');
        setSearch('');
        setPage(1);
        loadProducts(1, '');
    }
    useEffect(() => {
        loadProducts();
    }, [page, search]);

    function handleSubmit(e) {
        e.preventDefault();
        const isEditing = editingId !== null;
        const url = isEditing
            ? `${API_URL}/products/${editingId}`
            : `${API_URL}/products`;
        fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, price: Number(form.price) }),
        })
            .then((response) => response.json())
            .then((jsonData) => {
                if (!jsonData.success) {
                    throw new Error(jsonData.message);
                }
                if (isEditing) {
                    setProducts(products.map((p) => (p.id === editingId ? jsonData.data : p)));
                } else {
                    setProducts([jsonData.data, ...products]);
                }
                cancelEdit();
                setError('');
            })
            .catch((err) => setError(err.message));
    }

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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2 mb-0">My Store</h1>
                <Link to="/chat" className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm rounded-pill px-3">
                    <span>💬</span>
                    <span>Chat with AI</span>
                </Link>
            </div>

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
                    <button type="submit" className="btn btn-primary">
                        {editingId !== null ? 'Save' : 'Add product'}
                    </button>
                    {editingId !== null && <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancel</button>}
                </div>
            </form>

            <form onSubmit={handleSearch} className="row g-2 mb-4">
                <div className="col-md-10">
                    <input
                        className="form-control"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by name"
                    />
                </div>
                <div className="col-md-2 d-grid">
                    <button type="submit" className="btn btn-primary">Search</button>
                </div>
            </form>

            <button
                className="btn btn-outline-secondary mb-3"
                onClick={handleReload}
                disabled={isLoading}
            >
                {isLoading ? 'Reloading...' : 'Reload products'}
            </button>

            {error && <div className="alert alert-danger">{error}</div>}

            {products.map((product) => (
                <div key={product.id} className="card card-body mb-3">
                    {product.image && (
                        <img
                            src={product.image}
                            alt={product.name}
                            width="200"
                            height="150"
                            className="rounded object-fit-cover mb-2"
                            loading="lazy"
                        />
                    )}
                    <h3 className="h5">
                        <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </h3>
                    <p>{product.description}</p>
                    <p className="fw-bold">€ {Number(product.price).toFixed(2)}</p>
                    <div>
                        <button className="btn btn-outline-danger btn-sm me-2" onClick={() => deleteProduct(product.id)}>Delete</button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => startEdit(product)}>Modify</button>
                    </div>
                </div>
            ))}

            <div className="d-flex justify-content-center align-items-center gap-3">
                <button className="btn btn-outline-secondary" disabled={page === 1}
                    onClick={() => setPage(page - 1)}>
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button className="btn btn-outline-secondary" disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}>
                    Next
                </button>
            </div>

            {/* Floating Chat Button */}
            <Link
                to="/chat"
                className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center text-decoration-none"
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '56px',
                    height: '56px',
                    fontSize: '24px',
                    zIndex: 1050
                }}
                title="Chat with AI Assistant"
            >
                💬
            </Link>
        </div>
    )
}

export default App;
