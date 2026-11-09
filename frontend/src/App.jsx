import { useEffect, useState } from 'react';
import { Link } from 'react-router';

const API_URL = 'http://localhost:3000';

const emptyForm = { name: '', description: '', price: '' };

function App() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/categories`)
            .then((response) => response.json())
            .then((jsonData) => {
                if (jsonData.success) {
                    setCategories(jsonData.data);
                }
            })
            .catch((err) => setError(err.message));
    }, []);

    function startEdit(product) {
        setEditingId(product.id);
        setForm({
            name: product.name,
            description: product.description,
            price: String(product.price)
        });
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(emptyForm);
        setIsFormOpen(false);
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSearch(e) {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    }

    function loadProducts(targetPage = page, targetSearch = search, targetCategoryId = categoryId) {
        setIsLoading(true);
        const params = new URLSearchParams({ page: targetPage, limit: 12, search: targetSearch });
        if (targetCategoryId !== '') {
            params.set('category', targetCategoryId);
        }
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
        setCategoryId('');
        loadProducts(1, '', '');
    }

    useEffect(() => {
        loadProducts();
    }, [page, search, categoryId]);

    function handleCategoryChange(event) {
        setPage(1);
        setCategoryId(event.target.value);
    }

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
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }
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
        <div className="container py-4" style={{ maxWidth: '1180px' }}>
            {/* Store Top Navigation Bar */}
            <header className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: '46px', height: '46px', fontSize: '22px' }}
                    >
                        🏪
                    </div>
                    <div>
                        <h1 className="h3 mb-0 fw-bold text-dark">My Store</h1>
                        <small className="text-secondary">Catalog management & live inventory</small>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2 mt-3 mt-sm-0">
                    <Link
                        to="/chat"
                        className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm rounded-pill px-3 py-2 fw-semibold"
                    >
                        <span>🤖</span>
                        <span>AI Assistant</span>
                        <span className="badge bg-white text-primary rounded-pill small">Ask</span>
                    </Link>
                </div>
            </header>

            {/* Error Notification */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show shadow-sm rounded-3 mb-4" role="alert">
                    <strong>Error:</strong> {error}
                    <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
                </div>
            )}

            {/* Search & Actions Toolbar */}
            <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
                <div className="row g-2 align-items-center">
                    <div className="col-md-7">
                        <form onSubmit={handleSearch} className="input-group">
                            <span className="input-group-text bg-light border-end-0 text-muted">🔍</span>
                            <input
                                className="form-control border-start-0 ps-0"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by product name..."
                            />
                            <div className="col-md-4">
                                <select className="form-select" value={categoryId} onChange={handleCategoryChange}>
                                    <option value="">All the categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}: {category.productsCount}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary px-3 fw-semibold">
                                Search
                            </button>
                        </form>
                    </div>
                    <div className="col-md-5 d-flex gap-2 justify-content-md-end">
                        <button
                            className="btn btn-outline-secondary d-flex align-items-center gap-2"
                            onClick={handleReload}
                            disabled={isLoading}
                            title="Reset filters and reload catalog"
                        >
                            <span>{isLoading ? '⏳' : '🔄'}</span>
                            <span>{isLoading ? 'Reloading...' : 'Reload'}</span>
                        </button>
                        <button
                            className={`btn ${isFormOpen ? 'btn-outline-primary' : 'btn-primary'} d-flex align-items-center gap-2 fw-semibold`}
                            onClick={() => {
                                if (isFormOpen && editingId !== null) {
                                    cancelEdit();
                                } else {
                                    setIsFormOpen(!isFormOpen);
                                }
                            }}
                        >
                            <span>{isFormOpen ? '✕' : '➕'}</span>
                            <span>{isFormOpen ? 'Close Form' : 'New Product'}</span>
                        </button>
                    </div>
                </div>

                {/* Active search filter tag */}
                {search && (
                    <div className="d-flex align-items-center gap-2 mt-3 pt-2 border-top text-muted small">
                        <span>Active filter: <strong>"{search}"</strong></span>
                        <button
                            type="button"
                            className="btn btn-link btn-sm p-0 text-decoration-none text-danger fw-semibold"
                            onClick={() => {
                                setSearchInput('');
                                setSearch('');
                                setPage(1);
                            }}
                        >
                            ✕ Clear filter
                        </button>
                    </div>
                )}
            </div>

            {/* Collapsible Add/Edit Product Panel */}
            {isFormOpen && (
                <div className="card border-0 shadow-sm rounded-3 mb-4 border-start border-4 border-primary">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 className="h5 mb-0 fw-bold text-dark">
                                {editingId !== null ? '✏️ Edit Product' : '➕ Add New Product'}
                            </h2>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={cancelEdit}
                                aria-label="Close"
                            ></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3 mb-3">
                                <div className="col-md-5">
                                    <label className="form-label small fw-semibold text-secondary">Product Name *</label>
                                    <input
                                        name="name"
                                        className="form-control"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Wireless Noise Canceling Headphones"
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-semibold text-secondary">Description</label>
                                    <input
                                        name="description"
                                        className="form-control"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Key features, specs..."
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-secondary">Price (€) *</label>
                                    <div className="input-group">
                                        <span className="input-group-text">€</span>
                                        <input
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="form-control"
                                            value={form.price}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary px-4 fw-semibold">
                                    {editingId !== null ? 'Save Changes' : 'Create Product'}
                                </button>
                                <button type="button" className="btn btn-outline-secondary px-3" onClick={cancelEdit}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {products.length === 0 && !isLoading ? (
                <div className="text-center py-5 bg-white rounded-3 shadow-sm my-4">
                    <div style={{ fontSize: '3rem' }}>🔍</div>
                    <h3 className="h5 fw-bold mt-2">No products found</h3>
                    <p className="text-secondary small mb-3">
                        {search ? `No products matched "${search}". Try searching for something else.` : 'Your store catalog is currently empty.'}
                    </p>
                    {search && (
                        <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={handleReload}>
                            Reset search
                        </button>
                    )}
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 mb-4">
                    {products.map((product) => (
                        <div className="col" key={product.id}>
                            <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden d-flex flex-column bg-white">
                                {/* Product Thumbnail with Price Badge */}
                                <div className="position-relative bg-light" style={{ height: '180px' }}>
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-100 h-100 object-fit-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary">
                                            <span style={{ fontSize: '2.5rem' }}>📦</span>
                                        </div>
                                    )}
                                    <span className="position-absolute top-0 end-0 m-2 badge bg-primary fs-6 shadow-sm">
                                        € {Number(product.price).toFixed(2)}
                                    </span>
                                </div>

                                {/* Product Body */}
                                <div className="card-body d-flex flex-column p-3">
                                    <h2 className="h6 card-title mb-1 text-truncate" title={product.name}>
                                        <Link to={`/products/${product.id}`} className="text-decoration-none text-dark fw-bold">
                                            {product.name}
                                        </Link>
                                    </h2>
                                    <small className="text-body-secondary ms-2">
                                        {product.categories.map((category) => category.name).join(', ') || 'No category'}
                                    </small>
                                    <p
                                        className="card-text text-secondary small flex-grow-1 mb-3"
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                        title={product.description}
                                    >
                                        {product.description || 'No description available'}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="d-flex gap-2 pt-2 border-top">
                                        <Link
                                            to={`/products/${product.id}`}
                                            className="btn btn-outline-primary btn-sm flex-grow-1 fw-semibold"
                                        >
                                            View
                                        </Link>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => startEdit(product)}
                                            title="Edit Product"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => deleteProduct(product.id)}
                                            title="Delete Product"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <nav className="d-flex justify-content-center align-items-center my-4" aria-label="Catalog pages">
                    <ul className="pagination mb-0 shadow-sm rounded-pill overflow-hidden">
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                ‹ Previous
                            </button>
                        </li>
                        <li className="page-item disabled">
                            <span className="page-link text-dark fw-semibold px-3 bg-light">
                                Page {page} of {totalPages}
                            </span>
                        </li>
                        <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next ›
                            </button>
                        </li>
                    </ul>
                </nav>
            )}

            {/* Floating Chat Button */}
            <Link
                to="/chat"
                className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center text-decoration-none"
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '58px',
                    height: '58px',
                    fontSize: '24px',
                    zIndex: 1050
                }}
                title="Chat with AI Assistant"
            >
                🤖
            </Link>
        </div>
    );
}
export default App;
