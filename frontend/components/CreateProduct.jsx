function createProduct({ onCreate }) {
    const product = {
        name: 'Monitor Opale 27',
        description: 'Monitor da 27 pollici',
        price: 199.9,
    };

    return (
        <button
            className="btn btn-primary mb-3"
            onClick={() => onCreate(product)}
        >
            Add product
        </button>
    );
}

export default createProduct;