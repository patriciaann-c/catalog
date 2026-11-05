import { Fragment, useEffect, useState } from 'react';
import CreateProduct from '../components/CreateProduct';

const API_URL = 'http://localhost:3000';

function App() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
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
    }, []);

    const handleCreateProduct = (newProduct) => {
        fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Can't create the product");
                }
                return response.json();
            })
            .then((jsonData) => {
                if (!jsonData.success) {
                    throw new Error(jsonData.message);
                }

                setProducts((currentProducts) => [
                    ...currentProducts,
                    jsonData.data,
                ]);
            })
            .catch((err) => {
                console.error(`Error: ${err.message}`);
                setError(err.message);
            });
    };

    return (
        <div className="container py-4">
            <h1 className="h2 mb-4">My Store</h1>

            <CreateProduct onCreate={handleCreateProduct} />

            {error && <div className="alert alert-danger">{error}</div>}

            {products.map((product) => (
                <Fragment key={product.id}>
                    <h3 className="h5">{product.name}</h3>
                    <p>{product.description}</p>
                    <p>€ {product.price.toFixed(2)}</p>
                </Fragment>
            ))}
        </div>
    );
}

export default App;
