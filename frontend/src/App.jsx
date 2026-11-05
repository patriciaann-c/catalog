import { useEffect, useState } from 'react';

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
        <>
            <h1>My Store</h1>
            {products.map(product => {
                return (
                    <>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                    </>
                )
            })}
        </>
    )
}

export default App
