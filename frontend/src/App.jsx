import { useEffect, useState } from 'react';
import { Fragment } from 'react';

const API_URL = 'http://localhost:3000';

function App() {
    console.log('Render App');
    const [products, setProducts] = useState([]);


    useEffect(() => {

        fetch(`${API_URL}/products`)
            .then((response) => {
                return response.json()
            }).then((jsonData) => {
                setProducts(jsonData.data)
            })
    }, [])

    return (
        <div className="container py-4">
            <h1 className="h2 mb-4">My Store</h1>
            {products.map((product) => {
                return (
                    <Fragment key={product.id}>
                        <h3 className="h5">{product.name}</h3>
                        <p>{product.description}</p>
                        <p>€ {product.price.toFixed(2)}</p>
                    </Fragment>
                );
            })}
        </div>
    )
}

export default App
